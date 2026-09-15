import type { Control } from "./path";
import type { Leg, LegBeat, SceneItem } from "./corridor";
import type { Itinerary, Station } from "./itinerary";

/**
 * The whole trip as ONE continuous world and ONE scroll schedule.
 *
 * The first build gave every leg and every station its own sticky stage. That
 * is what made the view change: one stage unsticks, the next sticks, and the
 * landscape you were walking through is replaced by a different surface. The
 * walk has to be a single unbroken shot — so there is one world, one camera,
 * and arriving somewhere is the camera STOPPING, not the scene being swapped.
 *
 * Scroll therefore maps to camera position non-linearly. Travel segments move
 * the camera. Station segments hold it exactly where it stopped and raise the
 * panel over the view instead.
 */

export type Seg =
  | { kind: "travel"; s0: number; s1: number; z0: number; z1: number; leg: Leg }
  | { kind: "station"; s0: number; s1: number; z: number; station: Station };

export type Schedule = {
  segs: Seg[];
  /** total scroll, in viewport heights */
  screens: number;
  /** total camera travel */
  depth: number;
  items: SceneItem[];
  beats: LegBeat[];
  clock: { z: number; time: string }[];
  controls: Control[];
  /** camera position of each station, by station id */
  stationZ: Record<string, number>;
};

export type ScheduleOpts = {
  /** camera depth covered by one viewport of scroll */
  depthPerScreen?: number;
  /** scroll held at a station, in viewport heights */
  stationScreens?: (s: Station) => number;
};

const DEFAULT_DEPTH_PER_SCREEN = 900;
const defaultStationScreens = (s: Station): number =>
  2.0 + Math.min(2.2, s.richness * 0.32);

/**
 * A station stands a little way ahead of where the camera stops, so she is
 * looking AT the place rather than standing on top of it.
 */
export const STATION_STANDOFF = 420;

/** Which billboard represents a place, by its stop type. */
const PLACE_KIND: Record<string, string> = {
  nature: "pine",
  viewpoint: "cliff",
  history: "tower",
  architecture: "tower",
  art: "mural",
  culture: "mural",
  market: "store",
  food: "store",
  town: "store",
  sight: "falls",
  landmark: "tower",
  attraction: "tower",
  workshop: "studio",
  water: "dock",
};

export function buildSchedule(
  itinerary: Itinerary,
  legs: Record<string, Leg>,
  opts: ScheduleOpts = {},
): Schedule {
  const perScreen = opts.depthPerScreen ?? DEFAULT_DEPTH_PER_SCREEN;
  const holdFor = opts.stationScreens ?? defaultStationScreens;

  const segs: Seg[] = [];
  const items: SceneItem[] = [];
  const beats: LegBeat[] = [];
  const clock: { z: number; time: string }[] = [];
  const controls: Control[] = [];
  const stationZ: Record<string, number> = {};

  let z = 0;
  let s = 0;

  for (const node of itinerary.nodes) {
    if (node.kind === "travel") {
      const leg = legs[node.id];
      // A run with no scenery authored is still WALKED — the camera has to
      // cover that ground or the stations would sit on top of each other. It
      // just passes through bare world rather than being cut out.
      const depth = leg?.depth ?? node.depth;
      const screens = Math.max(1.4, depth / perScreen);

      if (leg) {
        for (const it of leg.items) items.push({ ...it, z: it.z + z });
        for (const b of leg.beats) beats.push({ ...b, z: b.z + z });
        for (const c of leg.clock) clock.push({ z: c.z + z, time: c.time });
        if (leg.path) {
          for (const c of leg.path) {
            const cz = c.z + z;
            // The merged spline MUST be strictly increasing in z. Each leg
            // authors a lead-in before 0 and a lead-out past its own depth, so
            // consecutive legs overlap at the seam — and a control that goes
            // backwards makes the road fold over itself for the whole run.
            if (controls.length > 0 && cz <= (controls[controls.length - 1]?.z ?? 0)) continue;
            controls.push({ z: cz, x: c.x, y: c.y });
          }
        }
        segs.push({ kind: "travel", s0: s, s1: s + screens, z0: z, z1: z + depth, leg });
      } else {
        for (const c of node.clock) clock.push({ z: c.z + z, time: c.time });
        segs.push({
          kind: "travel", s0: s, s1: s + screens, z0: z, z1: z + depth,
          leg: { id: node.id, depth, clock: node.clock, items: [], beats: [] },
        });
      }

      z += depth;
      s += screens;
      continue;
    }

    // ---- a station: the camera stops where it is ----
    const hold = holdFor(node);
    stationZ[node.id] = z;
    clock.push({ z, time: node.stop.time });

    // the place itself, standing just ahead of where you stopped
    const kind = PLACE_KIND[node.stop.type] ?? "store";
    items.push({ z: z + STATION_STANDOFF, x: -130, kind, s: 1.35, label: node.stop.name });

    segs.push({ kind: "station", s0: s, s1: s + hold, z, station: node });
    s += hold;
  }

  return { segs, screens: s, depth: z, items, beats, clock, controls, stationZ };
}

/** Camera position and per-station panel state at a given scroll fraction. */
export type CameraState = {
  z: number;
  /** true while the camera is actually advancing */
  travelling: boolean;
  /** station id -> 0..1 how far its panel is up */
  rise: Record<string, number>;
  /** 0..1 how far the cast have folded down onto the ground */
  sit: number;
  /** the station she is at or closing on — the only one worth loading */
  near: string | null;
};

/** Ease into and out of a stop, so arriving reads as slowing down. */
const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

const ramp = (t: number, a: number, b: number): number => {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const k = (t - a) / (b - a);
  return k * k * (3 - 2 * k);
};

/** Marker replaced by the next station's id once the whole list is known. */
const APPROACHING = "\u0000next";

export function cameraAt(schedule: Schedule, progress: number): CameraState {
  const s = progress * schedule.screens;
  const rise: Record<string, number> = {};
  let z = 0;
  let travelling = false;
  let sit = 0;
  let near: string | null = null;

  for (const seg of schedule.segs) {
    if (seg.kind === "station") {
      // A panel is only ever up during its own segment, so scrolling past a
      // station cannot leave one behind on screen.
      if (s >= seg.s0 && s <= seg.s1) {
        const t = (s - seg.s0) / Math.max(0.0001, seg.s1 - seg.s0);
        // They arrive and sit FIRST; the card follows once they have settled.
        // Raising it while they were still on their feet is what made the
        // arrival feel abrupt — the card beat the people to the place.
        sit = ramp(t, 0, 0.2) * (1 - ramp(t, 0.82, 1));
        rise[seg.station.id] = ramp(t, 0.2, 0.44) * (1 - ramp(t, 0.76, 0.96));
        z = seg.z;
        near = seg.station.id;
      } else {
        rise[seg.station.id] = 0;
      }
      continue;
    }

    if (s >= seg.s0 && s <= seg.s1) {
      const t = (s - seg.s0) / Math.max(0.0001, seg.s1 - seg.s0);
      z = seg.z0 + (seg.z1 - seg.z0) * easeInOut(t);
      travelling = true;
      // Claim the stop at the end of this run once it is close, so its photos
      // are in hand by the time she gets there rather than after.
      if (t > 0.68) near = APPROACHING;
    } else if (s > seg.s1) {
      z = seg.z1;
    }
  }

  if (near === APPROACHING) {
    near = null;
    for (const seg of schedule.segs) {
      if (seg.kind !== "station") continue;
      if (seg.s0 >= s) { near = seg.station.id; break; }
    }
  }

  return { z, travelling, rise, sit, near };
}
