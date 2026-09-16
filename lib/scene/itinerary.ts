/**
 * A trip, rebuilt as the thing you actually walk: an alternating sequence of
 * travel runs and places you stop at.
 *
 *   Travel -> Station -> Travel -> Station -> ... -> Travel
 *
 * Nothing here is hand-authored. Stations are DERIVED from trips.json by a
 * single rule, so the five trips cannot drift apart and a data correction can
 * never leave a hand-picked list stale. Non-station stops are not discarded —
 * they become the narration and scenery of the travel run that contains them.
 */

import { allStops, tripById } from "@/lib/data";
import { stopKey } from "@/lib/keys";
import { photosForStop } from "@/lib/photos";
import audit from "@/data/photo-audit.json";
import type { Stop, Trip } from "@/lib/types";

/* ------------------------------------------------------------ the rule -- */

/**
 * Types that are movement or a meal rather than a place you explore. These
 * carry almost no panel content — a `drive` stop is a duration and a road.
 */
const PASSING_TYPES: ReadonlySet<string> = new Set([
  "drive", "travel", "food", "drive-and-explore",
]);

/**
 * A stop earns a station when it is somewhere you go, OR when it carries real
 * researched detail regardless of its type.
 *
 * The escape hatch is not a fudge: the only `food` stops with review data are
 * the two Korean meals, which are squarely one of her stated interests. A rule
 * that dropped them would be wrong about the trip, not just about the schema.
 */
export function isStation(stop: Stop): boolean {
  if (!PASSING_TYPES.has(stop.type)) return true;
  return Boolean(stop.reviews || stop.trail || stop.trail_options || stop.options);
}

/* -------------------------------------------------------------- shapes -- */

export type Station = {
  kind: "station";
  id: string;
  /** the key `lib/answers.ts` stores her reaction and note under */
  key: string;
  tripId: string;
  day: number;
  dayLabel: string;
  stop: Stop;
  /** 1-based across the whole trip, for "3 of 8" */
  index: number;
  /** how many distinct blocks the panel will have — drives how long it holds */
  richness: number;
  /** photos available to the gallery, local first, else what Google holds */
  photos: number;
};

export type Travel = {
  kind: "travel";
  id: string;
  tripId: string;
  /** the day this run starts on */
  day: number;
  /** stops crossed but not explorable: narration lines and scenery */
  passing: Stop[];
  /** camera travel, in the same units as `corridor.ts` z */
  depth: number;
  /** clock anchors along the run, feeding the sky */
  clock: { z: number; time: string }[];
  /** the station either side, or null at the start and end of the trip */
  from: Station | null;
  to: Station | null;
  /** this run crosses a night in a bed, not a gap in the driving */
  overnight: boolean;
};

export type Node = Station | Travel;

export type Itinerary = {
  tripId: string;
  nodes: Node[];
  stations: Station[];
  travel: Travel[];
};

/* --------------------------------------------------------------- depth -- */

/**
 * Real minutes, compressed.
 *
 * Linear scaling would make the 3h15 run to Quebec City six times the scroll of
 * a 30-minute hop, which is honest about the clock and miserable to read. The
 * square root keeps the ORDER true — a long drive is always longer than a short
 * one — while pulling the ratio down to about 2x. The clock label on screen
 * still reports the real time, so nothing is being claimed falsely.
 */
/**
 * One factor on the whole world.
 *
 * Shortening the walk by moving the camera FASTER would have broken the look:
 * at 1900 units of ground per viewport the camera already covers most of what
 * it can see in a single screen, and any faster makes props appear and vanish
 * within one. So the ground itself gets shorter instead. Applied to every term
 * below, so the runs keep their proportions exactly.
 */
const DEPTH_SCALE = 0.6;

const DEPTH_FLOOR = 1500;
const DEPTH_K = 260;
const DEPTH_CEIL = 6200;
/** A night in a bed is one held beat, not eleven hours of scrolling. */
const NIGHT_DEPTH = 2600;
/**
 * Two stations can abut with no stop recorded between them. You still walk from
 * one to the other, so the run is emitted rather than cut — just shorter, since
 * there is nothing to narrate across it.
 */
const LINK_FLOOR = 700;

function depthFor(minutes: number, overnight: boolean, empty: boolean): number {
  if (overnight) return Math.round(NIGHT_DEPTH * DEPTH_SCALE);
  const m = Math.max(0, minutes);
  const floor = empty ? LINK_FLOOR : DEPTH_FLOOR;
  const d = Math.min(DEPTH_CEIL, floor + DEPTH_K * Math.sqrt(m));
  return Math.round(d * DEPTH_SCALE);
}

/* -------------------------------------------------------------- photos -- */

const AUDIT = (audit as { queries: Record<string, { count: number }> }).queries;

/**
 * How many photos a station can actually show.
 *
 * Local files win: they are his own, already on disk, and need no network. The
 * Phase 0 audit is the fallback, and it is a COUNT OF WHAT GOOGLE HOLDS, not of
 * what has been fetched — the bytes are still proxied on demand. It is used here
 * only to decide how much room a station deserves, never presented as a promise.
 */
export function photoCountFor(stop: Stop): number {
  const local = photosForStop(stop.name).length;
  if (local > 0) return local;
  return stop.maps_query ? (AUDIT[stop.maps_query]?.count ?? 0) : 0;
}

/* ---------------------------------------------------------- panel size -- */

/**
 * How much there is to show. Counts the blocks `StationPanel` will render, so a
 * stop with reviews, a trail and a warning holds longer than a lookout with a
 * name and a cost. Counted from the data, never guessed per stop.
 */
export function richness(stop: Stop): number {
  let n = 1; // name, time and description are always a block
  // 17 of the 37 stations carry nothing but that block. For those the gallery
  // IS the content, so it has to count toward how long they hold.
  if (photoCountFor(stop) >= 4) n += 1;
  if (stop.reviews) n += 1;
  if (stop.trail || stop.trail_options) n += 1;
  if (stop.options || stop.alternatives_nearby) n += 1;
  if (stop.tips?.length) n += 1;
  if (stop.caveat || stop.correction || stop.closed_since_v1 || stop.removed) n += 1;
  if (stop.hours || stop.season || stop.booking || stop.phone) n += 1;
  return n;
}

/* --------------------------------------------------------------- clock -- */

export function toMinutes(time: string): number {
  const [h, m] = time.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
}

export function fromMinutes(total: number): string {
  const w = ((Math.round(total) % 1440) + 1440) % 1440;
  const hh = Math.floor(w / 60);
  const mm = w % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** When a stop is finished with, by its own clock and duration. */
export const endOf = (stop: Stop): string =>
  fromMinutes(toMinutes(stop.time) + (stop.duration_min ?? 0));

/* ----------------------------------------------------------- derivation -- */

type Positioned = { stop: Stop; day: number; dayLabel: string };

function positioned(trip: Trip): Positioned[] {
  return trip.days.flatMap((d) =>
    d.stops.map((stop) => ({ stop, day: d.day, dayLabel: d.label })),
  );
}

export function itineraryFor(trip: Trip): Itinerary {
  const flat = positioned(trip);
  const stations: Station[] = [];
  const travel: Travel[] = [];
  const nodes: Node[] = [];

  let run: Positioned[] = [];
  let index = 0;

  const flushTravel = (to: Station | null): void => {
    const from = stations[stations.length - 1] ?? null;
    // A trip that ends on a station still has a run home, so an empty trailing
    // run is kept. The only thing dropped is a run before the very first stop,
    // which would have no clock to span.
    if (run.length === 0 && !from && !to) return;

    const day = run[0]?.day ?? to?.day ?? from?.day ?? 0;
    const overnight = Boolean(from && to && to.day > from.day);

    const startTime = from ? endOf(from.stop) : (run[0]?.stop.time ?? "00:00");
    const endTime = to ? to.stop.time : (run[run.length - 1] ? endOf(run[run.length - 1]!.stop) : startTime);

    // Elapsed minutes across the run. An overnight wraps past midnight, so a
    // raw subtraction goes negative — add the day back rather than clamping to
    // zero, which would silently claim the night took no time.
    let minutes = toMinutes(endTime) - toMinutes(startTime);
    if (minutes < 0) minutes += 1440;

    const depth = depthFor(minutes, overnight, run.length === 0);

    const clock: { z: number; time: string }[] = [{ z: 0, time: startTime }];
    for (const p of run) {
      let k = toMinutes(p.stop.time) - toMinutes(startTime);
      if (k < 0) k += 1440;
      if (minutes > 0) clock.push({ z: (k / minutes) * depth, time: p.stop.time });
    }
    clock.push({ z: depth, time: endTime });

    const leg: Travel = {
      kind: "travel",
      id: `${trip.id}-t${travel.length + 1}`,
      tripId: trip.id,
      day,
      passing: run.map((p) => p.stop),
      depth,
      clock,
      from,
      to,
      overnight,
    };
    travel.push(leg);
    nodes.push(leg);
    run = [];
  };

  for (const p of flat) {
    if (!isStation(p.stop)) {
      run.push(p);
      continue;
    }
    index += 1;
    const station: Station = {
      kind: "station",
      id: `${trip.id}-d${p.day}-${p.stop.time.replace(":", "")}`,
      key: stopKey(trip.id, p.day, p.stop.time),
      tripId: trip.id,
      day: p.day,
      dayLabel: p.dayLabel,
      stop: p.stop,
      index,
      richness: richness(p.stop),
      photos: photoCountFor(p.stop),
    };
    flushTravel(station);
    stations.push(station);
    nodes.push(station);
  }
  // whatever is left is the run home
  flushTravel(null);

  return { tripId: trip.id, nodes, stations, travel };
}

export function itineraryById(tripId: string): Itinerary | undefined {
  const trip = tripById(tripId);
  return trip ? itineraryFor(trip) : undefined;
}

/** Total camera travel, for laying out the scroll spacers. */
export const travelDepth = (it: Itinerary): number =>
  it.travel.reduce((n, t) => n + t.depth, 0);

/** Sanity figure used by the verification script. */
export const stationCount = (trip: Trip): number =>
  allStops(trip).filter(isStation).length;
