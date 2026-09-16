/**
 * The model behind a trip's map.
 *
 * Built from the same Phase-0 coordinates the weather and the route diagram
 * use — town-level, from Open-Meteo, none of them hand-entered. Nothing here
 * invents geometry: no coastlines, no lakes, no roads that bend. What it knows
 * is where the towns are relative to each other, which day you are in when you
 * reach each one, and how far the whole thing is from home.
 *
 * Two of the five trips are city trips. Every stop on them resolves to the one
 * city coordinate, so their spread is zero and a geographic plot would be a
 * single dot with five labels pointing at it. `geographic` says so, and the map
 * draws those as a line of stops in order instead — which is the true shape of
 * a day spent walking around Old Montreal.
 */

import { allStops, coordFor, type Coord } from "@/lib/data";
import type { Trip, Day, Stop } from "@/lib/types";

const TORONTO: Coord = { lat: 43.70011, lon: -79.4163, name: "Toronto", admin: "Ontario" };

/** Below this the places are one place, and a plot of them is a lie. */
const SPREAD_FLOOR_KM = 3;

/** Friday in, Saturday out, Sunday home — the artifact map's own three inks. */
const DAY_INK = ["#b4832c", "#2f5d52", "#9c4a2f", "#3d5a80"] as const;

export type MapPlace = {
  key: string;
  name: string;
  /** 0–1 inside the trip's own bounding box, north up. Meaningless when !geographic. */
  x: number;
  y: number;
  /** a nearby settlement stood in for this one */
  approx: boolean;
  /** first time the route touches this place */
  first: boolean;
  /** where you sleep */
  base: boolean;
  /** what happens here, in order */
  stops: { name: string; time: string }[];
};

export type MapDay = {
  day: number;
  label: string;
  ink: string;
  places: MapPlace[];
  /** Google Maps, origin to destination through the middle. Null when one place. */
  route: string | null;
};

export type TripMapModel = {
  tripId: string;
  days: MapDay[];
  places: MapPlace[];
  /** true when the places are far enough apart to plot honestly */
  geographic: boolean;
  spreadKm: number;
  /** real kilometres per unit of the 0–1 projection */
  kmPerUnit: number;
  /** direction and distance home, for the arrow off the edge */
  toronto: { bearing: number; km: number } | null;
  baseTown: string | null;
};

/* --------------------------------------------------------------- geometry -- */

function project(c: Coord, lat0: number): [number, number] {
  const k = Math.cos((lat0 * Math.PI) / 180);
  return [c.lon * k, c.lat];
}

export function haversine(a: Coord, b: Coord): number {
  const R = 6371;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function bearing(a: Coord, b: Coord): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

/* ----------------------------------------------------------------- links -- */

/**
 * One Maps link per day: first stop to last, through the ones between.
 *
 * Maps takes nine waypoints. A day with more than eleven stops would lose the
 * tail silently, so the middle is thinned evenly rather than truncated — you
 * still get the day's real shape, just fewer turns spelled out.
 */
function routeLink(stops: readonly Stop[]): string | null {
  const q = stops.map((s) => s.maps_query).filter((s): s is string => Boolean(s));
  const seen: string[] = [];
  for (const s of q) if (seen[seen.length - 1] !== s) seen.push(s);
  if (seen.length < 2) return null;

  const origin = seen[0] as string;
  const destination = seen[seen.length - 1] as string;
  const middle = seen.slice(1, -1);
  const thinned = middle.length <= 9
    ? middle
    : middle.filter((_, i) => i % Math.ceil(middle.length / 9) === 0).slice(0, 9);

  const params = new URLSearchParams({ api: "1", origin, destination, travelmode: "driving" });
  if (thinned.length > 0) params.set("waypoints", thinned.join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/* ----------------------------------------------------------------- model -- */

export function mapModelFor(trip: Trip): TripMapModel {
  /* Resolve every stop to a town, collapsing runs: five stops in Huntsville are
     one dot that knows about five stops. */
  type Raw = { c: Coord; day: number; stops: { name: string; time: string }[] };
  const raw: Raw[] = [];
  const dayOf = new Map<Raw, number>();

  for (const day of trip.days as Day[]) {
    for (const stop of day.stops) {
      const c = coordFor(stop.maps_query ?? null);
      if (!c) continue;
      const prev = raw[raw.length - 1];
      if (prev && prev.c.name === c.name && prev.day === day.day) {
        prev.stops.push({ name: stop.name, time: stop.time });
        continue;
      }
      const r: Raw = { c, day: day.day, stops: [{ name: stop.name, time: stop.time }] };
      raw.push(r);
      dayOf.set(r, day.day);
    }
  }

  const lat0 = raw.length > 0 ? raw.reduce((s, r) => s + r.c.lat, 0) / raw.length : 45;
  const xy = raw.map((r) => project(r.c, lat0));
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  /* The bounding box is the PLACES, and nothing else. Seeding it with 0 put the
     equator and the prime meridian in the box: every town then landed inside
     one pixel of the corner. */
  const minX = xs.length > 0 ? Math.min(...xs) : 0;
  const maxX = xs.length > 0 ? Math.max(...xs) : 1;
  const minY = ys.length > 0 ? Math.min(...ys) : 0;
  const maxY = ys.length > 0 ? Math.max(...ys) : 1;

  /* One scale on both axes, or a due-north trip comes out diagonal. */
  const span = Math.max(1e-9, maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  let spreadKm = 0;
  for (const a of raw) for (const b of raw) spreadKm = Math.max(spreadKm, haversine(a.c, b.c));

  const baseTown = trip.stats?.base_town ?? null;
  const seen = new Set<string>();

  const places: MapPlace[] = raw.map((r, i) => {
    const p = xy[i] ?? [0, 0];
    const first = !seen.has(r.c.name);
    if (first) seen.add(r.c.name);
    return {
      key: `${r.c.name}-${i}`,
      name: r.c.name,
      x: 0.5 + (p[0] - cx) / span,
      y: 0.5 - (p[1] - cy) / span, // north up
      approx: r.c.approx === true,
      first,
      base: Boolean(baseTown && baseTown.toLowerCase().includes(r.c.name.toLowerCase())),
      stops: r.stops,
    };
  });

  const days: MapDay[] = (trip.days as Day[]).map((d, i) => ({
    day: d.day,
    label: d.label,
    ink: DAY_INK[i % DAY_INK.length] as string,
    places: places.filter((_, j) => raw[j]?.day === d.day),
    route: routeLink(d.stops),
  }));

  /* Kilometres per projected unit, from the longest leg that is actually long
     enough to measure against. */
  let kmPerUnit = 0;
  for (let i = 1; i < raw.length; i += 1) {
    const a = raw[i - 1];
    const b = raw[i];
    const pa = xy[i - 1];
    const pb = xy[i];
    if (!a || !b || !pa || !pb) continue;
    const d = Math.hypot((pb[0] - pa[0]) / span, (pb[1] - pa[1]) / span);
    if (d < 0.02) continue;
    kmPerUnit = Math.max(kmPerUnit, haversine(a.c, b.c) / d);
  }

  const anchor = raw[0]?.c;
  return {
    tripId: trip.id,
    days,
    places,
    geographic: spreadKm >= SPREAD_FLOOR_KM,
    spreadKm,
    kmPerUnit,
    toronto: anchor
      ? { bearing: bearing(anchor, TORONTO), km: Math.round(haversine(anchor, TORONTO)) }
      : null,
    baseTown,
  };
}

/** Every stop on the trip, for the days that carry no coordinates of their own. */
export const stopsOf = allStops;
