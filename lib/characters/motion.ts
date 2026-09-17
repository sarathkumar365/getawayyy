/**
 * Character motion.
 *
 * GSAP tweens numbers here; it never touches SVG transforms directly. Every
 * rotation is written as a `transform="rotate(a cx cy)"` attribute by
 * `applyPose`, using the `data-origin` each joint carries. That keeps the rig
 * deterministic, avoids GSAP's SVG transform parsing entirely, and means React
 * and the animation never fight over the same attribute — React owns the outer
 * placement transforms, this owns the inner animation groups.
 *
 * Everything runs off ONE ticker. Separate tweens per part drift out of phase
 * and cost more than the whole rig costs to recompute.
 */

import { gsap } from "gsap";
import { blendPose, IDLE, walkFrame, type Pose } from "./rig";

type Joint = { el: SVGGraphicsElement; ox: number; oy: number };

function joint(svg: SVGSVGElement, part: string): Joint | null {
  const el = svg.querySelector<SVGGraphicsElement>(`[data-part="${part}"]`);
  if (!el) return null;
  const raw = (el.getAttribute("data-origin") ?? "0 0").trim().split(/\s+/);
  return { el, ox: Number(raw[0] ?? 0), oy: Number(raw[1] ?? 0) };
}

function el(svg: SVGSVGElement, part: string): SVGGraphicsElement | null {
  return svg.querySelector<SVGGraphicsElement>(`[data-part="${part}"]`);
}

function rot(j: Joint | null, a: number): void {
  if (!j) return;
  j.el.setAttribute("transform", `rotate(${a.toFixed(2)} ${j.ox} ${j.oy})`);
}

export type Rig = {
  svg: SVGSVGElement;
  root: SVGGraphicsElement | null;
  spine: Joint | null;
  head: Joint | null;
  armL: Joint | null; foreL: Joint | null;
  armR: Joint | null; foreR: Joint | null;
  legL: Joint | null; shinL: Joint | null;
  legR: Joint | null; shinR: Joint | null;
  hairFront: Joint | null; hairBack: Joint | null; strands: Joint | null;
  blinkL: SVGGraphicsElement | null; blinkR: SVGGraphicsElement | null;
  mouth: SVGGraphicsElement | null;
};

export function readRig(svg: SVGSVGElement): Rig {
  return {
    svg,
    root: el(svg, "root"),
    spine: joint(svg, "spine"),
    head: joint(svg, "head"),
    armL: joint(svg, "arm-l"), foreL: joint(svg, "forearm-l"),
    armR: joint(svg, "arm-r"), foreR: joint(svg, "forearm-r"),
    legL: joint(svg, "leg-l"), shinL: joint(svg, "shin-l"),
    legR: joint(svg, "leg-r"), shinR: joint(svg, "shin-r"),
    hairFront: joint(svg, "hair-front"), hairBack: joint(svg, "hair-back"),
    strands: joint(svg, "strands"),
    blinkL: el(svg, "blink-l"), blinkR: el(svg, "blink-r"),
    mouth: el(svg, "mouth-anim"),
  };
}

export type PoseExtras = {
  /** degrees the hair trails the head by */
  hairFront: number;
  hairBack: number;
  strands: number;
  /** 1 = open, 0 = shut */
  lidL: number;
  lidR: number;
  mouthOpen: number;
  flip: boolean;
  turn: number;
  headPivotY: number;
};

export function applyPose(rig: Rig, p: Pose, x: PoseExtras): void {
  if (rig.root) {
    rig.root.setAttribute(
      "transform",
      `${x.flip ? "scale(-1 1) " : ""}scale(${(1 - 0.2 * Math.abs(x.turn)).toFixed(3)} 1) translate(0 ${p.bob.toFixed(2)})`,
    );
  }
  rot(rig.spine, p.lean);
  if (rig.head) {
    rig.head.el.setAttribute(
      "transform",
      `rotate(${p.headTilt.toFixed(2)} 0 ${x.headPivotY}) translate(${(p.headTurn + x.turn * -6).toFixed(2)} 0)`,
    );
  }
  rot(rig.armL, p.shoulderL); rot(rig.foreL, p.elbowL);
  rot(rig.armR, p.shoulderR); rot(rig.foreR, p.elbowR);
  rot(rig.legL, p.hipL); rot(rig.shinL, -p.kneeL);
  rot(rig.legR, p.hipR); rot(rig.shinR, -p.kneeR);
  rot(rig.hairFront, x.hairFront);
  rot(rig.hairBack, x.hairBack);
  rot(rig.strands, x.strands);

  if (rig.blinkL) rig.blinkL.setAttribute("transform", `scale(1 ${x.lidL.toFixed(3)})`);
  if (rig.blinkR) rig.blinkR.setAttribute("transform", `scale(1 ${x.lidR.toFixed(3)})`);
  if (rig.mouth) {
    const sy = 0.2 + 0.8 * x.mouthOpen;
    const sx = 1 + 0.12 * (1 - x.mouthOpen);
    rig.mouth.setAttribute("transform", `scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
  }
}

/**
 * Second-order spring. This is what buys "overlapping action" — hair reaching
 * its target a few frames after the head, and overshooting slightly on the way.
 * Stiffness and damping differ per layer on purpose, so the layers never move
 * as one slab.
 */
class Spring {
  private x = 0;
  private v = 0;
  constructor(private readonly k: number, private readonly c: number) {}
  step(target: number, dt: number): number {
    const a = -this.k * (this.x - target) - this.c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);

export type MotionOpts = {
  turn?: number;
  flip?: boolean;
  headPivotY?: number;
  reduced?: boolean;
  /** walk cycles per second */
  cadence?: number;
};

export type Motion = {
  setBase(p: Pose): void;
  walk(on: boolean): void;
  talk(on: boolean): void;
  /** cold: a fast body tremble, knees knocked in, teeth chattering between lines */
  shiver(on: boolean): void;
  /** one-off: a small anticipation dip, then a pop. Used on reactions. */
  bounce(): void;
  kill(): void;
};

export function createMotion(svg: SVGSVGElement, opts: MotionOpts = {}): Motion {
  const rig = readRig(svg);
  const turn = opts.turn ?? 0;
  const flip = opts.flip ?? false;
  const headPivotY = opts.headPivotY ?? 70;
  const cadence = opts.cadence ?? 0.82;

  let base: Pose = IDLE;
  let walking = 0;      // 0..1, springs so the walk eases in and out
  let walkTarget = 0;
  let talking = 0;
  let talkTarget = 0;
  let shivering = 0;
  let shiverTarget = 0;
  let phase = 0;
  let t = 0;
  let pop = 0;

  const sFront = new Spring(150, 15);
  const sBack = new Spring(78, 11);
  const sStrand = new Spring(110, 13);

  let nextBlinkL = rand(1.2, 3.5);
  let nextBlinkR = nextBlinkL + rand(0.01, 0.05);
  let blinkLAt = -10;
  let blinkRAt = -10;
  const BLINK = 0.125;

  const lid = (now: number, at: number): number => {
    const d = now - at;
    if (d < 0 || d > BLINK) return 1;
    return 1 - 0.94 * Math.sin((d / BLINK) * Math.PI);
  };

  if (opts.reduced) {
    applyPose(rig, IDLE, {
      hairFront: 0, hairBack: 0, strands: 0, lidL: 1, lidR: 1,
      mouthOpen: 1, flip, turn, headPivotY,
    });
    return {
      setBase: () => undefined,
      walk: () => undefined,
      talk: () => undefined,
      shiver: () => undefined,
      bounce: () => undefined,
      kill: () => undefined,
    };
  }

  const tick = (): void => {
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 24);
    t += dt;

    walking += (walkTarget - walking) * Math.min(1, dt * 6);
    talking += (talkTarget - talking) * Math.min(1, dt * 12);
    shivering += (shiverTarget - shivering) * Math.min(1, dt * 5);
    pop = Math.max(0, pop - dt * 2.6);

    if (walking > 0.002) phase = (phase + dt * cadence * walking) % 1;

    // walk pose, sampled between the eight frames
    const f = phase * 8;
    const i = Math.floor(f);
    const walkPose = blendPose(walkFrame(i), walkFrame(i + 1), f - i);
    const live = blendPose(base, walkPose, walking);

    // idle life: three slow sines on deliberately unrelated periods, so nothing
    // ever lines up and the loop never reads as a loop
    const breath = Math.sin((t * Math.PI * 2) / 4.1);
    const micro = Math.sin((t * Math.PI * 2) / 5.7);
    const sway = Math.sin((t * Math.PI * 2) / 7.3);
    const still = 1 - walking;

    const popEase = pop * pop * (3 - 2 * pop);
    // two close high frequencies beat against each other, so the tremble surges and eases
    const cold = shivering * still;
    const tremble = Math.sin(t * 52) * 0.6 + Math.sin(t * 61) * 0.4;
    const pose: Pose = {
      ...live,
      bob: live.bob + breath * 0.9 * still - popEase * 5 + cold * (3 + tremble * 1.1),
      lean: live.lean + sway * 0.7 * still + cold * tremble * 0.8,
      headTilt: live.headTilt + micro * 0.9 * still + popEase * 2.5 + cold * (Math.sin(t * 47) * 1.2 - 2),
      shoulderL: live.shoulderL - popEase * 7 + cold * tremble * 2.5,
      shoulderR: live.shoulderR + popEase * 7 - cold * tremble * 2.5,
      hipL: live.hipL - cold * 5,
      hipR: live.hipR + cold * 5,
      kneeL: live.kneeL + cold * 7,
      kneeR: live.kneeR + cold * 7,
    };

    // hair chases the head and overshoots it
    const hairTarget = pose.headTilt * 1.7 + sway * 1.3 * still + walking * Math.sin(phase * Math.PI * 2) * 3.5;

    if (t >= nextBlinkL) { blinkLAt = t; nextBlinkL = t + rand(2.1, 6.4); }
    if (t >= nextBlinkR) { blinkRAt = t; nextBlinkR = nextBlinkL + rand(0.01, 0.06); }

    const openness = talking > 0.01
      ? Math.abs(Math.sin(t * 9.3) * 0.62 + Math.sin(t * 14.9) * 0.38)
      : 1 - cold * (0.5 + 0.5 * Math.sin(t * 40));

    applyPose(rig, pose, {
      hairFront: sFront.step(hairTarget, dt),
      hairBack: sBack.step(hairTarget * 0.8, dt),
      strands: sStrand.step(hairTarget * 1.15, dt),
      lidL: lid(t, blinkLAt),
      lidR: lid(t, blinkRAt),
      mouthOpen: talking > 0.01 ? 1 - talking * (1 - openness) : openness,
      flip, turn, headPivotY,
    });
  };

  gsap.ticker.add(tick);

  return {
    setBase(p: Pose) { base = p; },
    walk(on: boolean) { walkTarget = on ? 1 : 0; },
    talk(on: boolean) { talkTarget = on ? 1 : 0; },
    shiver(on: boolean) { shiverTarget = on ? 1 : 0; },
    bounce() { pop = 1; },
    kill() { gsap.ticker.remove(tick); },
  };
}
