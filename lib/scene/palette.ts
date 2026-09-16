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
 * Base colour per kind — the shared road, and the trees that grow on all five.
 *
 * These are October in Ontario and Québec, which is the entire reason the trip
 * is that weekend: the maples are the point.
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

  /* ---- Canadian Shield ---- */
  rockcut: hexToRgb("#6A6055"),      // pink-grey gneiss, lighter than anything around it
  cottage: hexToRgb("#3E3A33"),
  canoe: hexToRgb("#4A3B2C"),
  spruce: hexToRgb("#16301F"),       // black spruce really is nearly black
  tamarack: hexToRgb("#C08A2E"),     // the one conifer that turns, and it turns gold
  bog: hexToRgb("#4E5A38"),
  moose: hexToRgb("#3A3F48"),

  /* ---- Niagara Escarpment ---- */
  scarp: hexToRgb("#8B8270"),        // dolostone: pale, and it catches the light
  orchard: hexToRgb("#4C6B38"),
  barn: hexToRgb("#6B3229"),
  skihill: hexToRgb("#3D5340"),
  light: hexToRgb("#B9B3A4"),
  terminal: hexToRgb("#7E7A70"),
  fence: hexToRgb("#5A4A36"),

  /* ---- Montréal ---- */
  plex: hexToRgb("#6E4239"),         // brick, which is what that city is made of
  parish: hexToRgb("#5E5A55"),
  cross: hexToRgb("#2F4034"),
  olympic: hexToRgb("#8A8578"),
  hedge: hexToRgb("#3F5236"),

  /* ---- Québec ---- */
  maison: hexToRgb("#8A8378"),       // fieldstone and lime render
  spire: hexToRgb("#6E6A63"),
  wall: hexToRgb("#7C7466"),
  chateau: hexToRgb("#7A6E5F"),
  strip: hexToRgb("#5B6B3E"),
  stand: hexToRgb("#6B5340"),
};

/**
 * What each trip does differently.
 *
 * A pine on Highway 11 and a pine on Highway 60 are the same tree, but the
 * Beaver Valley's hardwood is further on than Algonquin's, Montréal's street
 * trees are half bare, and the light coming off the St Lawrence is colder than
 * anything inland. These override BASE for one trip only.
 */
const WORLDS: Record<string, Record<string, RGB>> = {
  /* Shield granite and white pine. The lakes are the whole idea. */
  muskoka: {
    pine: hexToRgb("#1B3627"),
    birch: hexToRgb("#A89A54"),
    maple: hexToRgb("#B04527"),
    block: hexToRgb("#2E343E"),
    store: hexToRgb("#3A3239"),
  },

  /* Hardwood at its loudest, black spruce at its darkest, tamarack gold. */
  "algonquin-haliburton": {
    maple: hexToRgb("#C2431F"),
    birch: hexToRgb("#C0A24E"),
    pine: hexToRgb("#1A3324"),
    store: hexToRgb("#3B342E"),
  },

  /* Limestone, orchard green, and a bay that is colder than the lakes. */
  "georgian-bay": {
    pine: hexToRgb("#27432F"),
    cedar: hexToRgb("#2B4633"),
    maple: hexToRgb("#A8502A"),
    store: hexToRgb("#413A39"),
  },

  /* City brick, copper gone green, street trees already half down. */
  montreal: {
    maple: hexToRgb("#9A6A2E"),
    pine: hexToRgb("#2A3B31"),
    store: hexToRgb("#4A3E3A"),
    block: hexToRgb("#3A3038"),
  },

  /* Stone, tin, and river light. The coldest palette of the five. */
  "quebec-city": {
    maple: hexToRgb("#9C4B2C"),
    pine: hexToRgb("#24382F"),
    store: hexToRgb("#454039"),
    block: hexToRgb("#3A3C42"),
  },
};

const FALLBACK = hexToRgb("#2C333D");

/**
 * Aerial perspective: distant things lose contrast against the sky long before
 * they lose detail. Without this every tree reads at the same distance however
 * small it is drawn, which is exactly the flatness the depth engine exists to
 * avoid.
 */
export function propColour(
  kind: string, distance: number, far: number, sky: RGB, world = "",
): string {
  const base = WORLDS[world]?.[kind] ?? BASE[kind] ?? FALLBACK;
  const t = Math.min(1, Math.max(0, distance / far));
  // Most of the fade happens across the back half of the view, so near trees
  // keep their colour and the far ones dissolve.
  const fog = t ** 1.35 * 0.82;
  return css(mixRgb(base, sky, fog));
}
