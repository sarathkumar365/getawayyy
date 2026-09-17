/**
 * The detailed rig — a second, higher-fidelity design that lives ALONGSIDE the
 * mascot rig in `rig.ts`. Nothing here replaces that one; both ship.
 *
 * What makes this one read as drawn rather than constructed:
 *   · ~6.5-head proportions instead of 5.5, with a real jaw and cheekbone
 *   · eyes built the way anime eyes actually are — sclera, iris, pupil, two
 *     specular highlights, a heavy tapered upper lash line, a thin lower lid
 *   · hair as individually tapered strands with a sheen band, not one silhouette
 *   · tailored garments: collars, sleeve caps, a sash, seams
 *   · an emote layer (blush, sweat, anger, shadow) on top of the expression grid
 *
 * Poses are shared with the mascot rig — WALK, ARM_POSES and IDLE are pure joint
 * angles and care nothing about how the character is drawn.
 */

import type { Skeleton } from "./rig";

export type DetailId = "sun" | "curse";

/** Wider than the mascot set — the point of this rig is range. */
export type DBrow =
  | "neutral" | "raised" | "furrowed" | "worried" | "delighted" | "angry" | "flat";
export type DEye =
  | "open" | "half" | "closed" | "wide" | "sparkle" | "side" | "squint" | "shadowed";
export type DMouth =
  | "closed" | "smile" | "grin" | "open" | "o"
  | "talkA" | "talkO" | "sad" | "smirk" | "grimace";
/** Anime shorthand that does the emotional heavy lifting. */
export type DEmote = "none" | "blush" | "sweat" | "anger" | "sparkle" | "shadow" | "cold";

export const D_BROWS: readonly DBrow[] =
  ["neutral", "raised", "furrowed", "worried", "delighted", "angry", "flat"] as const;
export const D_EYES: readonly DEye[] =
  ["open", "half", "closed", "wide", "sparkle", "side", "squint", "shadowed"] as const;
export const D_MOUTHS: readonly DMouth[] =
  ["closed", "smile", "grin", "open", "o", "talkA", "talkO", "sad", "smirk", "grimace"] as const;
export const D_EMOTES: readonly DEmote[] =
  ["none", "blush", "sweat", "anger", "sparkle", "shadow", "cold"] as const;

export type DOutfit = "kit" | "parka" | "shell" | "beret" | "tote";
export const D_OUTFITS: readonly DOutfit[] =
  ["kit", "parka", "shell", "beret", "tote"] as const;

/** Head construction points, in head-local coordinates. */
export type Face = {
  top: number;
  chin: number;
  craniumY: number;
  craniumRx: number;
  craniumRy: number;
  jawX: number;
  jawY: number;
  eyeY: number;
  eyeX: number;
  eyeW: number;
  eyeH: number;
  browY: number;
  noseY: number;
  mouthY: number;
  earY: number;
};

export type DetailPalette = {
  skin: string;
  skinShade: string;
  blush: string;
  hair: string;
  hairShade: string;
  hairLight: string;
  iris: string;
  irisDeep: string;
  top: string;
  trim: string;
  bottom: string;
  shoe: string;
  shoeTrim: string;
  ink: string;
  accent: string;
};

export type DetailChar = {
  id: DetailId;
  name: string;
  skeleton: Skeleton;
  face: Face;
  palette: DetailPalette;
  markings: boolean;
};

const SUN_FACE: Face = {
  top: 8, chin: 66, craniumY: 34, craniumRx: 25, craniumRy: 27,
  jawX: 20, jawY: 50,
  eyeY: 43, eyeX: 13.5, eyeW: 17, eyeH: 14.5,
  browY: 29, noseY: 52, mouthY: 59, earY: 40,
};

const CURSE_FACE: Face = {
  top: 8, chin: 68, craniumY: 34, craniumRx: 24.5, craniumRy: 27,
  jawX: 19.5, jawY: 51,
  eyeY: 44, eyeX: 13, eyeW: 16.5, eyeH: 12,
  browY: 31, noseY: 53, mouthY: 61, earY: 41,
};

/**
 * ~6.4 heads for A, ~6.9 for B. The mascot rig deliberately runs short and
 * big-headed; this one does not, which is most of why it reads as older.
 */
const SUN_SKELETON: Skeleton = {
  viewBox: "-125 0 250 400",
  head: { cx: 0, cy: 34, rx: 25, ry: 27, pivotY: 70 },
  neck: { top: 62, bottom: 84, w: 19 },
  torso: { shoulderY: 90, shoulderW: 76, waistY: 158, waistW: 54, hipY: 184, hipW: 64 },
  shoulderX: 33,
  upperArm: 56,
  foreArm: 52,
  hipX: 18,
  thigh: 82,
  shin: 80,
  foot: { len: 32, h: 11 },
  face: { eyeY: 43, eyeX: 13, browY: 29, mouthY: 59, eyeR: 6.5 },
  stroke: 2.5,
};

const CURSE_SKELETON: Skeleton = {
  viewBox: "-125 0 250 400",
  head: { cx: 0, cy: 34, rx: 24.5, ry: 27, pivotY: 72 },
  neck: { top: 64, bottom: 86, w: 20 },
  torso: { shoulderY: 92, shoulderW: 82, waistY: 162, waistW: 58, hipY: 188, hipW: 68 },
  shoulderX: 36,
  upperArm: 60,
  foreArm: 56,
  hipX: 19,
  thigh: 88,
  shin: 86,
  foot: { len: 34, h: 11 },
  face: { eyeY: 44, eyeX: 12.5, browY: 31, mouthY: 61, eyeR: 6 },
  stroke: 2.5,
};

export const DETAILED: Record<DetailId, DetailChar> = {
  sun: {
    id: "sun",
    name: "the Sunshine",
    skeleton: SUN_SKELETON,
    face: SUN_FACE,
    markings: false,
    palette: {
      skin: "#FFE3CA",
      skinShade: "#EFC09A",
      blush: "#FF9C86",
      hair: "#FF7A2F",
      hairShade: "#C94D10",
      hairLight: "#FFB169",
      iris: "#8A4A1C",
      irisDeep: "#3F1D06",
      top: "#FF7A2F",
      trim: "#1B1B22",
      bottom: "#1B1B22",
      shoe: "#F5F1EA",
      shoeTrim: "#FF7A2F",
      ink: "#2A1D18",
      accent: "#FF7A2F",
    },
  },
  curse: {
    id: "curse",
    name: "the Curse",
    skeleton: CURSE_SKELETON,
    face: CURSE_FACE,
    markings: true,
    palette: {
      skin: "#F6DCCE",
      skinShade: "#DDB49F",
      blush: "#E58A8A",
      hair: "#C1121F",
      hairShade: "#7C0A13",
      hairLight: "#E8556A",
      iris: "#A50E1A",
      irisDeep: "#3A060C",
      top: "#23222B",
      trim: "#C1121F",
      bottom: "#15151B",
      shoe: "#15151B",
      shoeTrim: "#4A4652",
      ink: "#141318",
      accent: "#C1121F",
    },
  },
};

/* ---------------- hair, as individual strands ---------------- */

export type Strand = {
  /** base position along the hairline, -1 = left temple, +1 = right temple */
  base: number;
  /** tip offset from the base, in head-local units */
  dx: number;
  dy: number;
  /** base half-width */
  w: number;
  /** sideways bow of the strand */
  bow: number;
};

export type Crown = {
  /** angle from vertical */
  a: number;
  len: number;
  w: number;
  skew: number;
};

/**
 * A's fringe. The hard constraint: there are only ~11 units of forehead between
 * the hairline and the brows, so anything hanging further than that sits ON the
 * eyes. Centre strands stop at brow level; the long locks go OUTSIDE the eyes,
 * down past the temples, where length costs nothing.
 */
export const SUN_STRANDS: readonly Strand[] = [
  { base: -0.98, dx: -6, dy: 30, w: 5, bow: -3 },
  { base: -0.80, dx: -4, dy: 21, w: 5, bow: -2 },
  { base: -0.52, dx: 1, dy: 13, w: 5.5, bow: 1 },
  { base: -0.22, dx: -2, dy: 11, w: 5, bow: -1 },
  { base: 0.08, dx: 3, dy: 14, w: 5.5, bow: 2 },
  { base: 0.38, dx: 5, dy: 12, w: 5, bow: 2 },
  { base: 0.66, dx: 7, dy: 19, w: 5, bow: 3 },
  { base: 0.94, dx: 9, dy: 28, w: 5, bow: 3 },
];

/** B's: heavier and swept, with one deliberately long lock past his left eye. */
export const CURSE_STRANDS: readonly Strand[] = [
  { base: -0.98, dx: -7, dy: 34, w: 5.5, bow: -3 },
  { base: -0.82, dx: -2, dy: 26, w: 5.5, bow: 2 },
  { base: -0.54, dx: 5, dy: 15, w: 6, bow: 4 },
  { base: -0.22, dx: 8, dy: 12, w: 5.5, bow: 4 },
  { base: 0.10, dx: 10, dy: 14, w: 5.5, bow: 5 },
  { base: 0.44, dx: 10, dy: 18, w: 5, bow: 4 },
  { base: 0.80, dx: 9, dy: 27, w: 5, bow: 3 },
];

export const SUN_CROWN: readonly Crown[] = [
  { a: -112, len: 0.20, w: 22, skew: -14 },
  { a: -84, len: 0.30, w: 20, skew: -12 },
  { a: -56, len: 0.38, w: 20, skew: -9 },
  { a: -28, len: 0.34, w: 18, skew: -5 },
  { a: 0, len: 0.42, w: 18, skew: 1 },
  { a: 28, len: 0.33, w: 18, skew: 5 },
  { a: 56, len: 0.38, w: 20, skew: 10 },
  { a: 84, len: 0.29, w: 20, skew: 13 },
  { a: 112, len: 0.20, w: 22, skew: 15 },
];

export const CURSE_CROWN: readonly Crown[] = [
  { a: -106, len: 0.12, w: 22, skew: 12 },
  { a: -78, len: 0.18, w: 20, skew: 18 },
  { a: -50, len: 0.24, w: 20, skew: 20 },
  { a: -20, len: 0.28, w: 20, skew: 22 },
  { a: 12, len: 0.34, w: 20, skew: 24 },
  { a: 44, len: 0.42, w: 22, skew: 22 },
  { a: 76, len: 0.46, w: 22, skew: 18 },
  { a: 106, len: 0.38, w: 22, skew: 12 },
  { a: 130, len: 0.26, w: 22, skew: 6 },
];
