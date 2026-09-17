"use client";

import type { JSX, ReactNode } from "react";

/**
 * The drawing kit for the hand-drawn trip maps, lifted from Muskoka's sheet so
 * every trip is drawn in the same paper, water and ink.
 *
 * These are sketches, not surveys: towns sit where they really are relative to
 * each other, but shorelines and roads are drawn by hand and simplified.
 */

export const SERIF = "var(--font-display), Georgia, serif";
export const MONO = "var(--font-mono), monospace";
export const SANS = "var(--font-body), sans-serif";

/** Muskoka's three inks: the drive in, the big day, the way home. */
export const INK = { in: "#b4832c", day: "#2f5d52", home: "#9c4a2f" } as const;

const PAPER = "#e3ded4";

export function Sheet(
  { w, h, label, children }: { w: number; h: number; label: string; children: ReactNode },
): JSX.Element {
  return (
    <div className="mapbox">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
        <rect x="0" y="0" width={w} height={h} fill={PAPER} />
        {children}
      </svg>
    </div>
  );
}

export function Water({ d }: { d: string }): JSX.Element {
  return <path d={d} fill="#b9cdd2" stroke="#8fadb5" strokeWidth="1" strokeLinejoin="round" />;
}

/** Land drawn on top of water — an island. */
export function Land({ d }: { d: string }): JSX.Element {
  return <path d={d} fill={PAPER} stroke="#8fadb5" strokeWidth="1" strokeLinejoin="round" />;
}

export function Park({ d }: { d: string }): JSX.Element {
  return (
    <path d={d} fill="#d3d9c2" stroke="#8a9a74" strokeWidth="1.2" strokeDasharray="5 4"
      strokeLinejoin="round" />
  );
}

export function WaterLabel(
  { x, y, children, size = 11, rotate }: { x: number; y: number; children: ReactNode; size?: number; rotate?: number },
): JSX.Element {
  return (
    <text x={x} y={y} fontFamily={SERIF} fontStyle="italic" fontSize={size} fill="#5b7a82"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      {children}
    </text>
  );
}

export function AreaLabel(
  { x, y, children, rotate, anchor = "start" }:
  { x: number; y: number; children: ReactNode; rotate?: number; anchor?: "start" | "middle" | "end" },
): JSX.Element {
  return (
    <text x={x} y={y} fontFamily={MONO} fontSize="9.5" letterSpacing=".14em" fill="#7d8a6a"
      textAnchor={anchor} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      {children}
    </text>
  );
}

/** A highway: the fat tan band with a dashed centre line, as Hwy 11 is drawn. */
export function Highway(
  { points, label, lx, ly, rotate = 0 }:
  { points: string; label?: string; lx?: number; ly?: number; rotate?: number },
): JSX.Element {
  return (
    <g>
      <polyline points={points} fill="none" stroke="#c9b98e" strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points} fill="none" stroke="#a8945f" strokeWidth="1.4" strokeDasharray="7 7" />
      {label && lx !== undefined && ly !== undefined && (
        <text x={lx} y={ly} fontFamily={MONO} fontSize="10" fill="#7d6c3c"
          transform={`rotate(${rotate} ${lx} ${ly})`}>{label}</text>
      )}
    </g>
  );
}

export function Street({ points }: { points: string }): JSX.Element {
  return (
    <polyline points={points} fill="none" stroke="#cfc3a2" strokeWidth="4"
      strokeLinecap="round" strokeLinejoin="round" />
  );
}

export function Route(
  { points, ink, dashed = false }: { points: string; ink: string; dashed?: boolean },
): JSX.Element {
  return (
    <polyline points={points} fill="none" stroke={ink}
      strokeWidth={dashed ? 2.2 : 3.4} strokeDasharray={dashed ? "6 6" : undefined}
      strokeLinecap="round" strokeLinejoin="round" />
  );
}

/** A place: a paper dot; where you sleep is bigger and has a centre. */
export function Node(
  { x, y, size = "stop", ink = INK.home }: { x: number; y: number; size?: "base" | "town" | "stop"; ink?: string },
): JSX.Element {
  const r = size === "base" ? 8 : size === "town" ? 6.5 : 5;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f5f2ec" stroke="#2a3330" strokeWidth="1.6" />
      {size === "base" && <circle cx={x} cy={y} r="3" fill={ink} />}
    </g>
  );
}

/** Towns in the bold sans; the things you do there in the small mono. */
export function Label(
  { x, y, children, kind = "stop", anchor = "start" }:
  { x: number; y: number; children: ReactNode; kind?: "town" | "stop"; anchor?: "start" | "middle" | "end" },
): JSX.Element {
  // a paper-coloured halo, so a label that crosses a road or a shoreline stays legible
  const halo = { stroke: PAPER, strokeWidth: 3, strokeLinejoin: "round" as const, paintOrder: "stroke" };
  return kind === "town" ? (
    <text x={x} y={y} fontFamily={SANS} fontSize="12.5" fontWeight="600" fill="#222b28"
      textAnchor={anchor} {...halo}>{children}</text>
  ) : (
    <text x={x} y={y} fontFamily={MONO} fontSize="9.5" fill="#55605b" textAnchor={anchor} {...halo}>{children}</text>
  );
}

/** The way home: a line to the edge of the paper, an arrowhead, and TORONTO. */
export function Home(
  { x1, y1, x2, y2, note, anchor = "start" }:
  { x1: number; y1: number; x2: number; y2: number; note?: string; anchor?: "start" | "end" },
): JSX.Element {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const back = (d: number, side: number): string =>
    `${x2 - Math.cos(a) * d + Math.cos(a + Math.PI / 2) * side},${y2 - Math.sin(a) * d + Math.sin(a + Math.PI / 2) * side}`;
  const tx = x2 + (anchor === "start" ? 14 : -14);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - Math.cos(a) * 10} y2={y2 - Math.sin(a) * 10}
        stroke="#6d6458" strokeWidth="1.6" />
      <polygon points={`${x2},${y2} ${back(16, 6)} ${back(16, -6)}`} fill="#6d6458" />
      <text x={tx} y={y2 - 8} fontFamily={MONO} fontSize="10" fill="#4f4a42" textAnchor={anchor}>TORONTO</text>
      {note && (
        <text x={tx} y={y2 + 5} fontFamily={MONO} fontSize="9" fill="#7a7368" textAnchor={anchor}>{note}</text>
      )}
    </g>
  );
}

export function North({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g>
      <line x1={x} y1={y + 6} x2={x} y2={y + 34} stroke="#4f4a42" strokeWidth="1.6" />
      <polygon points={`${x},${y} ${x - 5},${y + 14} ${x + 5},${y + 14}`} fill="#4f4a42" />
      <text x={x} y={y + 48} fontFamily={SERIF} fontSize="12" fill="#4f4a42" textAnchor="middle">N</text>
    </g>
  );
}

export type LegendItem = { ink: string; label: string; dashed?: boolean };

export function Legend({ items, note }: { items: LegendItem[]; note?: string }): JSX.Element {
  return (
    <div className="maplegend">
      {items.map((it) => (
        <span key={it.label}>
          <i style={{ background: it.ink, height: it.dashed ? 2 : undefined, opacity: it.dashed ? 0.6 : undefined }} />
          {it.label}
        </span>
      ))}
      {note && <span className="maplegend__note">{note}</span>}
    </div>
  );
}
