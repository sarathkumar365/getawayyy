/**
 * Character rig — skeleton, poses and palettes for both mascots.
 *
 * This file is the character sheet. Poses are joint angles, not drawings, so the
 * eight walk frames / six arm poses / expression grid in `app/sheets` and the
 * GSAP-driven characters on the real screens render from one source. Nothing is
 * drawn twice, and nothing needs slicing.
 *
 * Angle conventions, kept consistent everywhere:
 *   hip      +ve swings the leg FORWARD (screen left, the direction they face)
 *   knee     +ve folds the shin BACKWARD, the only way a knee bends
 *   shoulder +ve swings the arm FORWARD
 *   elbow    +ve folds the forearm IN toward the chest
 *   lean     +ve tips the torso forward
 *   bob      +ve moves the whole body DOWN (screen coords)
 */

export type CharacterId = "sun" | "curse";

export type BrowPose = "neutral" | "raised" | "furrowed" | "worried" | "delighted";
export type EyeState = "open" | "half" | "closed" | "wide" | "sparkle" | "side";
export type MouthShape =
  | "closed" | "smile" | "grin" | "open" | "o" | "talkA" | "talkO" | "sad";
export type ArmPose = "rest" | "pointL" | "pointR" | "wave" | "thumbsUp" | "handsUp" | "hug" | "warmHands";
export type Outfit = "base" | "parka" | "shell" | "beret" | "tote";

export const BROWS: readonly BrowPose[] =
  ["neutral", "raised", "furrowed", "worried", "delighted"] as const;
export const EYES: readonly EyeState[] =
  ["open", "half", "closed", "wide", "sparkle", "side"] as const;
export const MOUTHS: readonly MouthShape[] =
  ["closed", "smile", "grin", "open", "o", "talkA", "talkO", "sad"] as const;
export const ARM_POSE_NAMES: readonly ArmPose[] =
  ["rest", "pointL", "pointR", "wave", "thumbsUp", "handsUp", "hug", "warmHands"] as const;
export const OUTFITS: readonly Outfit[] =
  ["base", "parka", "shell", "beret", "tote"] as const;

/** Where the joints are. All lengths in viewBox units, x = 0 is the centre line. */
export type Skeleton = {
  viewBox: string;
  /** head ellipse + where the skull pivots on the neck */
  head: { cx: number; cy: number; rx: number; ry: number; pivotY: number };
  neck: { top: number; bottom: number; w: number };
  torso: { shoulderY: number; shoulderW: number; waistY: number; waistW: number; hipY: number; hipW: number };
  shoulderX: number;
  upperArm: number;
  foreArm: number;
  hipX: number;
  thigh: number;
  shin: number;
  foot: { len: number; h: number };
  /** eye/brow/mouth anchors, relative to the head group */
  face: { eyeY: number; eyeX: number; browY: number; mouthY: number; eyeR: number };
  stroke: number;
};

export type Palette = {
  skin: string;
  skinShade: string;
  hair: string;
  hairShade: string;
  top: string;
  bottom: string;
  shoe: string;
  ink: string;
  accent: string;
};

export type Character = {
  id: CharacterId;
  name: string;
  skeleton: Skeleton;
  palette: Palette;
  /** B has line-stripes; A does not. */
  markings: boolean;
};

/** A — the Sunshine. Small, springy, a head that is slightly too big for her. */
const SUN_SKELETON: Skeleton = {
  viewBox: "-110 0 220 340",
  head: { cx: 0, cy: 46, rx: 31, ry: 35, pivotY: 78 },
  neck: { top: 74, bottom: 90, w: 15 },
  torso: { shoulderY: 94, shoulderW: 64, waistY: 148, waistW: 43, hipY: 172, hipW: 52 },
  shoulderX: 26,
  upperArm: 44,
  foreArm: 42,
  hipX: 15,
  thigh: 58,
  shin: 58,
  foot: { len: 26, h: 9 },
  face: { eyeY: 55, eyeX: 14, browY: 45, mouthY: 68, eyeR: 7.5 },
  stroke: 3.2,
};

/** B — the Curse. Taller, longer limbs, a smaller head. Reads as still. */
const CURSE_SKELETON: Skeleton = {
  viewBox: "-110 0 220 340",
  head: { cx: 0, cy: 40, rx: 28, ry: 32, pivotY: 69 },
  neck: { top: 66, bottom: 82, w: 16 },
  torso: { shoulderY: 86, shoulderW: 70, waistY: 146, waistW: 47, hipY: 170, hipW: 55 },
  shoulderX: 29,
  upperArm: 50,
  foreArm: 48,
  hipX: 16,
  thigh: 68,
  shin: 68,
  foot: { len: 28, h: 9 },
  face: { eyeY: 49, eyeX: 13, browY: 40, mouthY: 62, eyeR: 7 },
  stroke: 3.2,
};

export const CHARACTERS: Record<CharacterId, Character> = {
  sun: {
    id: "sun",
    name: "the Sunshine",
    skeleton: SUN_SKELETON,
    markings: false,
    palette: {
      skin: "#FFE0C6",
      skinShade: "#F6C6A0",
      hair: "#FF7A2F",
      hairShade: "#E25A14",
      top: "#FFF7EF",
      bottom: "#2B2B33",
      shoe: "#FF9A57",
      ink: "#1E1E24",
      accent: "#FF7A2F",
    },
  },
  curse: {
    id: "curse",
    name: "the Curse",
    skeleton: CURSE_SKELETON,
    markings: true,
    palette: {
      skin: "#F7DDD0",
      skinShade: "#E4BCA9",
      hair: "#C1121F",
      hairShade: "#8E0C17",
      top: "#2C2A34",
      bottom: "#1C1B22",
      shoe: "#141318",
      ink: "#141318",
      accent: "#C1121F",
    },
  },
};

/** Every joint angle that defines a full-body pose. */
export type Pose = {
  bob: number;
  lean: number;
  headTilt: number;
  headTurn: number;
  shoulderL: number;
  elbowL: number;
  shoulderR: number;
  elbowR: number;
  hipL: number;
  kneeL: number;
  hipR: number;
  kneeR: number;
};

export const IDLE: Pose = {
  bob: 0, lean: 0, headTilt: 0, headTurn: 0,
  shoulderL: 4, elbowL: 6, shoulderR: -4, elbowR: 6,
  hipL: 2, kneeL: 2, hipR: -2, kneeR: 2,
};

/**
 * Eight-frame walk. Contact / down / passing / up, then the same four mirrored —
 * which is what makes it a cycle rather than a loop of one leg.
 * `bob` is the vertical travel: lowest at down, highest at up.
 */
export const WALK: readonly Pose[] = [
  // 0 contact — left foot lands forward
  { bob: 0, lean: 6, headTilt: 0, headTurn: 0,
    shoulderL: -13, elbowL: 14, shoulderR: 14, elbowR: 18,
    hipL: 26, kneeL: 4, hipR: -22, kneeR: 16 },
  // 1 down — weight drops onto the front leg
  { bob: 5, lean: 7, headTilt: 1, headTurn: 0,
    shoulderL: -8, elbowL: 12, shoulderR: 9, elbowR: 16,
    hipL: 14, kneeL: 18, hipR: -14, kneeR: 8 },
  // 2 passing — back leg swings through, knee folded hard
  { bob: 1, lean: 6, headTilt: 0, headTurn: 0,
    shoulderL: -2, elbowL: 10, shoulderR: 2, elbowR: 14,
    hipL: 2, kneeL: 8, hipR: 4, kneeR: 46 },
  // 3 up — push-off, highest point of the cycle
  { bob: -5, lean: 5, headTilt: -1, headTurn: 0,
    shoulderL: 6, elbowL: 12, shoulderR: -6, elbowR: 14,
    hipL: -14, kneeL: 4, hipR: 20, kneeR: 30 },
  // 4-7 — frames 0-3 with the legs and arms swapped
  { bob: 0, lean: 6, headTilt: 0, headTurn: 0,
    shoulderL: 14, elbowL: 18, shoulderR: -13, elbowR: 14,
    hipL: -22, kneeL: 16, hipR: 26, kneeR: 4 },
  { bob: 5, lean: 7, headTilt: -1, headTurn: 0,
    shoulderL: 9, elbowL: 16, shoulderR: -8, elbowR: 12,
    hipL: -14, kneeL: 8, hipR: 14, kneeR: 18 },
  { bob: 1, lean: 6, headTilt: 0, headTurn: 0,
    shoulderL: 2, elbowL: 14, shoulderR: -2, elbowR: 10,
    hipL: 4, kneeL: 46, hipR: 2, kneeR: 8 },
  { bob: -5, lean: 5, headTilt: 1, headTurn: 0,
    shoulderL: -6, elbowL: 14, shoulderR: 6, elbowR: 12,
    hipL: 20, kneeL: 30, hipR: -14, kneeR: 4 },
] as const;

export const WALK_FRAME_NAMES: readonly string[] = [
  "contact", "down", "passing", "up",
  "contact ′", "down ′", "passing ′", "up ′",
] as const;

type ArmAngles = Pick<Pose, "shoulderL" | "elbowL" | "shoulderR" | "elbowR">;

export const ARM_POSES: Record<ArmPose, ArmAngles> = {
  rest:     { shoulderL: 4,    elbowL: 6,   shoulderR: -4,   elbowR: 6 },
  pointL:   { shoulderL: 96,   elbowL: 4,   shoulderR: -6,   elbowR: 10 },
  pointR:   { shoulderL: 6,    elbowL: 10,  shoulderR: -96,  elbowR: 4 },
  wave:     { shoulderL: 8,    elbowL: 8,   shoulderR: -150, elbowR: 34 },
  thumbsUp: { shoulderL: 10,   elbowL: 8,   shoulderR: -46,  elbowR: 92 },
  handsUp:  { shoulderL: 156,  elbowL: 18,  shoulderR: -156, elbowR: 18 },
  // cold: forearms folded up across the chest, higher and tighter than crossed
  hug:      { shoulderL: -10,  elbowL: -128, shoulderR: 10,   elbowR: 128 },
  // cold: both hands cupped under the chin, as if breathing into them
  warmHands: { shoulderL: -35, elbowL: -150, shoulderR: 35,   elbowR: 150 },
};

/** B's default: arms crossed, which is a pose no walk frame ever passes through. */
export const ARMS_CROSSED: ArmAngles =
  { shoulderL: 14, elbowL: -104, shoulderR: -14, elbowR: 104 };

export function withArms(pose: Pose, arms: ArmAngles): Pose {
  return { ...pose, ...arms };
}

export function walkFrame(i: number): Pose {
  const f = WALK[((i % WALK.length) + WALK.length) % WALK.length];
  return f ?? IDLE;
}

/** Linear blend between two poses — GSAP tweens this, the sheet uses the ends. */
export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const m = (x: number, y: number): number => x + (y - x) * t;
  return {
    bob: m(a.bob, b.bob),
    lean: m(a.lean, b.lean),
    headTilt: m(a.headTilt, b.headTilt),
    headTurn: m(a.headTurn, b.headTurn),
    shoulderL: m(a.shoulderL, b.shoulderL),
    elbowL: m(a.elbowL, b.elbowL),
    shoulderR: m(a.shoulderR, b.shoulderR),
    elbowR: m(a.elbowR, b.elbowR),
    hipL: m(a.hipL, b.hipL),
    kneeL: m(a.kneeL, b.kneeL),
    hipR: m(a.hipR, b.hipR),
    kneeR: m(a.kneeR, b.kneeR),
  };
}
