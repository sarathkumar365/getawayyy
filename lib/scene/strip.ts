/**
 * The strip.
 *
 * The scene is not a series of backdrops behind a series of sections. It is ONE
 * continuous world laid out along an x axis — a side-scrolling level — and the
 * text is pinned at positions along that same axis.
 *
 * That single change is what makes "the last of the streetlights" work: the
 * streetlights are placed at real positions that thin out and stop, and the
 * sentence is anchored to the x where the last one passes. She does not read a
 * description of leaving the city; she passes the last streetlight while reading
 * the words.
 *
 * Everything is in STRIP UNITS. One unit ≈ one CSS pixel at 1× zoom, but the
 * mapping is arbitrary — what matters is that items and beats share the axis.
 */

export type Layer = "weather" | "far" | "mid" | "near" | "ground";

/** Parallax rate per layer. Ground moves at the walking speed; far barely moves. */
export const RATE: Record<Layer, number> = {
  weather: 0.08,
  far: 0.22,
  mid: 0.48,
  near: 0.82,
  ground: 1,
};

export type Item = {
  x: number;
  kind: string;
  /** size multiplier */
  s?: number;
  /** vertical offset from the layer baseline */
  y?: number;
  flip?: boolean;
  /** for span kinds (guardrail, lake, road dashes) — where the span ends */
  to?: number;
  /** for signs */
  label?: string;
};

/** Which terrain recipe a movement uses — picks palette and default furniture. */
export type Terrain = "city" | "highway" | "town" | "forest" | "water" | "indoor";

export type BeatVoice = "narrate" | "sun" | "curse";

export type Beat = {
  /** strip position where this line is centred */
  x: number;
  voice: BeatVoice;
  text: string;
  /** how wide a window it stays legible for, in strip units */
  hold?: number;
};

export type Strip = {
  id: string;
  /** shown on the progress rail and in the movement heading */
  title?: string;
  terrain?: Terrain;
  /** total travelled distance in strip units */
  width: number;
  /** clock times at strip positions — drives the sky along the walk */
  clock: { x: number; time: string }[];
  items: Item[];
  beats: Beat[];
};

/**
 * Positions from `from` to `to` where the gap grows from `startGap` to `endGap`.
 *
 * This is the whole trick behind things thinning out. A constant gap reads as
 * wallpaper; a growing gap reads as leaving somewhere.
 */
export function thinOut(
  from: number, to: number, startGap: number, endGap: number,
): number[] {
  const xs: number[] = [];
  let x = from;
  while (x < to) {
    xs.push(x);
    const t = (x - from) / Math.max(1, to - from);
    x += startGap + (endGap - startGap) * t;
  }
  return xs;
}

/** Evenly spaced, with a deterministic jitter so it never reads as a fence. */
export function scatter(
  from: number, to: number, gap: number, jitter = 0, seed = 1,
): number[] {
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const xs: number[] = [];
  for (let x = from; x < to; x += gap) xs.push(x + (rnd() - 0.5) * jitter);
  return xs;
}

export const item = (x: number, kind: string, extra: Omit<Item, "x" | "kind"> = {}): Item =>
  ({ x, kind, ...extra });

/** Visibility envelope for a beat: 0 outside its window, 1 at its centre. */
export function beatAlpha(beat: Beat, x: number): number {
  const hold = beat.hold ?? 520;
  const d = Math.abs(x - beat.x);
  if (d > hold) return 0;
  const t = 1 - d / hold;
  return t * t * (3 - 2 * t);
}

/** Clock time at a strip position, interpolated between the anchors. */
export function clockAt(strip: Strip, x: number): string {
  const c = strip.clock;
  const first = c[0];
  const last = c[c.length - 1];
  if (!first) return "12:00";
  if (x <= first.x) return first.time;
  if (!last || x >= last.x) return last?.time ?? first.time;
  for (let i = 0; i < c.length - 1; i += 1) {
    const a = c[i];
    const b = c[i + 1];
    if (!a || !b) continue;
    if (x >= a.x && x <= b.x) {
      const k = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
      const ha = hours(a.time);
      const hb = hours(b.time);
      return fromHours(ha + (hb - ha) * k);
    }
  }
  return last.time;
}

function hours(t: string): number {
  const [h, m] = t.split(":");
  return Number(h ?? 0) + Number(m ?? 0) / 60;
}

function fromHours(h: number): string {
  const wrapped = ((h % 24) + 24) % 24;
  const hh = Math.floor(wrapped);
  const mm = Math.round((wrapped - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
}
