/**
 * Google Places (New) helpers. Server-only — the key never reaches the client,
 * and photo bytes are proxied through /api/photo so the URL can't leak it.
 */

const BASE = "https://places.googleapis.com/v1";

export const hasKey = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

function key(): string {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  if (!k) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return k;
}

export type PlaceHit = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  photos?: { name: string; widthPx?: number; heightPx?: number;
    authorAttributions?: { displayName?: string; uri?: string }[] }[];
  reviews?: {
    name?: string;
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
    publishTime?: string;
  }[];
};

/**
 * trips.json gives us `maps_query` strings, not place ids — so every lookup
 * starts with a text search. One extra call, cached hard at the edge.
 */
export async function searchPlace(query: string, fields: string[]): Promise<PlaceHit | null> {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key(),
      "X-Goog-FieldMask": fields.map((f) => `places.${f}`).join(","),
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: "en" }),
    // Next's own fetch cache; the response is also cached at the CDN edge.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error(`Places searchText ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as { places?: PlaceHit[] };
  return json.places?.[0] ?? null;
}

/** Streamable photo bytes for one photo resource name. */
export function photoMediaUrl(photoName: string, maxWidthPx: number): string {
  const p = new URLSearchParams({
    maxWidthPx: String(maxWidthPx),
    key: key(),
    skipHttpRedirect: "true",
  });
  return `${BASE}/${photoName}/media?${p}`;
}
