import type { JSX } from "react";

/**
 * Props that belong to ONE part of the country.
 *
 * props.tsx holds the furniture every road has — lamps, signs, centre lines.
 * These are the things that tell you WHERE you are: a blasted granite face is
 * Highway 11 and nowhere else; a dolostone band above an apple orchard is the
 * Beaver Valley; an outdoor spiral staircase is Montréal and could not be
 * anything else.
 *
 * Same contract as props.tsx: drawn on a baseline of y=0, growing upward, in
 * `currentColor` so the corridor's aerial perspective can fade them into the
 * sky by distance. The few fixed colours are the ones that must not fade —
 * lit windows, a silver roof, a yellow moose sign.
 */

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ===================================================== Canadian Shield === */

/**
 * A rock cut: the blasted granite face the highway was driven through.
 *
 * North of the Severn the road does not go around the Shield, it goes through
 * it, and the drill lines the blasting left are still in the wall. Those
 * vertical scores are the whole reason it reads as cut rather than as a hill.
 */
export function RockCut({ s = 1, seed = 5, h = 150, w = 240 }: {
  s?: number; seed?: number; h?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const steps = 7;
  const top: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const x = -w / 2 + (w * i) / steps;
    const y = -h * (0.62 + rnd() * 0.38);
    top.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const drills = Array.from({ length: 6 }, (_, i) => -w / 2 + w * ((i + 0.7) / 6.4));
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w / 2},0 ${top.join(" ")} L${w / 2},0 Z`} fill="currentColor" />
      {drills.map((x, i) => (
        <path key={i} d={`M${x.toFixed(1)},0 L${x.toFixed(1)},${(-h * (0.42 + rnd() * 0.3)).toFixed(1)}`}
          stroke="#0000004d" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      ))}
      {/* the rusty seep that stains every cut on this road */}
      <path d={`M${-w * 0.18},0 L${-w * 0.14},${-h * 0.46} l${w * 0.05},0 L${-w * 0.09},0 Z`}
        fill="#7A4B2A" opacity={0.28} />
    </g>
  );
}

/** Board-and-batten, a screened porch, a light left on. The Muskoka cottage. */
export function Cottage({ s = 1, seed = 2 }: { s?: number; seed?: number }): JSX.Element {
  const rnd = rng(seed);
  const w = 96 + rnd() * 30;
  const h = 46 + rnd() * 14;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="currentColor" />
      <path d={`M${-w / 2 - 8},${-h} L0,${-h - 30} L${w / 2 + 8},${-h} Z`} fill="currentColor" />
      {/* porch posts, which is what makes it a cottage and not a shed */}
      {[-w * 0.34, -w * 0.1, w * 0.14, w * 0.38].map((x, i) => (
        <rect key={i} x={x} y={-h * 0.62} width={3} height={h * 0.62} fill="#00000038" />
      ))}
      <rect x={-w * 0.4} y={-h * 0.66} width={w * 0.82} height={3} fill="#00000038" />
      <rect x={w * 0.1} y={-h + 12} width={16} height={12} fill="#FFD79A" opacity={0.72} />
      <rect x={-w * 0.3} y={-h + 12} width={13} height={12} fill="#FFD79A" opacity={0.4} />
      {/* stone chimney */}
      <rect x={-w * 0.38} y={-h - 24} width={9} height={26} fill="currentColor" />
    </g>
  );
}

/** A canoe on a rack by the water. Nobody up here stores one indoors. */
export function Canoe({ s = 1 }: { s?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-30} y={-22} width={3} height={22} fill="currentColor" />
      <rect x={27} y={-22} width={3} height={22} fill="currentColor" />
      <path d="M-40,-24 Q0,-40 40,-24 Q0,-30 -40,-24 Z" fill="#8C5A33" />
      <path d="M-40,-24 Q0,-40 40,-24" stroke="#00000040" strokeWidth={1.6} fill="none" />
    </g>
  );
}

/* ========================================================== Algonquin === */

/**
 * Black spruce: a narrow spire, thin at the shoulders, a tuft at the top.
 *
 * Deliberately NOT the same silhouette as the white pine used further south.
 * The two roads look different mostly because the trees on them are different
 * shapes, and drawing one pine everywhere is what made every trip look alike.
 */
export function Spruce({ s = 1, h = 250 }: { s?: number; h?: number }): JSX.Element {
  const w = h * 0.16;
  const tiers = 9;
  const parts: string[] = [`M0,0 L${-w * 0.16},0 L${-w * 0.16},${-h * 0.12}`];
  for (let i = 0; i < tiers; i += 1) {
    const bot = -h * (0.12 + (0.88 * i) / tiers);
    const top = -h * (0.12 + (0.88 * (i + 1)) / tiers);
    const spread = w * (1 - i / (tiers + 1.1)) ** 1.6;
    parts.push(`L${-spread},${bot} L${-spread * 0.3},${bot} L${-spread * 0.72},${top}`);
  }
  parts.push(`L0,${-h}`);
  for (let i = tiers - 1; i >= 0; i -= 1) {
    const bot = -h * (0.12 + (0.88 * i) / tiers);
    const top = -h * (0.12 + (0.88 * (i + 1)) / tiers);
    const spread = w * (1 - i / (tiers + 1.1)) ** 1.6;
    parts.push(`L${spread * 0.72},${top} L${spread * 0.3},${bot} L${spread},${bot}`);
  }
  parts.push(`L${w * 0.16},${-h * 0.12} L${w * 0.16},0 Z`);
  return <path d={parts.join(" ")} transform={`scale(${s})`} fill="currentColor" />;
}

/**
 * Tamarack: the only conifer that turns, and it turns gold in late October.
 *
 * Drawn feathery rather than solid, because that is what separates it at a
 * glance from the spruce standing next to it in the same bog.
 */
export function Tamarack({ s = 1, h = 180, seed = 4 }: {
  s?: number; h?: number; seed?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const arms: JSX.Element[] = [];
  const n = 13;
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const y = -h * (0.2 + t * 0.78);
    const len = h * 0.2 * (1 - t) + h * 0.03;
    const droop = len * (0.22 + rnd() * 0.2);
    arms.push(
      <path key={i}
        d={`M0,${y.toFixed(1)} Q${(-len * 0.6).toFixed(1)},${(y + droop * 0.4).toFixed(1)} ${(-len).toFixed(1)},${(y + droop).toFixed(1)}`}
        stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" />,
      <path key={`r${i}`}
        d={`M0,${y.toFixed(1)} Q${(len * 0.6).toFixed(1)},${(y + droop * 0.4).toFixed(1)} ${(len).toFixed(1)},${(y + droop).toFixed(1)}`}
        stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" />,
    );
  }
  return (
    <g transform={`scale(${s})`}>
      <rect x={-2} y={-h} width={4} height={h} fill="currentColor" />
      {arms}
    </g>
  );
}

/**
 * Open bog: a flat sphagnum mat with tufts and a few standing dead snags.
 *
 * The Spruce Bog Boardwalk is a real stop on this trip, and the reason the
 * forest opens out for a minute in the middle of a 56 km corridor of hardwood.
 */
export function Bog({ s = 1, seed = 6, w = 300 }: {
  s?: number; seed?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const tufts = Array.from({ length: 14 }, () => ({
    x: -w / 2 + rnd() * w,
    r: 4 + rnd() * 7,
  }));
  const snags = Array.from({ length: 4 }, () => ({
    x: -w / 2 + rnd() * w,
    h: 30 + rnd() * 46,
  }));
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w / 2},0 Q0,-16 ${w / 2},0 Z`} fill="currentColor" opacity={0.72} />
      {tufts.map((t, i) => (
        <ellipse key={i} cx={t.x.toFixed(1)} cy={-3} rx={t.r.toFixed(1)} ry={(t.r * 0.6).toFixed(1)}
          fill="#8B7A3E" opacity={0.5} />
      ))}
      {snags.map((sn, i) => (
        <g key={`s${i}`}>
          <rect x={sn.x.toFixed(1)} y={(-sn.h).toFixed(1)} width={2.4} height={sn.h.toFixed(1)}
            fill="#6E6552" opacity={0.75} />
          <path d={`M${(sn.x + 1).toFixed(1)},${(-sn.h * 0.78).toFixed(1)} l7,-5`}
            stroke="#6E6552" strokeWidth={1.6} opacity={0.6} fill="none" />
        </g>
      ))}
    </g>
  );
}

/** The yellow diamond. On Highway 60 it is not decorative. */
export function MooseSign({ s = 1 }: { s?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-1.6} y={-62} width={3.2} height={62} fill="currentColor" />
      <g transform="translate(0 -84)">
        <rect x={-19} y={-19} width={38} height={38} transform="rotate(45)" fill="#E8B33A" />
        {/* moose, read at a glance: body, legs, and the antlers that name it */}
        <path d="M-12,4 l3,8 M-4,4 l2,8 M5,3 l3,8 M11,2 l2,9"
          stroke="#1A1714" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <path d="M-14,4 q2,-9 10,-9 l12,0 q7,0 8,7 l1,2 l-31,0 Z" fill="#1A1714" />
        <path d="M14,0 q6,-2 7,-9 l3,1 q-1,5 -4,8 Z" fill="#1A1714" />
        <path d="M20,-9 q-6,-6 -1,-9 q3,4 6,3 M24,-9 q6,-5 2,-9 q-2,4 -6,4"
          stroke="#1A1714" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ================================================ Niagara Escarpment === */

/**
 * The escarpment: a dolostone band sitting on a wooded talus slope.
 *
 * 450 million years old, and it is the whole shape of this trip — the valley
 * is the notch cut into it. The rock is a hard horizontal band with vertical
 * joints, which is exactly how it reads from the road below.
 */
export function Escarpment({ s = 1, seed = 8, h = 210, w = 520 }: {
  s?: number; seed?: number; h?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const capTop = -h;
  const capBot = -h * 0.62;
  const joints = Array.from({ length: 9 }, (_, i) => -w / 2 + w * ((i + 0.5) / 9));
  const talus: string[] = [`M${-w / 2},0`];
  for (let i = 0; i <= 8; i += 1) {
    const x = -w / 2 + (w * i) / 8;
    talus.push(`L${x.toFixed(1)},${(capBot + 6 + rnd() * 14).toFixed(1)}`);
  }
  talus.push(`L${w / 2},0 Z`);
  return (
    <g transform={`scale(${s})`}>
      <path d={talus.join(" ")} fill="currentColor" opacity={0.85} />
      <rect x={-w / 2} y={capTop} width={w} height={capBot - capTop} fill="currentColor" />
      {/* the hard band reads lighter than the slope under it */}
      <rect x={-w / 2} y={capTop} width={w} height={(capBot - capTop) * 0.42} fill="#FFFFFF" opacity={0.12} />
      {joints.map((x, i) => (
        <path key={i} d={`M${x.toFixed(1)},${capTop} L${(x + (rnd() - 0.5) * 6).toFixed(1)},${capBot}`}
          stroke="#00000055" strokeWidth={2} fill="none" />
      ))}
    </g>
  );
}

/** A row of apples on a trellis wire. This valley grows a good part of the crop. */
export function OrchardRow({ s = 1, seed = 9, w = 260 }: {
  s?: number; seed?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const n = 7;
  const trees = Array.from({ length: n }, (_, i) => ({
    x: -w / 2 + (w * (i + 0.5)) / n,
    h: 44 + rnd() * 16,
  }));
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-34} width={w} height={2} fill="#00000035" />
      {trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x.toFixed(1)} 0)`}>
          <rect x={-2} y={-t.h * 0.55} width={4} height={t.h * 0.55} fill="currentColor" />
          <ellipse cx={0} cy={-t.h * 0.72} rx={t.h * 0.38} ry={t.h * 0.3} fill="currentColor" />
          <circle cx={-t.h * 0.16} cy={-t.h * 0.74} r={2.4} fill="#B3402C" opacity={0.75} />
          <circle cx={t.h * 0.2} cy={-t.h * 0.64} r={2.2} fill="#B3402C" opacity={0.65} />
        </g>
      ))}
    </g>
  );
}

/** A bank barn and its silo — the other half of what this valley is. */
export function Barn({ s = 1, seed = 11 }: { s?: number; seed?: number }): JSX.Element {
  const rnd = rng(seed);
  const w = 118 + rnd() * 34;
  const h = 62 + rnd() * 16;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="#7A3128" />
      <path d={`M${-w / 2 - 6},${-h} L${-w * 0.26},${-h - 26} L${w * 0.26},${-h - 26} L${w / 2 + 6},${-h} Z`}
        fill="#6A2A22" />
      <rect x={-12} y={-h * 0.62} width={24} height={h * 0.62} fill="#00000045" />
      {/* silo: the thing you actually see from a mile off */}
      <g transform={`translate(${(w / 2 + 20).toFixed(1)} 0)`}>
        <rect x={-13} y={-h - 52} width={26} height={h + 52} fill="#9AA0A3" />
        <path d="M-14,0 a14,11 0 0 1 28,0 Z" transform={`translate(0 ${-h - 52})`} fill="#8A9094" />
        {[0.25, 0.5, 0.75].map((t) => (
          <rect key={t} x={-13} y={-(h + 52) * t} width={26} height={1.6} fill="#00000030" />
        ))}
      </g>
    </g>
  );
}

/** Blue Mountain from the road: cleared runs cut straight down a wooded scarp. */
export function SkiHill({ s = 1, seed = 13, h = 200, w = 560 }: {
  s?: number; seed?: number; h?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const crest: string[] = [`M${-w / 2},0`];
  for (let i = 0; i <= 10; i += 1) {
    const x = -w / 2 + (w * i) / 10;
    const y = -h * (0.72 + rnd() * 0.28) * Math.sin((i / 10) * Math.PI) - h * 0.1;
    crest.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  }
  crest.push(`L${w / 2},0 Z`);
  const runs = [-0.3, -0.1, 0.12, 0.3];
  return (
    <g transform={`scale(${s})`}>
      <path d={crest.join(" ")} fill="currentColor" />
      {runs.map((t, i) => (
        <path key={i}
          d={`M${(w * t).toFixed(1)},${(-h * 0.78).toFixed(1)} L${(w * t - 13).toFixed(1)},0 L${(w * t + 15).toFixed(1)},0 Z`}
          fill="#C8CBB8" opacity={0.3} />
      ))}
    </g>
  );
}

/** Harbour light. Every town on this shore has one and they are all different. */
export function Lighthouse({ s = 1, h = 120 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <path d={`M-16,0 L-10,${-h * 0.82} L10,${-h * 0.82} L16,0 Z`} fill="#E6E2D8" />
      <path d={`M-13,${-h * 0.3} L-11,${-h * 0.52} L11,${-h * 0.52} L13,${-h * 0.3} Z`}
        fill="#B3402C" opacity={0.8} />
      <rect x={-12} y={-h} width={24} height={h * 0.18} fill="#4A4F55" />
      <rect x={-8} y={-h * 0.99} width={16} height={h * 0.1} fill="#FFE6B4" />
      <path d={`M-13,${-h} L0,${-h - 14} L13,${-h} Z`} fill="#4A4F55" />
    </g>
  );
}

/** Collingwood's grain terminal: the one silhouette that IS that harbour. */
export function GrainTerminal({ s = 1, h = 160 }: { s?: number; h?: number }): JSX.Element {
  const cols = [-56, -34, -12, 10, 32];
  return (
    <g transform={`scale(${s})`}>
      {cols.map((x, i) => (
        <rect key={i} x={x} y={-h} width={21} height={h} rx={10.5} fill="currentColor" />
      ))}
      <rect x={-60} y={-h - 26} width={118} height={26} fill="currentColor" />
      <rect x={54} y={-h - 52} width={18} height={h + 52} fill="currentColor" />
    </g>
  );
}

/* =========================================================== Montréal === */

/**
 * The plex, with its staircase on the OUTSIDE.
 *
 * Thirty to forty thousand of these in the city, and they exist because a
 * by-law pushed the buildings back from the street and landlords refused to
 * give up interior floor space to a stairwell. Nothing else looks like it.
 */
export function Triplex({ s = 1, seed = 21 }: { s?: number; seed?: number }): JSX.Element {
  const rnd = rng(seed);
  const w = 104 + rnd() * 26;
  const h = 150 + rnd() * 40;
  const brick = ["#6E4239", "#7A4A3A", "#5C4A46", "#7E5B45"];
  const face = brick[Math.floor(rnd() * brick.length)] ?? "#6E4239";
  const floors = 3;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={face} />
      <rect x={-w / 2} y={-h} width={w} height={6} fill="#00000040" />
      {Array.from({ length: floors }, (_, f) => (
        <g key={f}>
          {[-w * 0.28, 0, w * 0.28].map((x, i) => (
            <rect key={i} x={x - 9} y={-h + 18 + f * (h / floors)} width={18} height={26} rx={2}
              fill="#FFD79A" opacity={rnd() > 0.45 ? 0.62 : 0.16} />
          ))}
          {/* balcony rail at each landing */}
          <rect x={-w / 2 - 6} y={-h + 52 + f * (h / floors)} width={w + 12} height={2.6}
            fill="#2E3238" opacity={0.85} />
        </g>
      ))}
      {/* the staircase: a curl off the front, landing on the pavement */}
      <g stroke="#2E3238" strokeWidth={2.6} fill="none" strokeLinecap="round">
        <path d={`M${w / 2 - 6},${-h * 0.62} q34,6 30,26 q-4,20 -26,22 L${w / 2 - 2},0`} />
        <path d={`M${w / 2 - 6},${-h * 0.62} q28,10 24,24 q-4,16 -22,18`} opacity={0.6} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i}
            d={`M${(w / 2 - 4 + i * 4.6).toFixed(1)},${(-h * 0.6 + i * 9).toFixed(1)} l9,2`} />
        ))}
      </g>
    </g>
  );
}

/** A parish church: twin spires and a copper roof gone green. */
export function Parish({ s = 1, h = 200 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-60} y={-h * 0.56} width={120} height={h * 0.56} fill="currentColor" />
      <path d="M-62,0 L0,-34 L62,0 Z" transform={`translate(0 ${-h * 0.56})`} fill="#4C7E6A" />
      {[-40, 40].map((x, i) => (
        <g key={i} transform={`translate(${x} 0)`}>
          <rect x={-13} y={-h} width={26} height={h} fill="currentColor" />
          <path d={`M-15,${-h} L0,${-h - 40} L15,${-h} Z`} fill="#4C7E6A" />
          <rect x={-4} y={-h - 52} width={2} height={12} fill="#4C7E6A" />
        </g>
      ))}
      <circle cx={0} cy={-h * 0.44} r={13} fill="#FFD79A" opacity={0.5} />
    </g>
  );
}

/** The cross on the mountain, lit, which is how you find north after dark. */
export function MountCross({ s = 1, h = 120 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <path d={`M-150,0 Q-70,${-h * 0.72} 0,${-h * 0.8} Q80,${-h * 0.72} 160,0 Z`} fill="currentColor" />
      <g transform={`translate(0 ${-h * 0.78})`}>
        <rect x={-3} y={-58} width={6} height={58} fill="#EDE6D6" opacity={0.9} />
        <rect x={-17} y={-42} width={34} height={5.5} fill="#EDE6D6" opacity={0.9} />
      </g>
    </g>
  );
}

/** The Olympic tower, leaning the way it leans. Visible from most of the east end. */
export function OlympicTower({ s = 1, h = 300 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <path d={`M-22,0 L-8,${-h * 0.62} Q10,${-h * 0.95} 54,${-h}
        L64,${-h * 0.96} Q18,${-h * 0.88} 6,${-h * 0.58} L10,0 Z`} fill="currentColor" />
      <ellipse cx={-2} cy={-6} rx={78} ry={12} fill="currentColor" opacity={0.55} />
    </g>
  );
}

/* ======================================================= Québec City === */

/** Steep roof, dormers, fieldstone walls. The island's houses, unchanged. */
export function StoneHouse({ s = 1, seed = 31 }: { s?: number; seed?: number }): JSX.Element {
  const rnd = rng(seed);
  const w = 92 + rnd() * 24;
  const h = 44 + rnd() * 12;
  const roof = rnd() > 0.5 ? "#8A3B30" : "#9AA3A6";
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="currentColor" />
      {/* the roof is the tell: very steep, flaring at the eaves */}
      <path d={`M${-w / 2 - 10},${-h} Q${-w / 2 - 2},${-h - 6} ${-w * 0.3},${-h - 12}
        L0,${-h - 46} L${w * 0.3},${-h - 12} Q${w / 2 + 2},${-h - 6} ${w / 2 + 10},${-h} Z`}
        fill={roof} />
      {[-w * 0.2, w * 0.2].map((x, i) => (
        <path key={i} d={`M${x - 9},${-h - 16} L${x - 9},${-h - 26} L${x},${-h - 33}
          L${x + 9},${-h - 26} L${x + 9},${-h - 16} Z`} fill={roof} />
      ))}
      <rect x={-w * 0.3} y={-h + 10} width={13} height={16} fill="#FFD79A" opacity={0.6} />
      <rect x={w * 0.18} y={-h + 10} width={13} height={16} fill="#FFD79A" opacity={0.42} />
      <rect x={-w / 2 + 4} y={-h - 52} width={9} height={30} fill="currentColor" />
    </g>
  );
}

/** A village church with a tin spire. Six of them down one island road. */
export function SilverSpire({ s = 1, h = 230 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-46} y={-h * 0.4} width={92} height={h * 0.4} fill="currentColor" />
      <path d={`M-48,0 L0,-26 L48,0 Z`} transform={`translate(0 ${-h * 0.4})`} fill="#C7CDD1" />
      <rect x={-17} y={-h * 0.82} width={34} height={h * 0.82} fill="currentColor" />
      <path d={`M-19,${-h * 0.82} L0,${-h * 0.94} L19,${-h * 0.82} Z`} fill="#C7CDD1" />
      <path d={`M-11,${-h * 0.94} L0,${-h} L11,${-h * 0.94} Z`} fill="#C7CDD1" />
      <rect x={-1.4} y={-h - 20} width={2.8} height={20} fill="#C7CDD1" />
      <circle cx={0} cy={-h * 0.72} r={7} fill="#FFD79A" opacity={0.55} />
    </g>
  );
}

/** The wall, with a gun on it. Québec is the only walled city north of Mexico. */
export function CityWall({ s = 1, h = 84, w = 280 }: {
  s?: number; h?: number; w?: number;
}): JSX.Element {
  const merlons = Array.from({ length: 9 }, (_, i) => -w / 2 + (w * i) / 9);
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w / 2 - 10},0 L${-w / 2},${-h} L${w / 2},${-h} L${w / 2 + 10},0 Z`} fill="currentColor" />
      {merlons.map((x, i) => (
        i % 2 === 0
          ? <rect key={i} x={x.toFixed(1)} y={-h - 11} width={(w / 9) * 0.78} height={11} fill="currentColor" />
          : null
      ))}
      {/* the cannon, pointed at a river nobody has come up since 1775 */}
      <g transform={`translate(${-w * 0.22} ${-h - 11})`}>
        <rect x={-18} y={-7} width={36} height={5} rx={2.5} fill="#33383D" />
        <circle cx={-14} cy={0} r={5} fill="#33383D" />
        <circle cx={4} cy={0} r={5} fill="#33383D" />
      </g>
    </g>
  );
}

/** The Château: the roofline the whole city is photographed against. */
export function Frontenac({ s = 1, h = 260 }: { s?: number; h?: number }): JSX.Element {
  const roof = "#4C7E6A";
  return (
    <g transform={`scale(${s})`}>
      <rect x={-110} y={-h * 0.5} width={220} height={h * 0.5} fill="currentColor" />
      <path d={`M-114,0 L-96,-30 L96,-30 L114,0 Z`} transform={`translate(0 ${-h * 0.5})`} fill={roof} />
      {/* the tower */}
      <rect x={-26} y={-h * 0.88} width={52} height={h * 0.88} fill="currentColor" />
      <path d={`M-30,${-h * 0.88} L0,${-h} L30,${-h * 0.88} Z`} fill={roof} />
      <rect x={-1.4} y={-h - 16} width={2.8} height={16} fill={roof} />
      {/* the corner turrets that make the roofline */}
      {[-84, 84].map((x, i) => (
        <g key={i} transform={`translate(${x} ${-h * 0.5})`}>
          <rect x={-13} y={-58} width={26} height={58} fill="currentColor" />
          <path d="M-15,-58 L0,-88 L15,-58 Z" fill={roof} />
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-98 + i * 22} y={-h * 0.4} width={9} height={14}
          fill="#FFD79A" opacity={i % 3 === 0 ? 0.55 : 0.28} />
      ))}
    </g>
  );
}

/** Long strip fields running back from the road — the seigneurial grid, still there. */
export function StripField({ s = 1, seed = 33, w = 300 }: {
  s?: number; seed?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const rows = Array.from({ length: 9 }, (_, i) => -w / 2 + (w * i) / 9);
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w / 2},0 L${-w * 0.3},-34 L${w * 0.3},-34 L${w / 2},0 Z`}
        fill="currentColor" opacity={0.55} />
      {rows.map((x, i) => (
        <path key={i} d={`M${x.toFixed(1)},0 L${(x * 0.62 + (rnd() - 0.5) * 6).toFixed(1)},-34`}
          stroke="#00000030" strokeWidth={1.6} fill="none" />
      ))}
    </g>
  );
}

/** A roadside stand: apples, cider, and a hand-painted board. */
export function FarmStand({ s = 1 }: { s?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-34} y={-38} width={68} height={38} fill="currentColor" />
      <path d="M-42,-38 L0,-54 L42,-38 Z" fill="#B3402C" opacity={0.85} />
      <rect x={-28} y={-24} width={56} height={4} fill="#C9B79C" />
      {[-20, -8, 4, 16].map((x, i) => (
        <circle key={i} cx={x} cy={-27} r={3.4} fill="#B3402C" opacity={0.8} />
      ))}
      <rect x={30} y={-58} width={3} height={58} fill="currentColor" />
      <rect x={20} y={-70} width={26} height={16} rx={2} fill="#EDE6D6" opacity={0.85} />
    </g>
  );
}

/* ============================================================ shared ==== */

/** Flat farmland: a hedgerow and a distant line of poplars. The 401 in an hour. */
export function Hedgerow({ s = 1, seed = 41, w = 320 }: {
  s?: number; seed?: number; w?: number;
}): JSX.Element {
  const rnd = rng(seed);
  const bumps = Array.from({ length: 11 }, (_, i) => ({
    x: -w / 2 + (w * i) / 11,
    h: 16 + rnd() * 22,
  }));
  return (
    <g transform={`scale(${s})`}>
      {bumps.map((b, i) => (
        <ellipse key={i} cx={b.x.toFixed(1)} cy={0} rx={(w / 11) * 0.8} ry={b.h.toFixed(1)}
          fill="currentColor" />
      ))}
    </g>
  );
}

/** A cedar rail fence, the zig-zag kind, which is what this country fences with. */
export function RailFence({ s = 1, w = 240 }: { s?: number; w?: number }): JSX.Element {
  const n = 8;
  const pts: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    pts.push(`${(-w / 2 + (w * i) / n).toFixed(1)},${i % 2 === 0 ? -4 : -14}`);
  }
  return (
    <g transform={`scale(${s})`} stroke="currentColor" fill="none" strokeLinecap="round">
      <polyline points={pts.join(" ")} strokeWidth={3} />
      <polyline points={pts.join(" ")} strokeWidth={3} transform="translate(0 -10)" opacity={0.8} />
      <polyline points={pts.join(" ")} strokeWidth={3} transform="translate(0 -20)" opacity={0.6} />
    </g>
  );
}
