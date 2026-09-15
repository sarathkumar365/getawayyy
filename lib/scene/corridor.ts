/**
 * The corridor: a path you walk INTO, rather than a strip that slides past.
 *
 * Scroll advances a camera along +z. Everything is projected through a pinhole:
 * things start small at the far plane, grow as you close on them, pass the camera
 * and are culled. That is the "appears and disappears into the screen" the flat
 * build could not do.
 *
 * Projected by hand rather than with CSS `perspective` / `preserve-3d`. Manual
 * projection is predictable, makes culling explicit, and avoids the compositing
 * jank 3D transforms are prone to on iOS — which matters, because iPad is the
 * primary target.
 */

export type SceneItem = {
  /** distance along the path */
  z: number;
  /** lateral offset from the centre line, at z = 0 scale */
  x: number;
  /** height above the ground plane, at z = 0 scale */
  y?: number;
  kind: string;
  /** size multiplier */
  s?: number;
  flip?: boolean;
  label?: string;
};

export type Lens = {
  /** focal length: smaller = wider angle, faster approach */
  focal: number;
  /** horizon, as a fraction of viewport height */
  horizon: number;
  /** how far below the horizon the ground sits at scale 1 */
  ground: number;
  /** cull beyond this distance */
  far: number;
  /** cull once an item is this far behind the camera */
  near: number;
  /** distance over which an item fades in at the far plane */
  fadeIn: number;
};

export const LENS: Lens = {
  focal: 640,
  horizon: 0.47,
  ground: 0.42,
  far: 2600,
  near: -220,
  fadeIn: 900,
};

export type Projected = {
  scale: number;
  /** px from the left edge */
  left: number;
  /** px from the top edge — the item's BASE, where it meets the ground */
  base: number;
  opacity: number;
  visible: boolean;
};

/**
 * Pinhole projection of one item, given the camera position and viewport.
 *
 * `d` is distance ahead of the camera. Scale is focal/(focal+d), so an item at
 * the camera plane is full size and one at 3× the focal length is a quarter of
 * it. Items behind the camera keep growing — which is what a close pass looks
 * like — until they are culled.
 */
export function project(
  item: SceneItem, cameraZ: number, w: number, h: number, lens: Lens = LENS,
): Projected {
  const d = item.z - cameraZ;
  if (d > lens.far || d < lens.near) {
    return { scale: 0, left: 0, base: 0, opacity: 0, visible: false };
  }

  const denom = lens.focal + d;
  // guard the singularity at d = -focal, where scale goes to infinity
  const scale = denom > 1 ? lens.focal / denom : lens.focal;

  const horizonPx = h * lens.horizon;
  const groundPx = h * lens.ground;

  const left = w / 2 + item.x * scale;
  const base = horizonPx + groundPx * scale - (item.y ?? 0) * scale;

  // fade in from the far plane, and out over the last stretch before the camera
  const inK = Math.min(1, (lens.far - d) / lens.fadeIn);
  const outK = d < 60 ? Math.max(0, (d - lens.near) / (60 - lens.near)) : 1;

  return { scale, left, base, opacity: Math.max(0, Math.min(1, inK * outK)), visible: true };
}

/** Back to front, so near things overlap far things without z-index churn. */
export function sortForPaint(items: readonly SceneItem[]): SceneItem[] {
  return [...items].sort((a, b) => b.z - a.z);
}

/** Evenly spaced positions along the path, with deterministic jitter. */
export function along(
  from: number, to: number, gap: number, jitter = 0, seed = 1,
): number[] {
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  for (let z = from; z < to; z += gap) out.push(z + (rnd() - 0.5) * jitter);
  return out;
}

/**
 * Scatter along one verge of the path.
 *
 * `side` is the lateral offset in scale-1 pixels — negative is left of the centre
 * line. `spread` widens the band outward from there, away from the road.
 */
export function verge(
  from: number, to: number, gap: number, side: number, kind: string,
  opts: { jitter?: number; seed?: number; s?: number; spread?: number } = {},
): SceneItem[] {
  const seed = opts.seed ?? 7;
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const dir = side < 0 ? -1 : 1;
  return along(from, to, gap, opts.jitter ?? gap * 0.4, seed).map((z) => ({
    z,
    // widen AWAY from the road, never across it
    x: side + dir * (opts.spread ?? 0) * rnd(),
    kind,
    s: (opts.s ?? 1) * (0.85 + rnd() * 0.3),
    flip: rnd() > 0.5,
  }));
}

/* ---------------- a leg of the journey ---------------- */

export type BeatVoice = "narrate" | "sun" | "curse";

export type LegBeat = {
  /** camera position at which this line is centred */
  z: number;
  voice: BeatVoice;
  text: string;
  /** how far either side it stays legible */
  hold?: number;
};

export type Terrain = "city" | "highway" | "town" | "forest" | "water" | "indoor";

/** One travel run between two stations. */
export type Leg = {
  id: string;
  title?: string;
  terrain?: Terrain;
  /** total camera travel */
  depth: number;
  /** clock anchors along the path, driving the sky */
  clock: { z: number; time: string }[];
  items: SceneItem[];
  beats: LegBeat[];
  /** wet-day rate, only where the data earns it */
  rain?: number;
};

export function beatAlpha(beat: LegBeat, cameraZ: number): number {
  const hold = beat.hold ?? 420;
  const d = Math.abs(cameraZ - beat.z);
  if (d > hold) return 0;
  const t = 1 - d / hold;
  return t * t * (3 - 2 * t);
}

export function clockAt(leg: Leg, z: number): string {
  const c = leg.clock;
  const first = c[0];
  if (!first) return "12:00";
  const last = c[c.length - 1] ?? first;
  if (z <= first.z) return first.time;
  if (z >= last.z) return last.time;
  for (let i = 0; i < c.length - 1; i += 1) {
    const a = c[i];
    const b = c[i + 1];
    if (!a || !b || z < a.z || z > b.z) continue;
    const k = b.z === a.z ? 0 : (z - a.z) / (b.z - a.z);
    const ha = hours(a.time);
    const hb = hours(b.time);
    return fromHours(ha + (hb - ha) * k);
  }
  return last.time;
}

function hours(t: string): number {
  const [h, m] = t.split(":");
  return Number(h ?? 0) + Number(m ?? 0) / 60;
}

function fromHours(h: number): string {
  const w = ((h % 24) + 24) % 24;
  const hh = Math.floor(w);
  const mm = Math.round((w - hh) * 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
