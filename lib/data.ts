import raw from "@/trips.json";
import coordsRaw from "@/data/coords.json";
import type { TripsFile, Trip, Stop, Day } from "./types";

/**
 * trips.json is static and never changes at runtime, so it is imported
 * directly and prerendered. There is no API behind it.
 */
export const data = raw as unknown as TripsFile;

export const meta = data.meta;
export const shared = data.shared;
export const research = data.research_notes;
export const sources = data.sources;

/** All six, in the order the file defines. */
export const allTrips: Trip[] = [...data.trips].sort((a, b) => a.order - b.order);

/** The five that belong in the main listing. `kingston-pec` is featured:false. */
export const featuredTrips: Trip[] = allTrips.filter((t) => t.featured);

const bySlug = new Map(allTrips.map((t) => [t.slug, t]));
const byId = new Map(allTrips.map((t) => [t.id, t]));

export const tripBySlug = (slug: string): Trip | undefined => bySlug.get(slug);
export const tripById = (id: string): Trip | undefined => byId.get(id);

/**
 * muskoka <-> algonquin-haliburton point at each other via alternative_to.
 * They are two versions of the same north trip and must never be listed as
 * unrelated offerings.
 */
export function pairedWith(trip: Trip): Trip | undefined {
  return trip.alternative_to ? byId.get(trip.alternative_to) : undefined;
}

/** Trips grouped so a paired set renders as one unit. */
export function groupedForListing(): (Trip | Trip[])[] {
  const out: (Trip | Trip[])[] = [];
  const claimed = new Set<string>();
  for (const t of featuredTrips) {
    if (claimed.has(t.id)) continue;
    const mate = pairedWith(t);
    if (mate && mate.featured) {
      out.push([t, mate]);
      claimed.add(t.id);
      claimed.add(mate.id);
    } else {
      out.push(t);
      claimed.add(t.id);
    }
  }
  return out;
}

export const allStops = (trip: Trip): Stop[] => trip.days.flatMap((d: Day) => d.stops);
export const stopCount = (trip: Trip): number => allStops(trip).length;

/** Sources are tagged by trip id. Two trips have none — callers must check length. */
export const sourcesFor = (tripId: string) => sources.filter((s) => s.trip === tripId);

/* ---------------------------------------------------------------- coords -- */

export type Coord = {
  lat: number;
  lon: number;
  name: string;
  admin: string | null;
  approx?: true;
};

const coords = coordsRaw as unknown as {
  towns: Record<string, Coord>;
  queryToTown: Record<string, string>;
  unresolved: string[];
};

/**
 * trips.json carries no lat/lng by design — only `maps_query`. These come from
 * the build-time Open-Meteo pass (`bun run geocode`), at town-level precision.
 * `approx: true` means a nearby settlement stood in for a place Open-Meteo
 * has no record of. Nothing here is hand-entered.
 */
export function coordFor(mapsQuery: string | null): Coord | undefined {
  if (!mapsQuery) return undefined;
  const town = coords.queryToTown[mapsQuery];
  return town ? coords.towns[town] : undefined;
}

/** Google Maps deep link. The query string is what the file gives us. */
export const mapsUrl = (mapsQuery: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

/**
 * Every `maps_query` the site will ever ask for.
 *
 * /api/photos calls a BILLED Google endpoint and sits on a public URL with no
 * auth in front of it, so without this anyone who finds the link can spend the
 * key on arbitrary searches. The site itself only ever looks up a stop's own
 * query, and every one of them is in this file — so the allowlist is exact
 * rather than a guess, and a query that is not in it is not a query this site
 * makes.
 */
const QUERIES: ReadonlySet<string> = new Set(
  allTrips.flatMap((t) => allStops(t))
    .map((s) => s.maps_query)
    .filter((q): q is string => Boolean(q)),
);

export const isKnownQuery = (q: string): boolean => QUERIES.has(q);
