import { NextResponse } from "next/server";
import { searchPlace, hasKey } from "@/lib/places";
import { isKnownQuery } from "@/lib/data";

/**
 * GET /api/photos?q=<maps_query>
 *
 * Returns a list of photo references for a place. The bytes themselves come
 * from /api/photo, so the API key is never in a URL the browser can see.
 *
 * This is the "show me more" overflow. The curated photos shipped in /public
 * are the primary source and need none of this.
 */
export const revalidate = 604800; // 7 days — venue photos barely change

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "missing q" }, { status: 400 });

  // Only the places this site actually has. Google charges per search and this
  // route has no auth on it, so an arbitrary q is someone else spending the key.
  if (!isKnownQuery(q)) return NextResponse.json({ error: "unknown place" }, { status: 404 });

  // No key configured is a normal state, not an error: the site falls back to
  // the bundled photos and the 23 ratings already in trips.json.
  if (!hasKey()) return NextResponse.json({ available: false, photos: [] });

  try {
    const place = await searchPlace(q, ["id", "displayName", "photos"]);
    if (!place) return NextResponse.json({ available: true, photos: [], found: false });

    const photos = (place.photos ?? []).slice(0, 10).map((p) => ({
      ref: p.name,
      width: p.widthPx ?? null,
      height: p.heightPx ?? null,
      // Google requires attribution to be displayed with the photo.
      attribution: (p.authorAttributions ?? []).map((a) => ({
        name: a.displayName ?? null,
        uri: a.uri ?? null,
      })),
    }));

    return NextResponse.json({
      available: true,
      found: true,
      place: place.displayName?.text ?? q,
      photos,
    });
  } catch (err) {
    console.error("[/api/photos]", err);
    return NextResponse.json({ available: false, photos: [], error: "lookup failed" }, { status: 502 });
  }
}
