/**
 * What things are actually coloured, and how distance drains that colour.
 *
 * The first single-stage build painted every prop one flat slate, because the
 * corridor set a single `color` on the world and the per-terrain classes stopped
 * applying once all nine legs shared a stage. A pine, a maple in October and a
 * brick block came out the same shade at every distance, which is what made the
 * trees look wrong.
 */

export type RGB = readonly [number, number, number];

export const hexToRgb = (hex: string): RGB => {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  const n = Number.parseInt(m?.[1] ?? "808080", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const css = (c: RGB): string =>
  `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;

/**
 * Base colour per kind. These are October in central Ontario, which is the
 * entire reason the trip is that weekend — the maples are the point.
 */
const BASE: Record<string, RGB> = {
  pine: hexToRgb("#1E3A2B"),
  cedar: hexToRgb("#22402F"),
  birch: hexToRgb("#8E8A54"),
  maple: hexToRgb("#A83E27"),
  apple: hexToRgb("#4C6B38"),

  block: hexToRgb("#2B313C"),
  store: hexToRgb("#33303A"),
  tower: hexToRgb("#2E3440"),
  studio: hexToRgb("#3A3330"),
  mural: hexToRgb("#3C4150"),
  falls: hexToRgb("#38505E"),
  cliff: hexToRgb("#4A4438"),
  dock: hexToRgb("#4A3B2C"),

  lamp: hexToRgb("#262A31"),
  post: hexToRgb("#3A3F48"),
  sign: hexToRgb("#26402E"),
  dash: hexToRgb("#8C8878"),
};

const FALLBACK = hexToRgb("#2C333D");

/**
 * Aerial perspective: distant things lose contrast against the sky long before
 * they lose detail. Without this every tree reads at the same distance however
 * small it is drawn, which is exactly the flatness the depth engine exists to
 * avoid.
 */
export function propColour(kind: string, distance: number, far: number, sky: RGB): string {
  const base = BASE[kind] ?? FALLBACK;
  const t = Math.min(1, Math.max(0, distance / far));
  // Most of the fade happens across the back half of the view, so near trees
  // keep their colour and the far ones dissolve.
  const fog = t ** 1.35 * 0.82;
  return css(mixRgb(base, sky, fog));
}
