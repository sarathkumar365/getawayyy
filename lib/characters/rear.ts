/**
 * The walk, seen from behind.
 *
 * The side-on rig rotates limbs in the picture plane. From directly behind that
 * rotation is almost entirely invisible — an arm swinging forward just gets
 * shorter. So the rear view cannot reuse those angles; it has to re-project the
 * same eight frames into the cues that actually read from this angle:
 *
 *   · pelvis SWAY toward the stance leg — the single strongest cue
 *   · shoulders counter-rotating against the hips
 *   · the swing leg LIFTING and shrinking slightly as it travels away
 *   · arms flaring outward at the elbow rather than swinging fore and aft
 *
 * Same source data, different projection. Nothing here invents a second walk.
 */

import type { Pose } from "./rig";
import { DETAILED, type DetailId } from "./detailed";

export type RearLimb = {
  /** lateral offset from the joint, positive = outward */
  out: number;
  /** how far the foot/hand is lifted */
  lift: number;
  /** knee/elbow bend, still in the picture plane — it reads from behind */
  bend: number;
  /** perspective: a limb travelling away is a touch smaller */
  scale: number;
};

export type RearPose = {
  bob: number;
  /** pelvis shift, positive = toward screen right */
  sway: number;
  /** shoulder girdle rotation in degrees, opposite the hips */
  twist: number;
  headTilt: number;
  legL: RearLimb;
  legR: RearLimb;
  armL: RearLimb;
  armR: RearLimb;
};

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

function leg(hip: number, knee: number, side: -1 | 1, sway: number): RearLimb {
  // hip > 0 is forward, i.e. away from the camera
  const away = clamp(hip, 0, 40) / 40;
  const back = clamp(-hip, 0, 40) / 40;
  return {
    // the swing leg tucks toward the centre line as it passes the stance leg
    out: side * (-away * 6.5 + back * 3.4) - sway * 0.5,
    lift: away * 17 + clamp(knee, 0, 50) * 0.36,
    bend: knee * 0.55,
    scale: 1 - away * 0.12 + back * 0.05,
  };
}

function arm(shoulder: number, elbow: number, side: -1 | 1): RearLimb {
  const mag = Math.abs(shoulder) / 30;
  return {
    // fore-and-aft swing reads from behind as the elbow flaring out and back in
    out: side * (6.5 + mag * 7),
    // and as the arm foreshortening when it swings away from the camera
    lift: clamp(shoulder, 0, 40) * 0.42,
    bend: elbow * 0.35,
    scale: 1 - clamp(shoulder, 0, 40) * 0.006,
  };
}

export function rearFrom(p: Pose): RearPose {
  // Weight sits over whichever leg is further BACK — that is the planted one —
  // so the pelvis drifts toward it. This is what makes a rear walk look walked.
  const stance = p.hipR - p.hipL;
  const sway = clamp(stance * 0.22, -10.5, 10.5);

  return {
    // the rise and fall of a walk is one of the few cues that survives this
    // angle intact, so it is worth more here than it is side-on
    bob: p.bob * 1.7,
    sway,
    twist: -sway * 0.68,
    headTilt: p.headTilt * 0.5 - sway * 0.3,
    legL: leg(p.hipL, p.kneeL, -1, sway),
    legR: leg(p.hipR, p.kneeR, 1, sway),
    armL: arm(p.shoulderL, p.elbowL, -1),
    armR: arm(p.shoulderR, p.elbowR, 1),
  };
}

/* ---------------- geometry ---------------- */

export type RearLegGeom = {
  hx: number; hy: number; ky: number; ay: number;
  footOut: number; w1: number; w2: number; footRx: number; footRy: number;
  lifted: boolean;
};
export type RearArmGeom = {
  ox: number; sx: number; sy: number; ey: number; wy: number; w1: number; w2: number;
};
export type RearGeom = {
  sway: number; bob: number; twist: number; headTilt: number;
  legL: RearLegGeom; legR: RearLegGeom;
  armL: RearArmGeom; armR: RearArmGeom;
};

const LIMB = { arm: 14, leg: 20 } as const;

/**
 * All the numbers the rear drawing needs, in one place.
 *
 * Shared by the component (first paint) and the controller (every frame after),
 * so the animated figure can never drift from the rendered one — the same bug
 * class that made React and GSAP fight over transforms on the front rig.
 */
export function rearGeometry(id: DetailId, pose: Pose): RearGeom {
  const c = DETAILED[id];
  const s = c.skeleton;
  const t = s.torso;
  const r = rearFrom(pose);

  const legGeom = (side: -1 | 1, limb: RearLimb): RearLegGeom => {
    const hx = side * s.hipX + limb.out;
    const hy = t.hipY;
    const ky = hy + s.thigh * limb.scale - limb.lift * 0.45;
    const ay = ky + s.shin * limb.scale - limb.lift * 0.55;
    const lifted = limb.lift > 2.5;
    return {
      hx, hy, ky, ay,
      footOut: limb.out * 0.35,
      w1: LIMB.leg * limb.scale,
      w2: (LIMB.leg - 4) * limb.scale,
      footRx: 11 * limb.scale,
      footRy: lifted ? 6.5 : 4.2,
      lifted,
    };
  };

  const armGeom = (side: -1 | 1, limb: RearLimb): RearArmGeom => {
    const ox = side * s.shoulderX;
    const sx = ox + limb.out;
    const sy = t.shoulderY + 4;
    const ey = sy + s.upperArm * limb.scale;
    return {
      ox, sx, sy, ey,
      wy: ey + s.foreArm * limb.scale - limb.lift,
      w1: LIMB.arm * limb.scale,
      w2: (LIMB.arm - 3) * limb.scale,
    };
  };

  return {
    sway: r.sway, bob: r.bob, twist: r.twist,
    headTilt: r.headTilt - r.twist * 0.55,
    legL: legGeom(-1, r.legL),
    legR: legGeom(1, r.legR),
    armL: armGeom(-1, r.armL),
    armR: armGeom(1, r.armR),
  };
}
