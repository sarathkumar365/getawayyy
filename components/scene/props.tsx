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
