import { photoMediaUrl, hasKey } from "@/lib/places";

/**
 * GET /api/photo?ref=<photoName>&w=1024
 *
 * Proxies the image bytes so the API key stays server-side. Cached for a week
 * at the edge — the iPad should never fetch the same photo twice.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ref = params.get("ref");
  const w = Math.min(Math.max(Number(params.get("w") ?? 1024), 200), 1600);

  if (!ref) return new Response("missing ref", { status: 400 });
  // Photo resource names look like "places/<id>/photos/<token>". Anything else
  // is someone poking at the proxy.
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(ref)) {
    return new Response("bad ref", { status: 400 });
  }
  if (!hasKey()) return new Response("unavailable", { status: 503 });

  try {
    // skipHttpRedirect makes Places return JSON containing the real media URI.
    const meta = await fetch(photoMediaUrl(ref, w), { next: { revalidate: 604800 } });
    if (!meta.ok) return new Response("upstream error", { status: 502 });
    const { photoUri } = (await meta.json()) as { photoUri?: string };
    if (!photoUri) return new Response("no photo", { status: 404 });

    const img = await fetch(photoUri, { next: { revalidate: 604800 } });
    if (!img.ok || !img.body) return new Response("upstream error", { status: 502 });

    return new Response(img.body, {
      headers: {
        "Content-Type": img.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
      },
    });
  } catch (err) {
    console.error("[/api/photo]", err);
    return new Response("proxy failed", { status: 502 });
  }
}
