import type { JSX } from "react";

/**
 * Scene parts. Everything is a silhouette with a `fill` of `currentColor`, so a
 * layer sets one colour and every element in it obeys — which is how six depth
 * layers stay readable instead of turning into soup.
 */

/** Deterministic scatter. Math.random() here would desync SSR from the client. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TreeKind = "pine" | "birch" | "maple" | "apple" | "cedar";

function pine(h: number): string {
  const w = h * 0.34;
  const tiers = 4;
  const parts: string[] = [`M0,0 L${-w * 0.09},0 L${-w * 0.09},${-h * 0.2}`];
  for (let i = 0; i < tiers; i += 1) {
    const top = -h * (0.2 + (0.8 * (i + 1)) / tiers);
    const bot = -h * (0.2 + (0.8 * i) / tiers);
    const spread = w * (1 - i / (tiers + 0.6));
    parts.push(`L${-spread},${bot} L${-spread * 0.42},${bot} L${-spread * 0.86},${top}`);
  }
  parts.push(`L0,${-h}`);
  // mirror
  for (let i = tiers - 1; i >= 0; i -= 1) {
    const top = -h * (0.2 + (0.8 * (i + 1)) / tiers);
    const bot = -h * (0.2 + (0.8 * i) / tiers);
    const spread = w * (1 - i / (tiers + 0.6));
    parts.push(`L${spread * 0.86},${top} L${spread * 0.42},${bot} L${spread},${bot}`);
  }
  parts.push(`L${w * 0.09},${-h * 0.2} L${w * 0.09},0 Z`);
  return parts.join(" ");
}

function roundCrown(h: number, wob: number): string {
  const w = h * 0.42;
  const t = -h * 0.42;
  return [
    `M${-w * 0.07},0 L${-w * 0.07},${t}`,
    `C${-w * 1.05},${t} ${-w * (1 + wob)},${-h * 0.98} 0,${-h}`,
    `C${w * (1 + wob)},${-h * 0.98} ${w * 1.05},${t} ${w * 0.07},${t}`,
    `L${w * 0.07},0 Z`,
  ].join(" ");
}

function birch(h: number): string {
  const w = h * 0.055;
  return [
    `M${-w},0 L${-w * 0.7},${-h * 0.62}`,
    `L${-h * 0.15},${-h * 0.8} L${-w * 0.4},${-h * 0.7}`,
    `L${-w * 0.3},${-h}`,
    `L${w * 0.3},${-h}`,
    `L${w * 0.4},${-h * 0.72} L${h * 0.14},${-h * 0.84} L${w * 0.7},${-h * 0.6}`,
    `L${w},0 Z`,
  ].join(" ");
}

export function Tree({
  kind, x, h, flip = false,
}: { kind: TreeKind; x: number; h: number; flip?: boolean }): JSX.Element {
  const d =
    kind === "pine" ? pine(h)
    : kind === "birch" ? birch(h)
    : kind === "cedar" ? pine(h * 1.1)
    : roundCrown(h, kind === "apple" ? 0.05 : 0.18);
  return (
    <path d={d} transform={`translate(${x} 0)${flip ? " scale(-1 1)" : ""}`} fill="currentColor" />
  );
}

/** A band of trees, deterministic for a given seed. */
export function TreeLine({
  kinds, seed, count, width, minH, maxH,
}: {
  kinds: readonly TreeKind[]; seed: number; count: number;
  width: number; minH: number; maxH: number;
}): JSX.Element {
  const rnd = seeded(seed);
  const items = Array.from({ length: count }, (_, i) => {
    const k = kinds[Math.floor(rnd() * kinds.length)] ?? "pine";
    return {
      kind: k,
      x: (i / count) * width + rnd() * (width / count) * 0.9,
      h: minH + rnd() * (maxH - minH),
      flip: rnd() > 0.5,
    };
  });
  return <>{items.map((t, i) => <Tree key={i} {...t} />)}</>;
}

/** A ridgeline. `rough` controls how jagged — escarpment vs rolling maple hills. */
export function Ridge({
  seed, width, base, height, rough, steps = 26,
}: {
  seed: number; width: number; base: number; height: number; rough: number; steps?: number;
}): JSX.Element {
  const rnd = seeded(seed);
  const pts: string[] = [`M0,${base}`];
  let y = base - height * 0.5;
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    y += (rnd() - 0.5) * height * rough;
    y = Math.max(base - height, Math.min(base - height * 0.12, y));
    pts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  }
  pts.push(`L${width},${base} Z`);
  return <path d={pts.join(" ")} fill="currentColor" />;
}

/** Muskoka's signature: the Portage Flyer, and the one stop with no Google photos. */
export function SteamTrain({ x, scale = 1 }: { x: number; scale?: number }): JSX.Element {
  return (
    <g transform={`translate(${x} 0) scale(${scale})`} fill="currentColor">
      <rect x={-26} y={-15} width={30} height={11} rx={1.5} />
      <rect x={4} y={-22} width={20} height={18} rx={2} />
      <rect x={-22} y={-24} width={7} height={9} rx={1} />
      <circle cx={-18} cy={-1.5} r={3.4} />
      <circle cx={-6} cy={-1.5} r={3.4} />
      <circle cx={10} cy={-1.5} r={4.4} />
      <circle cx={20} cy={-1.5} r={4.4} />
      <rect x={-28} y={-3.5} width={54} height={2} />
    </g>
  );
}
