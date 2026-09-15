/**
 * Hair is generated, not drawn.
 *
 * Spiky anime hair hand-written as bezier data is untunable — you cannot make it
 * 10% wilder without redrawing it. So each head is a list of spikes (where it
 * sits on the skull, how far it projects, how wide its base, how far the tip
 * skews) plus a fringe profile, and the path is built from the skull ellipse.
 * Silhouette — the thing that carries recognition at thumbnail size — becomes a
 * few numbers.
 *
 * Angles are degrees from straight up: 0 = crown, -90 = screen left, +90 = screen
 * right. Both characters face screen-LEFT, so +skew sweeps a tip backward.
 */

export type Spike = {
  /** position on the skull, degrees from vertical */
  a: number;
  /** tip projection as a fraction of head radius */
  len: number;
  /** angular width of the base */
  w: number;
  /** tip displacement along the skull, degrees — this is what makes hair *flow* */
  skew: number;
};

export type FringePoint = {
  /** position across the forehead, -1 = left temple, +1 = right temple */
  x: number;
  /** how far the strand hangs: 0 = hairline, 1 = just above the eyes */
  dip: number;
};

export type HairOpts = {
  /** angle where the crown meets the temple */
  temple: number;
  /** hairline height above head centre, as a fraction of ry */
  hairline: number;
  /** how far a dip:1 strand reaches below the hairline, as a fraction of ry */
  reach: number;
};

export type HeadGeom = { cx: number; cy: number; rx: number; ry: number };

function pt(a: number, g: HeadGeom, scale: number): [number, number] {
  const r = (a * Math.PI) / 180;
  return [g.cx + Math.sin(r) * g.rx * scale, g.cy - Math.cos(r) * g.ry * scale];
}

const f = (n: number): string => `${Math.round(n * 100) / 100}`;
const L = (p: [number, number]): string => `L${f(p[0])},${f(p[1])}`;

/**
 * The whole head of hair as ONE closed shape: spiky silhouette over the top,
 * down both temples, then a jagged fringe edge back across the forehead.
 *
 * It has to be one path. Close the crown as its own shape and the fill sweeps
 * straight across the face — SVG has no notion that the skull is "inside" it,
 * so the face vanishes behind a solid block of hair.
 */
export function hairPath(
  spikes: readonly Spike[],
  g: HeadGeom,
  fringe: readonly FringePoint[],
  o: HairOpts,
): string {
  if (spikes.length === 0) return "";
  const VALLEY = 0.9; // valleys bite into the skull, so spikes read as separate
  const hairY = g.cy - g.ry * o.hairline;
  const dipY = (d: number): number => hairY + d * g.ry * o.reach;
  const start = pt(-o.temple, g, 1);
  const parts: string[] = [`M${f(start[0])},${f(start[1])}`];

  for (const s of spikes) {
    parts.push(L(pt(s.a - s.w / 2, g, VALLEY)));
    parts.push(L(pt(s.a + s.skew, g, 1 + s.len)));
    parts.push(L(pt(s.a + s.w / 2, g, VALLEY)));
  }
  parts.push(L(pt(o.temple, g, 1)));

  // fringe, right temple back to left
  const ordered = [...fringe].sort((a, b) => b.x - a.x);
  ordered.forEach((p, i) => {
    parts.push(L([g.cx + p.x * g.rx, dipY(p.dip)]));
    const next = ordered[i + 1];
    if (next) parts.push(L([g.cx + ((p.x + next.x) / 2) * g.rx, hairY - g.ry * 0.08]));
  });

  parts.push("Z");
  return parts.join(" ");
}

/** The mass behind the head — reads as volume, and lags the head independently. */
export function backHairPath(g: HeadGeom, drop: number, spread: number): string {
  const rx = g.rx * spread;
  const ry = g.ry * spread;
  return [
    `M${f(g.cx - rx)},${f(g.cy)}`,
    `C${f(g.cx - rx)},${f(g.cy - ry * 1.05)} ${f(g.cx + rx)},${f(g.cy - ry * 1.05)} ${f(g.cx + rx)},${f(g.cy)}`,
    `C${f(g.cx + rx * 1.04)},${f(g.cy + ry * drop)} ${f(g.cx + rx * 0.5)},${f(g.cy + ry * (drop + 0.12))} ${f(g.cx)},${f(g.cy + ry * (drop + 0.06))}`,
    `C${f(g.cx - rx * 0.5)},${f(g.cy + ry * (drop + 0.12))} ${f(g.cx - rx * 1.04)},${f(g.cy + ry * drop)} ${f(g.cx - rx)},${f(g.cy)}`,
    "Z",
  ].join(" ");
}

/** A — wild, tall, asymmetric, leaning forward like he is about to run. */
export const SUN_SPIKES: readonly Spike[] = [
  { a: -104, len: 0.24, w: 26, skew: -12 },
  { a: -70,  len: 0.44, w: 26, skew: -10 },
  { a: -34,  len: 0.38, w: 24, skew: -5 },
  { a: 2,    len: 0.52, w: 24, skew: 2 },
  { a: 38,   len: 0.36, w: 24, skew: 7 },
  { a: 72,   len: 0.42, w: 26, skew: 12 },
  { a: 106,  len: 0.24, w: 26, skew: 14 },
];

/** B — sharper, lower at the front, mass swept to the back. Reads as still. */
export const CURSE_SPIKES: readonly Spike[] = [
  { a: -96, len: 0.14, w: 24, skew: 14 },
  { a: -62, len: 0.24, w: 24, skew: 20 },
  { a: -26, len: 0.30, w: 24, skew: 22 },
  { a: 12,  len: 0.42, w: 26, skew: 24 },
  { a: 50,  len: 0.54, w: 28, skew: 22 },
  { a: 88,  len: 0.58, w: 28, skew: 16 },
  { a: 118, len: 0.40, w: 26, skew: 8 },
];

/** A's fringe falls unevenly — the long strand is off-centre, which is most of why he reads as scruffy. */
export const SUN_FRINGE: readonly FringePoint[] = [
  { x: -0.80, dip: 0.50 },
  { x: -0.44, dip: 0.96 },
  { x: -0.06, dip: 0.58 },
  { x: 0.34, dip: 1.0 },
  { x: 0.74, dip: 0.44 },
];

/** B's is longer and heavier, and hangs over the eye he isn't using. */
export const CURSE_FRINGE: readonly FringePoint[] = [
  { x: -0.78, dip: 0.86 },
  { x: -0.34, dip: 1.0 },
  { x: 0.12, dip: 0.66 },
  { x: 0.58, dip: 0.40 },
];

export const SUN_HAIR: HairOpts = { temple: 122, hairline: 0.50, reach: 0.30 };
export const CURSE_HAIR: HairOpts = { temple: 118, hairline: 0.46, reach: 0.32 };
