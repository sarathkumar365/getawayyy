import { NextResponse } from "next/server";
import { searchPlace, hasKey } from "@/lib/places";

/**
 * GET /api/reviews?q=<maps_query>
 *
 * Live rating + recent review text for one place.
 *
 * This ADDS to the file, it does not replace it. trips.json already carries 23
 * rated places and 29 scored lodging options, all stamped `checked: 2026-09-15`
 * — and the curated `praise[]` / `complaints[]` lines are the honest content.
 * Live data renders beside them, labelled "as of today", never blended in.
 *
 * Cached 24h. Google's terms restrict how long review content may be retained,
 * and attribution must be shown — both handled here and in the UI.
 */
export const revalidate = 86400;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "missing q" }, { status: 400 });

  if (!hasKey()) return NextResponse.json({ available: false, reviews: [] });

  try {
    const place = await searchPlace(q, [
      "id",
      "displayName",
      "rating",
      "userRatingCount",
      "businessStatus",
      "reviews",
    ]);
    if (!place) return NextResponse.json({ available: true, found: false, reviews: [] });

    return NextResponse.json({
      available: true,
      found: true,
      checkedAt: new Date().toISOString(),
      place: place.displayName?.text ?? q,
      rating: place.rating ?? null,
      count: place.userRatingCount ?? null,
      // Two venues in this dataset are already known CLOSED_PERMANENTLY.
      // Surfacing status live means a third closure won't go unnoticed.
      status: place.businessStatus ?? null,
      reviews: (place.reviews ?? []).slice(0, 5).map((r) => ({
        rating: r.rating ?? null,
        when: r.relativePublishTimeDescription ?? null,
        text: r.text?.text ?? r.originalText?.text ?? null,
        author: r.authorAttribution?.displayName ?? null,
        authorUri: r.authorAttribution?.uri ?? null,
      })),
      attribution: "Google",
    });
  } catch (err) {
    console.error("[/api/reviews]", err);
    return NextResponse.json({ available: false, reviews: [], error: "lookup failed" }, { status: 502 });
  }
}
