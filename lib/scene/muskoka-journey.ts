import { along, verge, type Leg, type LegBeat, type SceneItem, type Terrain } from "./corridor";
import type { Control } from "./path";
import type { Itinerary, Travel } from "./itinerary";

/**
 * Muskoka, as nine travel runs between eight stations.
 *
 * The runs are NOT authored with their own lengths or clocks — both come from
 * `itineraryFor(trip)`, which derives them from trips.json. Authoring a depth
 * here would let the scenery disagree with the schedule, which is exactly the
 * drift the derivation exists to prevent. What is authored here is what the
 * runs LOOK like, and what is said while walking them.
 */

/** How far the world keeps going beyond where the camera stops. */
const WORLD_TAIL = 2200;

/* ------------------------------------------------------------ the road -- */

/**
 * Controls for a run of road.
 *
 * Bends are seeded from the leg's own index so every run is different and the
 * same run is identical on every reload — a road that re-bends on refresh is
 * the kind of thing you only notice once and then cannot stop noticing.
 */
function road(depth: number, seed: number, amp: number, climb: number): Control[] {
  let a = (seed * 2654435761) >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: Control[] = [{ z: -600, x: 0, y: 0 }, { z: 0, x: 0, y: 0 }];
  const steps = Math.max(3, Math.round(depth / 900));
  let dir = rnd() > 0.5 ? 1 : -1;
  for (let i = 1; i <= steps; i += 1) {
    const z = (depth / steps) * i;
    dir = -dir;
    out.push({ z, x: dir * amp * (0.45 + rnd() * 0.75), y: climb * i * (0.6 + rnd() * 0.8) });
  }
  out.push({ z: depth + 900, x: 0, y: climb * steps });
  return out;
}

/* --------------------------------------------------------- the scenery -- */

/** Road markings and verge posts. Every run has these; they carry the speed. */
function surface(depth: number): SceneItem[] {
  return [
    ...along(60, depth, 95).map((z) => ({ z, x: 0, kind: "dash" })),
    ...along(120, depth, 150).map((z, i) => ({ z, x: i % 2 ? 300 : -300, kind: "post" })),
  ];
}

function cityRun(depth: number, seed: number): SceneItem[] {
  const cityEnd = depth * 0.34;
  const lastLamp = depth * 0.62;
  const lamps: SceneItem[] = [];
  let z = 80;
  let i = 0;
  // Spacing widens until the lights simply stop. "Then the last of the
  // streetlights" is a real position in the world, not a caption.
  while (z < lastLamp) {
    lamps.push({ z, x: (i % 2 === 0 ? -1 : 1) * 168, kind: "lamp", s: 1 });
    z += 150 + (760 - 150) * ((z - 80) / Math.max(1, lastLamp - 80));
    i += 1;
  }
  return [
    ...verge(80, cityEnd, 150, -520, "block", { seed, spread: 220, jitter: 60 }),
    ...verge(140, cityEnd, 160, 520, "block", { seed: seed + 2, spread: 220, jitter: 60 }),
    ...verge(cityEnd, depth * 0.72, 420, -560, "block", { seed: seed + 4, spread: 180, s: 0.9 }),
    ...lamps,
    ...verge(depth * 0.38, depth, 210, -380, "pine", { seed: seed + 6, spread: 260 }),
    ...verge(depth * 0.42, depth, 230, 380, "pine", { seed: seed + 8, spread: 260 }),
    ...verge(depth * 0.6, depth, 340, -300, "birch", { seed: seed + 10, spread: 160, s: 0.9 }),
  ];
}

function townRun(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(100, depth * 0.8, 300, -330, "store", { seed, spread: 90 }),
    ...verge(180, depth * 0.8, 340, 330, "store", { seed: seed + 3, spread: 90 }),
    ...verge(120, depth, 380, -200, "lamp", { seed: seed + 5, spread: 40, s: 0.95 }),
    ...verge(260, depth, 420, 200, "lamp", { seed: seed + 7, spread: 40, s: 0.95 }),
    ...verge(depth * 0.55, depth, 300, -470, "pine", { seed: seed + 9, spread: 200, s: 0.9 }),
  ];
}

function forestRun(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(60, depth, 190, -350, "pine", { seed, spread: 300 }),
    ...verge(140, depth, 200, 350, "pine", { seed: seed + 2, spread: 300 }),
    ...verge(220, depth, 330, -300, "birch", { seed: seed + 4, spread: 220, s: 0.95 }),
    ...verge(300, depth, 360, 300, "maple", { seed: seed + 6, spread: 240 }),
    ...verge(500, depth, 520, 260, "cedar", { seed: seed + 8, spread: 180, s: 0.9 }),
  ];
}

function highwayRun(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(80, depth, 240, -420, "pine", { seed, spread: 340, s: 0.95 }),
    ...verge(160, depth, 260, 420, "pine", { seed: seed + 2, spread: 340, s: 0.95 }),
    ...verge(400, depth, 620, -340, "maple", { seed: seed + 4, spread: 220 }),
    { z: depth * 0.3, x: 250, kind: "sign", label: "11" },
    { z: depth * 0.72, x: -250, kind: "sign", label: "S" },
  ];
}

const SCENERY: Record<Terrain, (d: number, s: number) => SceneItem[]> = {
  city: cityRun,
  town: townRun,
  forest: forestRun,
  highway: highwayRun,
  water: forestRun,
  indoor: townRun,
};

/* ------------------------------------------------------------- the runs -- */

type Authored = {
  title: string;
  terrain: Terrain;
  amp: number;
  climb: number;
  /**
   * Whether it rains on THIS run. Muskoka's October wet-day rate is 0.31, and
   * that number means 31% of October days see rain — not that it rains for 31%
   * of a weekend. Applying it to every run made it rain the entire trip, which
   * is both wrong and miserable. One afternoon carries it, which is what a
   * 31% chance actually looks like when it lands.
   */
  wet?: true;
  /** positions are FRACTIONS of the run, so a depth change cannot strand a line */
  beats: { at: number; voice: LegBeat["voice"]; text: string; hold?: number }[];
};

/**
 * What is said on each run.
 *
 * The two of them ARE the couple — this is them on the weekend, not two
 * narrators describing it. So there is no narrator's voice left in the walk:
 * every line is spoken by one of them, and the facts arrive the way facts
 * arrive between two people who are actually in the car. "Two hours, you'll be
 * asleep before Barrie" IS the drive time from trips.json.
 *
 * A is the one who thinks it will be fine. B is the one who has read the hours.
 * Deliberately few: a line has to stand for about a screen of scrolling to be
 * read, so nine runs carry eighteen lines between them rather than thirty.
 */
const RUNS: Record<string, Authored> = {
  "muskoka-t1": {
    title: "Departure", terrain: "city", amp: 300, climb: 7,
    beats: [
      { at: 0.16, voice: "sun", text: "We're actually doing it." },
      { at: 0.50, voice: "curse", text: "Two hours. You'll be asleep before Barrie." },
      { at: 0.84, voice: "sun", text: "Wake me for the brewery." },
    ],
  },
  "muskoka-t2": {
    title: "The night", terrain: "town", amp: 180, climb: 3,
    beats: [
      { at: 0.30, voice: "sun", text: "There's a waterfall in the middle of the town?" },
      { at: 0.74, voice: "curse", text: "Lit. Quarter past ten. Nobody else there." },
    ],
  },
  "muskoka-t3": {
    title: "North to Huntsville", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0.16, voice: "sun", text: "Lunch standing up. Very romantic." },
      { at: 0.50, voice: "curse", text: "The afternoon's full. That's why." },
      { at: 0.84, voice: "sun", text: "Group of Seven paintings. On the sides of buildings." },
    ],
  },
  "muskoka-t4": {
    title: "To Arrowhead", terrain: "forest", amp: 220, climb: 12,
    beats: [
      { at: 0.24, voice: "curse", text: "Fifteen minutes and the town just stops." },
      { at: 0.76, voice: "sun", text: "Falls are a short walk in from the road." },
    ],
  },
  "muskoka-t5": {
    title: "Up to the lookout", terrain: "forest", amp: 240, climb: 20, wet: true,
    beats: [
      { at: 0.26, voice: "sun", text: "It's raining." },
      { at: 0.74, voice: "curse", text: "Sun still goes down at six. Come on." },
    ],
  },
  "muskoka-t6": {
    title: "The second night", terrain: "town", amp: 190, climb: 4,
    beats: [
      { at: 0.30, voice: "sun", text: "Nobody's rushing us out." },
      { at: 0.74, voice: "curse", text: "Coffee on the wharf before anything opens." },
    ],
  },
  "muskoka-t7": {
    title: "Two streets", terrain: "town", amp: 90, climb: 2,
    beats: [
      { at: 0.5, voice: "sun", text: "It's two streets. We can walk it." },
    ],
  },
  "muskoka-t8": {
    title: "Out to the lake", terrain: "forest", amp: 200, climb: 8,
    beats: [
      { at: 0.28, voice: "curse", text: "North Muldrew Lake Road. Then a driveway." },
      { at: 0.76, voice: "sun", text: "Two hours on a wheel. Neither of us has done this." },
    ],
  },
  "muskoka-t9": {
    title: "Home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0.16, voice: "sun", text: "I'm taking this home wet." },
      { at: 0.50, voice: "curse", text: "Two hours back. Into the light this time." },
      { at: 0.85, voice: "sun", text: "Let's do the next one." },
    ],
  },
};

/* ------------------------------------------------------------- assembly -- */

function legFor(travel: Travel, index: number): Leg | null {
  const a = RUNS[travel.id];
  if (!a) return null;
  const d = travel.depth;
  const seed = 11 + index * 6;

  return {
    id: travel.id,
    title: `${index + 1} · ${a.title}`,
    terrain: a.terrain,
    depth: d,
    path: road(d, seed, a.amp, a.climb),
    // the clock is the derivation's, never re-stated here
    clock: travel.clock,
    // Scenery runs PAST the end of the run. The camera stops at `d`, and if the
    // world stopped there too the last thing she saw would be an empty plain —
    // which is exactly how the final screen came out blank. Trees do not stop
    // at the end of a leg, so neither does this.
    items: [
      ...surface(d + WORLD_TAIL),
      ...(SCENERY[a.terrain]?.(d + WORLD_TAIL, seed) ?? []),
    ],
    beats: a.beats.map((b) => ({
      z: b.at * d,
      voice: b.voice,
      text: b.text,
      // A line has to survive long enough to be READ. The world shrank by 40%
      // when the walking was cut, and these holds shrank with it — every line
      // was on screen for about a third of a screen of scrolling, which is why
      // none of them landed. Measured against the camera's 1900 units per
      // screen, this puts a line up for roughly one full screen.
      hold: b.hold ?? Math.max(620, Math.min(1000, d * 0.3)),
    })),
    // Only the run authored as the wet one, and never overnight — rain you
    // cannot see is just noise on the screen.
    rain: a.wet && !travel.overnight ? 0.31 : undefined,
  };
}

/** Every travel run of the Muskoka trip, keyed by the id the itinerary gave it. */
export function muskokaLegs(itinerary: Itinerary): Record<string, Leg> {
  const out: Record<string, Leg> = {};
  itinerary.travel.forEach((t, i) => {
    const leg = legFor(t, i);
    if (leg) out[t.id] = leg;
  });
  return out;
}
