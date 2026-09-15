import type { JSX } from "react";
import type { PlaceIcon } from "@/lib/scene/route";

/**
 * Place markers, drawn at roughly 10 units tall on a 0-100 map.
 *
 * Each says what you actually DO there rather than that a stop exists — a
 * pottery wheel, a lookout, a market awning. That is the difference between a
 * route diagram and a map you want to look at.
 */

const ACCENT = "var(--map-accent, #FF7A2F)";
const INK = "var(--map-ink, #F2EEE6)";
const PAPER = "var(--map-paper, #1B2028)";

function Pin({ children, tint }: { children: JSX.Element; tint?: string }): JSX.Element {
  return (
    <g>
      <circle r={4.6} fill={PAPER} stroke={tint ?? INK} strokeWidth={0.8} />
      {children}
    </g>
  );
}

export function MapIcon({ kind }: { kind: PlaceIcon }): JSX.Element {
  switch (kind) {
    case "origin":
      return (
        <g>
          <circle r={4.4} fill="none" stroke={INK} strokeWidth={1.1} />
          <circle r={1.5} fill={INK} />
        </g>
      );

    case "pottery": // a wheel and a pot — the thing every trip is secretly for
      return (
        <Pin tint={ACCENT}>
          <g>
            <path d="M-2.2,-2.4 q2.2,-1.6 4.4,0 l-0.5,3 q-1.7,1.1 -3.4,0 Z" fill={ACCENT} />
            <rect x={-3} y={1} width={6} height={1} rx={0.5} fill={ACCENT} />
            <path d="M-3.4,2.4 L3.4,2.4" stroke={ACCENT} strokeWidth={0.8} strokeLinecap="round" />
          </g>
        </Pin>
      );

    case "nature":
      return (
        <Pin>
          <g fill={INK}>
            <path d="M0,-3.6 L2.1,0 L-2.1,0 Z" />
            <path d="M0,-1.2 L2.7,2.2 L-2.7,2.2 Z" />
            <rect x={-0.45} y={2} width={0.9} height={1.4} />
          </g>
        </Pin>
      );

    case "view": // a lookout over a drop
      return (
        <Pin>
          <g stroke={INK} strokeWidth={0.9} fill="none" strokeLinecap="round">
            <path d="M-3.2,2.4 L-0.6,2.4 L-0.6,-1.4" />
            <path d="M-2.4,-1.4 L1.2,-1.4" />
            <circle cx={2.2} cy={-2.6} r={1.2} fill={ACCENT} stroke="none" />
            <path d="M0.6,2.4 L3.4,2.4" />
          </g>
        </Pin>
      );

    case "history":
      return (
        <Pin>
          <g fill={INK}>
            <path d="M-3.4,-1 L0,-3.4 L3.4,-1 Z" />
            <rect x={-2.8} y={-1} width={5.6} height={3.6} />
            <rect x={-1} y={0.4} width={2} height={2.2} fill={PAPER} />
          </g>
        </Pin>
      );

    case "architecture": // a spire
      return (
        <Pin>
          <g fill={INK}>
            <path d="M0,-4 L1.6,-1.2 L-1.6,-1.2 Z" />
            <rect x={-1.5} y={-1.2} width={3} height={3.8} />
            <rect x={-0.5} y={0.2} width={1} height={2.4} fill={PAPER} />
          </g>
        </Pin>
      );

    case "art":
      return (
        <Pin>
          <g>
            <rect x={-2.8} y={-2.8} width={5.6} height={5.6} rx={0.6}
              fill="none" stroke={INK} strokeWidth={0.9} />
            <circle cx={-0.8} cy={-0.8} r={1} fill={ACCENT} />
            <path d="M-2.2,2 L0.4,-0.4 L2.2,2 Z" fill={INK} />
          </g>
        </Pin>
      );

    case "market":
      return (
        <Pin>
          <g>
            <path d="M-3.2,-1 q1.6,-1.8 3.2,0 q1.6,-1.8 3.2,0 L3.2,-1 L-3.2,-1 Z" fill={ACCENT} />
            <rect x={-2.6} y={-1} width={5.2} height={3.4} fill="none"
              stroke={INK} strokeWidth={0.8} />
          </g>
        </Pin>
      );

    case "food":
      return (
        <Pin>
          <g stroke={INK} strokeWidth={0.9} fill="none" strokeLinecap="round">
            <path d="M-2.6,-1.4 q0,3.6 2.6,3.6 q2.6,0 2.6,-3.6 Z" fill={INK} stroke="none" />
            <path d="M2.4,-0.8 q1.6,0 1.6,1.2 q0,1.2 -1.6,1.2" />
          </g>
        </Pin>
      );

    case "landmark":
      return (
        <Pin tint={ACCENT}>
          <path d="M0,-3.8 L1,-1.2 L3.6,-1.2 L1.5,0.5 L2.3,3 L0,1.5 L-2.3,3 L-1.5,0.5 L-3.6,-1.2 L-1,-1.2 Z"
            fill={ACCENT} />
        </Pin>
      );

    case "water":
      return (
        <Pin>
          <path d="M-3,-0.6 q1.5,-1.4 3,0 q1.5,1.4 3,0 M-3,1.8 q1.5,-1.4 3,0 q1.5,1.4 3,0"
            stroke={INK} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        </Pin>
      );

    case "town":
    default:
      return (
        <Pin>
          <g fill={INK}>
            <path d="M-3.2,0.4 L-1.4,-1.6 L0.4,0.4 L0.4,2.6 L-3.2,2.6 Z" />
            <path d="M0.6,-0.4 L2.2,-2.2 L3.6,-0.4 L3.6,2.6 L0.6,2.6 Z" />
          </g>
        </Pin>
      );
  }
}

export const ICON_LABEL: Record<PlaceIcon, string> = {
  origin: "start",
  pottery: "pottery",
  nature: "trails and falls",
  view: "lookout",
  history: "heritage",
  architecture: "old stone",
  art: "art",
  market: "market",
  food: "food",
  landmark: "landmark",
  town: "town",
  water: "water",
};
