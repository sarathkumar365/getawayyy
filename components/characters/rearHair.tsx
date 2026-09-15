import {
  CURSE_CROWN, SUN_CROWN, type Crown, type DetailId, type Face,
} from "@/lib/characters/detailed";

/**
 * Hair from behind.
 *
 * The same spike tables as the front view, so the silhouette that identifies
 * each of them survives the turn — but closed across the BOTTOM of the skull
 * rather than across a hairline, because from here there is no forehead to clear
 * and the mass hangs down over the neck.
 */
const f2 = (v: number): string => `${Math.round(v * 100) / 100}`;

function pt(a: number, f: Face, scale: number): [number, number] {
  const r = (a * Math.PI) / 180;
  return [Math.sin(r) * f.craniumRx * scale, f.craniumY - Math.cos(r) * f.craniumRy * scale];
}

export function crownPath(id: DetailId, f: Face): string {
  const crown: readonly Crown[] = id === "sun" ? SUN_CROWN : CURSE_CROWN;
  if (crown.length === 0) return "";
  const VALLEY = 0.94;
  // wider than the front: from behind you see the whole head of hair
  const temple = 150;
  const drop = id === "sun" ? 0.5 : 1.15;
  const start = pt(-temple, f, 1.02);
  const parts: string[] = [`M${f2(start[0])},${f2(start[1])}`];

  for (const c of crown) {
    // mirrored: a spike that sweeps back on the front view sweeps the other way here
    const a = -c.a;
    const skew = -c.skew;
    parts.push(`L${f2(pt(a - c.w / 2, f, VALLEY)[0])},${f2(pt(a - c.w / 2, f, VALLEY)[1])}`);
    parts.push(`L${f2(pt(a + skew, f, 1 + c.len * 0.8)[0])},${f2(pt(a + skew, f, 1 + c.len * 0.8)[1])}`);
    parts.push(`L${f2(pt(a + c.w / 2, f, VALLEY)[0])},${f2(pt(a + c.w / 2, f, VALLEY)[1])}`);
  }

  const end = pt(temple, f, 1.02);
  parts.push(`L${f2(end[0])},${f2(end[1])}`);
  // close under the skull — the mass that hangs over the collar
  const bottom = f.craniumY + f.craniumRy * drop;
  parts.push(
    `Q${f2(f.craniumRx * 0.7)},${f2(bottom)} 0,${f2(bottom + f.craniumRy * 0.1)}`,
    `Q${f2(-f.craniumRx * 0.7)},${f2(bottom)} ${f2(start[0])},${f2(start[1])}`,
    "Z",
  );
  return parts.join(" ");
}

export function hairPathFallback(f: Face): string {
  return `M${-f.craniumRx},${f.craniumY} a${f.craniumRx},${f.craniumRy} 0 1 1 ${f.craniumRx * 2},0 Z`;
}
