import type { JSX } from "react";

/**
 * Roadside props, drawn on a baseline of y=0 and growing upward.
 *
 * All use `currentColor` so a layer sets one value and everything in it obeys —
 * except the lit ones, which carry their own warm colour because a lamp that
 * matches its silhouette is not a lamp.
 */

export function Streetlight({ s = 1, lit = true }: { s?: number; lit?: boolean }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-1.6} y={-96} width={3.2} height={96} fill="currentColor" />
      <path d="M-1.6,-96 q0,-12 14,-12 l4,0 l0,4 l-4,0 q-10,0 -10,8 Z" fill="currentColor" />
      {lit && (
        <>
          <ellipse cx={16} cy={-104} rx={5} ry={3} fill="#FFD79A" />
          <path d="M16,-102 L34,-4 L-2,-4 Z" fill="#FFD79A" opacity={0.14} />
          <circle cx={16} cy={-104} r={11} fill="#FFD79A" opacity={0.16} />
        </>
      )}
    </g>
  );
}

export function Block({ s = 1, seed = 1 }: { s?: number; seed?: number }): JSX.Element {
  // deterministic window grid — lit windows never in rows, which is the giveaway
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const h = 120 + rnd() * 190;
  const w = 54 + rnd() * 46;
  const cols = Math.max(2, Math.floor(w / 18));
  const rows = Math.max(3, Math.floor(h / 26));
  const win: JSX.Element[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (rnd() > 0.42) continue;
      win.push(
        <rect key={`${r}-${c}`} x={-w / 2 + 7 + c * 18} y={-h + 14 + r * 26}
          width={7} height={10} fill="#FFD79A" opacity={0.55 + rnd() * 0.4} />,
      );
    }
  }
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="currentColor" />
      {win}
    </g>
  );
}

/** Small-town frontage: low, wide, warm. The opposite shape to a city block. */
export function Storefront({ s = 1, seed = 3 }: { s?: number; seed?: number }): JSX.Element {
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const h = 56 + rnd() * 34;
  const w = 78 + rnd() * 54;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="currentColor" />
      <path d={`M${-w / 2 - 5},${-h} L0,${-h - 22} L${w / 2 + 5},${-h} Z`} fill="currentColor" />
      <rect x={-w / 2 + 10} y={-h + 16} width={20} height={16} fill="#FFD79A" opacity={0.75} />
      <rect x={w / 2 - 30} y={-h + 16} width={20} height={16} fill="#FFD79A" opacity={0.6} />
      <rect x={-9} y={-24} width={18} height={24} fill="#FFD79A" opacity={0.45} />
    </g>
  );
}

export function HighwaySign({ s = 1, label = "" }: { s?: number; label?: string }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-1.4} y={-58} width={2.8} height={58} fill="currentColor" />
      <rect x={-22} y={-86} width={44} height={30} rx={2.5} fill="currentColor" />
      <rect x={-19} y={-83} width={38} height={24} rx={1.5} fill="none"
        stroke="#E8EFE6" strokeWidth={1.4} opacity={0.6} />
      {label && (
        <text x={0} y={-66} textAnchor="middle" fill="#E8EFE6" opacity={0.78}
          fontSize={13} fontFamily="ui-monospace, monospace">{label}</text>
      )}
    </g>
  );
}

/** Centre line. Drawn as dashes so speed is legible even when nothing else moves. */
export function RoadDashes({ from, to, gap = 120 }: { from: number; to: number; gap?: number }): JSX.Element {
  const dashes: JSX.Element[] = [];
  for (let x = from; x < to; x += gap) {
    dashes.push(<rect key={x} x={x} y={-3} width={gap * 0.42} height={4} rx={2}
      fill="#E8E2D4" opacity={0.3} />);
  }
  return <g>{dashes}</g>;
}

export function Guardrail({ from, to }: { from: number; to: number }): JSX.Element {
  const posts: JSX.Element[] = [];
  for (let x = from; x < to; x += 60) {
    posts.push(<rect key={x} x={x} y={-22} width={3} height={22} fill="currentColor" opacity={0.75} />);
  }
  return (
    <g>
      {posts}
      <rect x={from} y={-24} width={to - from} height={5} fill="currentColor" opacity={0.6} />
    </g>
  );
}

/** A lake edge — a long flat band with a soft top edge. */
export function Lake({ from, to, depth = 46 }: { from: number; to: number; depth?: number }): JSX.Element {
  const w = to - from;
  return (
    <g transform={`translate(${from} 0)`}>
      <path d={`M0,0 L0,${-depth} Q${w * 0.25},${-depth - 7} ${w * 0.5},${-depth}
        Q${w * 0.75},${-depth + 7} ${w},${-depth} L${w},0 Z`}
        fill="currentColor" opacity={0.55} />
    </g>
  );
}

/* ---------- places, not furniture ---------- */

/** A waterfall with a lit plunge pool — Bracebridge at 22:15, Stubb's at 15:00. */
export function Falls({ s = 1, h = 120, w = 54 }: { s?: number; h?: number; w?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w},0 L${-w},${-h} L${w},${-h} L${w},0 Z`} fill="currentColor" opacity={0.9} />
      <path d={`M${-w * 0.5},${-h * 0.82} L${-w * 0.42},${-h * 0.1} L${w * 0.46},${-h * 0.1} L${w * 0.52},${-h * 0.82} Z`}
        fill="#CFE2EA" opacity={0.5} />
      {[-0.3, 0, 0.28].map((t, i) => (
        <path key={i} d={`M${w * t},${-h * 0.8} L${w * t},${-h * 0.14}`}
          stroke="#EAF3F7" strokeWidth={2.4} opacity={0.45} strokeLinecap="round" />
      ))}
      <ellipse cx={0} cy={-2} rx={w * 1.1} ry={7} fill="#CFE2EA" opacity={0.35} />
    </g>
  );
}

/** An escarpment edge you stand on. The drop is the point. */
export function Lookout({ s = 1, h = 150, w = 210 }: { s?: number; h?: number; w?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <path d={`M${-w},0 L${-w},${-h * 0.5} Q${-w * 0.5},${-h} ${-w * 0.08},${-h}
        L${w * 0.16},${-h * 0.98} L${w * 0.2},0 Z`} fill="currentColor" />
      <path d={`M${-w * 0.7},${-h * 0.72} l${w * 0.22},${h * 0.1}`}
        stroke="#0006" strokeWidth={2} fill="none" />
    </g>
  );
}

/** Pottery: a wheel, a stool and shelves of drying work. The quiet screen. */
export function Studio({ s = 1 }: { s?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-96} y={-124} width={192} height={124} rx={3} fill="currentColor" opacity={0.55} />
      <rect x={-84} y={-58} width={168} height={4} fill="#C9B79C" />
      {[-66, -34, -2, 30, 62].map((x, i) => (
        <path key={i} d={`M${x - 7},-58 q7,-13 14,0 Z`} fill="#C9B79C" opacity={0.9 - i * 0.06} />
      ))}
      <g transform="translate(0 0)">
        <rect x={-4} y={-40} width={8} height={40} fill="#6C6154" />
        <ellipse cx={0} cy={-42} rx={26} ry={5} fill="#8B7E6D" />
        <path d="M-9,-46 q9,-15 18,0 l-2,4 q-7,4 -14,0 Z" fill="#C9743A" />
      </g>
      <rect x={52} y={-34} width={30} height={34} rx={2} fill="#7A6A58" />
    </g>
  );
}

/** Open-air murals — the Group of Seven gallery is outdoors, on walls. */
export function Mural({ s = 1, seed = 2 }: { s?: number; seed?: number }): JSX.Element {
  let a = seed >>> 0;
  const rnd = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const w = 64 + rnd() * 26;
  const h = 78 + rnd() * 30;
  const tints = ["#C9743A", "#4E7A5E", "#3E6280", "#B2913F"];
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="currentColor" />
      <rect x={-w / 2 + 6} y={-h + 8} width={w - 12} height={h - 22}
        fill={tints[Math.floor(rnd() * tints.length)] ?? "#C9743A"} opacity={0.85} />
      <path d={`M${-w / 2 + 8},${-h * 0.42} l${w * 0.24},${-h * 0.2} l${w * 0.2},${h * 0.16}
        l${w * 0.18},${-h * 0.24} l${w * 0.16},${h * 0.5} l${-w + 20},0 Z`}
        fill="#2B2B33" opacity={0.42} />
    </g>
  );
}

/** A dock and a moored boat. Muskoka's whole idea of a shoreline. */
export function Dock({ s = 1 }: { s?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-52} y={-10} width={104} height={5} fill="currentColor" />
      {[-44, -20, 4, 28, 46].map((x) => (
        <rect key={x} x={x} y={-10} width={3.4} height={14} fill="currentColor" />
      ))}
      <path d="M58,-10 q16,0 22,8 l-42,0 q4,-8 20,-8 Z" fill="currentColor" opacity={0.85} />
      <rect x={66} y={-34} width={2} height={24} fill="currentColor" />
    </g>
  );
}

/** Fire tower / lookout tower on a ridge. */
export function Tower({ s = 1, h = 96 }: { s?: number; h?: number }): JSX.Element {
  return (
    <g transform={`scale(${s})`} fill="currentColor">
      <path d={`M-13,0 L-5,${-h} L5,${-h} L13,0 L9,0 L3,${-h * 0.94} L-3,${-h * 0.94} L-9,0 Z`} />
      {[0.3, 0.55, 0.78].map((t) => (
        <rect key={t} x={-13 + t * 9} y={-h * t} width={26 - t * 18} height={2.4} />
      ))}
      <rect x={-13} y={-h - 15} width={26} height={15} />
      <path d="M-16,-98 L16,-98 L10,-106 L-10,-106 Z" transform={`translate(0 ${-h + 98})`} />
    </g>
  );
}
