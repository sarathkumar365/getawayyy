import { along, verge, type Leg, type SceneItem } from "./corridor";
import type { Control } from "./path";

/**
 * Muskoka, leg 1 — leaving Toronto, rebuilt as a corridor.
 *
 * The same sequence the prose describes, now laid out in DEPTH rather than
 * laterally: the city closes in around you, thins, and lets go. "The last of the
 * streetlights" is anchored to the camera position where the final lamp passes.
 */

const DEPTH = 6400;

/** Lamp posts, spaced further and further apart until they stop. */
function thinningLamps(from: number, to: number, g0: number, g1: number): SceneItem[] {
  const out: SceneItem[] = [];
  let z = from;
  let i = 0;
  while (z < to) {
    const side = i % 2 === 0 ? -1 : 1;
    out.push({ z, x: side * 168, kind: "lamp", s: 1 });
    const t = (z - from) / Math.max(1, to - from);
    z += g0 + (g1 - g0) * t;
    i += 1;
  }
  return out;
}

const CITY_END = 1500;
const LAST_LAMP_AT = 3050;

/**
 * The road out of the city.
 *
 * Tight and nearly straight while the grid still has hold of it, then longer,
 * looser swings once it is out — and it starts climbing, because everything
 * north of Toronto does. The rise is what stops a bend from reading as the whole
 * world sliding sideways.
 */
const ROAD: Control[] = [
  { z: -600, x: 0, y: 0 },
  { z: 0, x: 0, y: 0 },
  { z: 900, x: -110, y: 8 },
  { z: 1800, x: 130, y: -12 },
  { z: 2700, x: -60, y: 26 },
  { z: 3700, x: -430, y: 54 },
  { z: 4600, x: 90, y: 38 },
  { z: 5500, x: 420, y: -18 },
  { z: 6400, x: 120, y: 30 },
  { z: 7200, x: 0, y: 40 },
];

export const MUSKOKA_LEG_1: Leg = {
  id: "muskoka-leg-1",
  title: "1 · Departure",
  terrain: "city",
  depth: DEPTH,
  path: ROAD,
  clock: [
    { z: 0, time: "18:00" },
    { z: 3000, time: "19:10" },
    { z: DEPTH, time: "20:30" },
  ],
  items: [
    // the road itself — dashes down the centre, posts along both verges
    ...along(60, DEPTH, 95).map((z) => ({ z, x: 0, kind: "dash" })),
    ...along(120, DEPTH, 150).map((z, i) => ({ z, x: i % 2 ? 300 : -300, kind: "post" })),

    // city: blocks crowding both sides, then giving out
    ...verge(80, CITY_END, 150, -520, "block", { seed: 11, spread: 220, jitter: 60 }),
    ...verge(140, CITY_END, 160, 520, "block", { seed: 13, spread: 220, jitter: 60 }),
    ...verge(CITY_END, 2900, 420, -560, "block", { seed: 17, spread: 180, s: 0.9 }),
    ...verge(CITY_END + 200, 2900, 460, 560, "block", { seed: 19, spread: 180, s: 0.9 }),

    // the streetlights, and where they stop
    ...thinningLamps(80, LAST_LAMP_AT, 150, 760),

    // trees arriving as the city leaves
    ...verge(2200, DEPTH, 210, -380, "pine", { seed: 23, spread: 260 }),
    ...verge(2400, DEPTH, 230, 380, "pine", { seed: 29, spread: 260 }),
    ...verge(3600, DEPTH, 340, -300, "birch", { seed: 31, spread: 160, s: 0.9 }),

    { z: 4100, x: 250, kind: "sign", label: "11" },
    { z: 5500, x: -250, kind: "sign", label: "N" },
  ],
  beats: [
    { z: 220, voice: "narrate", text: "You leave at six on Friday", hold: 430 },
    { z: 1080, voice: "narrate", text: "and watch the city let go of you in pieces —", hold: 440 },
    { z: 1850, voice: "narrate", text: "the last of the traffic,", hold: 400 },
    { z: 2700, voice: "narrate", text: "then the last of the streetlights,", hold: 430 },
    { z: 3600, voice: "narrate", text: "then nothing but highway.", hold: 440 },
    { z: 4400, voice: "narrate", text: "It takes two hours.", hold: 420 },
    { z: 5100, voice: "sun", text: "Two hours. That's nothing. We'll be there before it's properly dark.", hold: 450 },
    { z: 5800, voice: "curse", text: "It will be properly dark.", hold: 430 },
  ],
};
