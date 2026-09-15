/**
 * The road is a curve, not an axis.
 *
 * A straight corridor reads as a corridor. What makes it read as a ROAD is that
 * the vanishing point drifts as you go round a bend, and the ground rises and
 * falls under you.
 *
 * `bend(z)` is the lateral position of the road centre at distance z; `rise(z)`
 * is its elevation. Both are sampled from control points through a Catmull-Rom
 * spline, so a leg is authored as a handful of "by here the road has swung 260
 * left and climbed a little" and the curve between them is continuous.
 *
 * Crucially, item.x is an offset FROM THE ROAD CENTRE, not an absolute position.
 * So every prop already placed follows the curve without being touched.
 */

export type Control = {
  z: number;
  /** lateral position of the road centre here */
  x: number;
  /** elevation here; positive is uphill */
  y?: number;
};

export type Path = {
  bend: (z: number) => number;
  rise: (z: number) => number;
};

/** Catmull-Rom through four knots. Smooth at the knots, unlike a smoothstep. */
function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

const SAMPLES = 512;

/**
 * Sampled into a lookup table at build time.
 *
 * bend() is called once per prop per frame — a few hundred times — so the spline
 * is evaluated once up front and read back by interpolation rather than solved
 * on every call.
 */
export function makePath(controls: readonly Control[], depth: number): Path {
  if (controls.length === 0) {
    return { bend: () => 0, rise: () => 0 };
  }
  if (controls.length === 1) {
    const only = controls[0] as Control;
    return { bend: () => only.x, rise: () => only.y ?? 0 };
  }

  const pts = [...controls].sort((a, b) => a.z - b.z);
  const xs = new Float32Array(SAMPLES + 1);
  const ys = new Float32Array(SAMPLES + 1);

  const at = (i: number): Control => pts[Math.max(0, Math.min(pts.length - 1, i))] as Control;

  for (let i = 0; i <= SAMPLES; i += 1) {
    const z = (i / SAMPLES) * depth;
    // find the segment containing z
    let seg = 0;
    while (seg < pts.length - 2 && (pts[seg + 1] as Control).z < z) seg += 1;
    const p1 = at(seg);
    const p2 = at(seg + 1);
    const span = Math.max(1, p2.z - p1.z);
    const t = Math.max(0, Math.min(1, (z - p1.z) / span));
    xs[i] = catmull(at(seg - 1).x, p1.x, p2.x, at(seg + 2).x, t);
    ys[i] = catmull(
      at(seg - 1).y ?? 0, p1.y ?? 0, p2.y ?? 0, at(seg + 2).y ?? 0, t,
    );
  }

  const read = (table: Float32Array, z: number): number => {
    const u = Math.max(0, Math.min(1, z / Math.max(1, depth))) * SAMPLES;
    const i = Math.floor(u);
    const j = Math.min(SAMPLES, i + 1);
    const f = u - i;
    return (table[i] ?? 0) * (1 - f) + (table[j] ?? 0) * f;
  };

  return {
    bend: (z) => read(xs, z),
    rise: (z) => read(ys, z),
  };
}

export const STRAIGHT: Path = { bend: () => 0, rise: () => 0 };
