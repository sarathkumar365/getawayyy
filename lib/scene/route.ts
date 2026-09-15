/**
 * Route geometry, from the real coordinates resolved in Phase 0.
 *
 * What this deliberately does NOT do is draw coastlines, lakes or borders.
 * There is no geographic outline data in this project, and sketching Georgian
 * Bay from memory would be inventing exactly the kind of thing the rest of the
 * build refuses to invent. So this is an honest route DIAGRAM — real positions,
 * real bearings, no fake shoreline — and it is labelled as one.
 */

import { allStops, coordFor, type Coord } from "@/lib/data";
import type { Trip } from "@/lib/types";

/** What kind of place this is — chooses the icon on the map. */
export type PlaceIcon =
  | "origin" | "pottery" | "nature" | "view" | "history" | "architecture"
  | "art" | "market" | "food" | "landmark" | "town" | "water";

/**
 * Several stops share a town, so a place gets ONE icon: whichever of its stops
 * is the most worth drawing. A town with a pottery studio and three cafes is a
 * pottery town — that is the thing you went for.
 */
const ICON_RANK: readonly { icon: PlaceIcon; types: readonly string[] }[] = [
  { icon: "pottery", types: ["workshop"] },
  { icon: "view", types: ["viewpoint"] },
  { icon: "nature", types: ["nature"] },
  { icon: "landmark", types: ["landmark", "attraction"] },
  { icon: "architecture", types: ["architecture"] },
  { icon: "history", types: ["history"] },
  { icon: "art", types: ["art", "culture"] },
  { icon: "market", types: ["market"] },
  { icon: "food", types: ["food"] },
  { icon: "town", types: ["town", "sight"] },
];

function iconFor(types: readonly string[]): PlaceIcon {
  for (const rank of ICON_RANK) {
    if (types.some((t) => rank.types.includes(t))) return rank.icon;
  }
  return "town";
}

export type RoutePoint = {
  /** projected 0–1 within the route's own bounding box */
  x: number;
  y: number;
  name: string;
  /** the stop's clock time, when it has one */
  time: string | null;
  /** coordinate stood in for a nearby place Open-Meteo actually carries */
  approx: boolean;
  /** somewhere you sleep, or the furthest point — rather than somewhere you pass through */
  base: boolean;
  /** show the name (first occurrence only, so an out-and-back is not labelled twice) */
  label: boolean;
  icon: PlaceIcon;
  /** every stop type that happens here, for the tooltip */
  types: string[];
};

export type Route = {
  points: RoutePoint[];
  /** great-circle-ish bearing from Toronto, degrees clockwise from north */
  bearing: number;
  km: number;
  /** aspect ratio of the projected box, width / height */
  aspect: number;
  /** real kilometres represented by one unit of the 0–1 projection */
  kmPerUnit: number;
};

const TORONTO: Coord = { lat: 43.70011, lon: -79.4163, name: "Toronto", admin: "Ontario" };

/**
 * Equirectangular, with longitude scaled by cos(latitude).
 *
 * At these latitudes a degree of longitude is about 72% of a degree of latitude,
 * so skipping that correction stretches every route sideways and makes the
 * eastern trips look shorter than the northern ones. Which is the opposite of
 * the truth.
 */
function project(c: Coord, lat0: number): [number, number] {
  const k = Math.cos((lat0 * Math.PI) / 180);
  return [c.lon * k, c.lat];
}

export function routeFor(trip: Trip): Route {
  const raw: { c: Coord; name: string; time: string | null; types: string[] }[] = [];
  raw.push({ c: TORONTO, name: "Toronto", time: null, types: [] });

  for (const stop of allStops(trip)) {
    const c = coordFor(stop.maps_query ?? null);
    if (!c) continue;
    const prev = raw[raw.length - 1];
    // one point per place: a day with five stops in one town is one dot, and it
    // collects their types so the icon can reflect what you actually do there
    if (prev && prev.c.name === c.name) {
      if (stop.type && !prev.types.includes(stop.type)) prev.types.push(stop.type);
      continue;
    }
    raw.push({ c, name: c.name, time: stop.time, types: stop.type ? [stop.type] : [] });
  }

  const lat0 = raw.reduce((s, r) => s + r.c.lat, 0) / Math.max(1, raw.length);
  const xy = raw.map((r) => project(r.c, lat0));

  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.max(1e-6, maxX - minX);
  const h = Math.max(1e-6, maxY - minY);

  /**
   * ONE scale for both axes.
   *
   * Normalising x and y independently stretches whichever span is smaller to
   * fill the box — which turned Muskoka, a due-north trip, into a diagonal.
   * A route diagram whose direction is wrong is worse than no diagram.
   */
  const span = Math.max(w, h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const base = new Set<string>();
  const baseTown = trip.stats?.base_town ?? "";
  for (const r of raw) {
    if (baseTown.toLowerCase().includes(r.name.toLowerCase())) base.add(r.name);
  }

  // furthest place from Toronto — worth naming even when you do not sleep there
  let far = 1;
  let farD = -1;
  xy.forEach((p, i) => {
    const o = xy[0] ?? [0, 0];
    const dd = (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2;
    if (dd > farD) { farD = dd; far = i; }
  });

  const seenLabel = new Set<string>();
  const points: RoutePoint[] = raw.map((r, i) => {
    const p = xy[i] ?? [0, 0];
    const isBase = base.has(r.name) || i === far;
    const label = isBase && !seenLabel.has(r.name);
    if (label) seenLabel.add(r.name);
    return {
      x: 0.5 + (p[0] - cx) / span,
      // flip: north is up
      y: 0.5 - (p[1] - cy) / span,
      name: r.name,
      time: r.time,
      approx: r.c.approx === true,
      base: isBase,
      label,
      icon: i === 0 ? "origin" : iconFor(r.types),
      types: r.types,
    };
  });

  // real km per projected unit, from the longest leg — gives an honest scale bar
  let kmPerUnit = 0;
  for (let i = 1; i < raw.length; i += 1) {
    const a = raw[i - 1];
    const b = raw[i];
    const pa = xy[i - 1];
    const pb = xy[i];
    if (!a || !b || !pa || !pb) continue;
    const projected = Math.hypot((pb[0] - pa[0]) / span, (pb[1] - pa[1]) / span);
    if (projected < 0.02) continue;
    kmPerUnit = Math.max(kmPerUnit, haversine(a.c, b.c) / projected);
  }

  return {
    points,
    bearing: trip.bearing_deg ?? bearingFrom(TORONTO, raw[1]?.c ?? TORONTO),
    km: trip.stats?.distance_km ?? 0,
    // square, because both axes now share one scale
    aspect: 1,
    kmPerUnit,
  };
}

/** Straight-line distance in km. Road distance is longer; the scale bar says so. */
function haversine(a: Coord, b: Coord): number {
  const R = 6371;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function bearingFrom(a: Coord, b: Coord): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

export const COMPASS = (deg: number): string => {
  const names = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return names[Math.round(deg / 22.5) % 16] ?? "N";
};
