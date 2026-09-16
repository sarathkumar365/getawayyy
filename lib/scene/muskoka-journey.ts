import { along, verge, type Leg, type LegBeat, type SceneItem, type Terrain } from "./corridor";
import type { Control } from "./path";
import type { ArrivalLine } from "./corridor";
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
  /** In order. Where each lands is worked out from how long it is. */
  beats: { at?: number; voice: LegBeat["voice"]; text: string; hold?: number; face?: LegBeat["face"] }[];
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
    title: "Out of the city", terrain: "city", amp: 300, climb: 7,
    beats: [
      { at: 0.12, voice: "curse", text: "Right. Six o'clock, Friday. A hundred and seventy kilometres of this.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "And we get there when?",
        face: { brow: "raised", eye: "open" } },
      { at: 0.68, voice: "curse", text: "Gravenhurst by eight, if the 400 behaves. Dinner's in an old sawmill — open till eleven.",
        face: { mouth: "smile" } },
      { at: 0.92, voice: "sun", text: "Wake me up for that bit.",
        face: { eye: "closed", mouth: "smile" } },
    ],
  },
  "muskoka-t2": {
    title: "The first night", terrain: "town", amp: 180, climb: 3,
    beats: [
      { at: 0.3, voice: "sun", text: "I can hear it from the room.", face: { eye: "closed", mouth: "smile" } },
      { at: 0.74, voice: "curse", text: "Four streets away, and it does that all night.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t3": {
    title: "Saturday, north", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0.12, voice: "sun", text: "That train was older than I thought it would be.",
        face: { brow: "raised", mouth: "smile" } },
      { at: 0.42, voice: "curse", text: "Today was the last day it runs this year. One day later and we'd have missed it.",
        face: { brow: "flat", mouth: "smirk" } },
      { at: 0.70, voice: "sun", text: "You planned that.", face: { eye: "half", mouth: "smirk" } },
      { at: 0.92, voice: "curse", text: "Lunch is standing up on the main street. The afternoon's tight.",
        face: { mouth: "closed" } },
    ],
  },
  "muskoka-t4": {
    title: "Into the trees", terrain: "forest", amp: 220, climb: 12,
    beats: [
      { at: 0.16, voice: "sun", text: "Okay, the paintings on the buildings were good. I'll give you that one.",
        face: { mouth: "grin" } },
      { at: 0.52, voice: "curse", text: "Fifteen minutes and the town just stops.", face: { mouth: "closed" } },
      { at: 0.86, voice: "sun", text: "How far is the waterfall from the car?",
        face: { brow: "furrowed", eye: "half" } },
    ],
  },
  "muskoka-t5": {
    title: "The climb, in the rain", terrain: "forest", amp: 240, climb: 20, wet: true,
    beats: [
      { at: 0.08, voice: "sun", text: "Oh no. It's started raining.", face: { brow: "worried", eye: "wide", mouth: "open" } },
      { at: 0.28, voice: "curse", text: "It'll pass. It always does up here.", face: { mouth: "closed" } },
      { at: 0.48, voice: "sun", text: "How much more of this? My legs are done.",
        face: { brow: "worried", eye: "closed", mouth: "frown", emote: "sweat" } },
      { at: 0.68, voice: "curse", text: "Ten minutes. Then you'll see why I did this to you.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0.86, voice: "sun", text: "It had better be incredible.", face: { brow: "flat", eye: "half", mouth: "flat" } },
      { at: 0.97, voice: "curse", text: "Sun goes down at six. Come on.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t6": {
    title: "The slow morning", terrain: "town", amp: 190, climb: 4,
    beats: [
      { at: 0.16, voice: "sun", text: "Nobody made us leave last night. We sat there for two hours.",
        face: { mouth: "smile" } },
      { at: 0.50, voice: "curse", text: "Coffee on the wharf before anything opens. Today's the slow one.",
        face: { mouth: "smile" } },
      { at: 0.84, voice: "sun", text: "Define slow.", face: { brow: "raised", eye: "half" } },
    ],
  },
  "muskoka-t7": {
    title: "Two streets", terrain: "town", amp: 90, climb: 2,
    beats: [
      { at: 0.18, voice: "sun", text: "You said two streets.", face: { brow: "flat", eye: "half" } },
      { at: 0.54, voice: "curse", text: "It is two streets.", face: { mouth: "closed" } },
      { at: 0.88, voice: "sun", text: "You said that about the hill as well.",
        face: { brow: "flat", mouth: "flat" } },
    ],
  },
  "muskoka-t8": {
    title: "The one he built it around", terrain: "forest", amp: 200, climb: 8,
    beats: [
      { at: 0.14, voice: "sun", text: "Where are we going? There's nothing out here.",
        face: { brow: "raised", eye: "open" } },
      { at: 0.44, voice: "curse", text: "North Muldrew Lake Road. Then a driveway with no sign on it.",
        face: { mouth: "closed" } },
      { at: 0.72, voice: "sun", text: "…You booked something.", face: { eye: "wide", mouth: "open" } },
      { at: 0.93, voice: "curse", text: "Two hours at a wheel. I booked it before the room.",
        face: { mouth: "smile" } },
    ],
  },
  "muskoka-t9": {
    title: "Home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0.10, voice: "sun", text: "My hands are still grey.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.34, voice: "curse", text: "They fire it and post it to you. Three weeks.", face: { mouth: "smile" } },
      { at: 0.56, voice: "sun", text: "Two hours back?", face: { brow: "raised" } },
      { at: 0.76, voice: "curse", text: "Home by quarter to six. Into the light this time.", face: { mouth: "smile" } },
      { at: 0.94, voice: "sun", text: "Do the next one. The one with the lake you can swim in.",
        face: { eye: "sparkle", mouth: "grin", emote: "sparkle" } },
    ],
  },
};

/**
 * What they say on ARRIVING somewhere, before the card comes up.
 *
 * Keyed by station id — `${trip}-d${day}-${time without the colon}`. Only the
 * stops worth a reaction have any; standing in front of a place saying nothing
 * is fine, and a line at every one of them would be noise.
 */
const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "muskoka-d0-2215": [
    { voice: "sun", text: "Wait. Stop — look at that.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Bracebridge Falls. It's in the middle of the town.", face: { mouth: "smile" } },
    { voice: "sun", text: "It's lit up. At half ten at night.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "And there's nobody here. That's why it's on the list.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-0930": [
    { voice: "curse", text: "Pioneer village, and the steam train runs today.", face: { mouth: "smile" } },
    { voice: "sun", text: "An actual steam train?", face: { eye: "wide", emote: "sparkle" } },
  ],
  "muskoka-d1-1500": [
    { voice: "sun", text: "Okay. That was worth the walk in.", face: { mouth: "grin" } },
    { voice: "curse", text: "Stubb's Falls. The lookout's further up.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-1800": [
    { voice: "sun", text: "…Fine. It was worth it.", face: { eye: "sparkle", mouth: "smile" } },
    { voice: "curse", text: "I'll take that.", face: { mouth: "smirk" } },
  ],
  "muskoka-d2-1230": [
    { voice: "sun", text: "There's clay on everything already.", face: { mouth: "grin", emote: "sparkle" } },
    { voice: "curse", text: "Two hours. Nobody's counting.", face: { mouth: "smile" } },
  ],
  "muskoka-d2-1130": [
    { voice: "curse", text: "He was born in this house.", face: { mouth: "closed" } },
  ],
};

/* ------------------------------------------------------------- assembly -- */

const words = (t: string): number => Math.max(3, t.trim().split(/\s+/).length);

/**
 * Hand-placing lines at 0.16, 0.5, 0.84 does not survive contact with real
 * writing: a nine-word line and a two-word line got the same room, and on a
 * short run they piled on top of each other twelve deep.
 *
 * So the run's ground is DIVIDED BETWEEN the lines in proportion to how long
 * they are. Each line sits in the middle of its own slot and holds for just
 * under half of it either side, which makes overlap arithmetically impossible
 * — a reply can still catch the tail of the line before it, which is how
 * people talk, but nothing ever stacks.
 */
type Spoken = { voice: LegBeat["voice"]; text: string; hold?: number; face?: LegBeat["face"] };

function slots(beats: readonly Spoken[], depth: number): { b: Spoken; z: number; hold: number }[] {
  const w = beats.map((b) => words(b.text));
  const total = w.reduce((n, x) => n + x, 0) || 1;
  let at = 0;
  return beats.map((b, i) => {
    const slot = (depth * (w[i] ?? 3)) / total;
    const z = at + slot / 2;
    at += slot;
    return { b, z, hold: Math.round(slot * 0.46) };
  });
}

/**
 * Reading time, per run, computed rather than guessed.
 *
 * A run gets whatever scroll its LINES need — about three quarters of a screen
 * each — and never less than its own distance would give it. Authoring this by
 * hand meant every edit to the script silently broke the pacing.
 */
export function muskokaPace(itinerary: Itinerary, perScreen = 1900): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of itinerary.travel) {
    const a = RUNS[t.id];
    if (!a || a.beats.length === 0) continue;
    const natural = t.depth / perScreen;
    // Two thirds of a screen a line. Below this they scroll past half-read;
    // above it, a trip with forty-seven lines in it stops being a walk.
    const needed = a.beats.length * 0.66;
    if (needed > natural) out[t.id] = needed / natural;
  }
  return out;
}

/** What they say on arriving, for `buildSchedule`. */
export const muskokaArrivals = (): Record<string, readonly ArrivalLine[]> => ARRIVALS;

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
    beats: slots(a.beats, d).map(({ b, z, hold }) => ({
      z,
      voice: b.voice,
      text: b.text,
      face: b.face,
      // A line has to survive long enough to be READ. The world shrank by 40%
      // when the walking was cut, and these holds shrank with it — every line
      // was on screen for about a third of a screen of scrolling, which is why
      // none of them landed. Measured against the camera's 1900 units per
      // screen, this puts a line up for roughly one full screen.
      hold: b.hold ?? hold,
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
