/**
 * Drives a rear-view figure.
 *
 * Mirrors lib/characters/motion.ts: GSAP tweens numbers, this writes attributes.
 * The rear drawing changes geometry rather than just rotating — limbs shorten as
 * they travel away, the foot flips from heel to sole — so this rewrites path `d`
 * and ellipse radii instead of only transforms.
 */

import { gsap } from "gsap";
import { blendPose, IDLE, walkFrame, type Pose } from "./rig";
import { blendGeom, rearGeometry, sitGeometry, type RearArmGeom, type RearGeom, type RearLegGeom } from "./rear";
import { DETAILED, type DetailId } from "./detailed";

const f = (v: number): string => `${Math.round(v * 100) / 100}`;

function setStroke(root: SVGSVGElement, part: string, x1: number, y1: number, x2: number, y2: number, w: number, stroke: number): void {
  const g = root.querySelector<SVGGElement>(`[data-part="${part}"]`);
  if (!g) return;
  const d = `M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}`;
  const kids = g.children;
  const ink = kids[0] as SVGPathElement | undefined;
  const fill = kids[1] as SVGPathElement | undefined;
  if (ink) { ink.setAttribute("d", d); ink.setAttribute("stroke-width", f(w + stroke * 2)); }
  if (fill) { fill.setAttribute("d", d); fill.setAttribute("stroke-width", f(w)); }
}

export type RearMotion = { walk(on: boolean): void; sit(on: boolean): void; kill(): void };

export function createRearMotion(
  svg: SVGSVGElement,
  opts: { id: DetailId; cadence?: number; reduced?: boolean },
): RearMotion {
  const { id } = opts;
  const c = DETAILED[id];
  const s = c.skeleton;
  const p = c.palette;
  const cadence = opts.cadence ?? 0.85;

  const root = svg.querySelector<SVGGElement>('[data-part="root"]');
  const torso = svg.querySelector<SVGGElement>('[data-part="rear-torso"]');
  const head = svg.querySelector<SVGGElement>('[data-part="rear-head"]');

  let walking = 0;
  let target = 0;
  let sitting = 0;
  let sitTarget = 0;
  let phase = 0;
  let t = 0;

  const paintLeg = (tag: "l" | "r", L: RearLegGeom): void => {
    setStroke(svg, `thigh-${tag}`, L.hx, L.hy - 8, L.hx + L.footOut * 0.4, L.ky, L.w1, s.stroke);
    setStroke(svg, `shin-${tag}`, L.hx + L.footOut * 0.4, L.ky - 2, L.hx + L.footOut, L.ay, L.w2, s.stroke);
    const foot = svg.querySelector<SVGEllipseElement>(`[data-part="foot-${tag}"]`);
    if (foot) {
      foot.setAttribute("cx", f(L.hx + L.footOut));
      foot.setAttribute("cy", f(L.ay + 4));
      foot.setAttribute("rx", f(L.footRx));
      foot.setAttribute("ry", f(L.footRy));
      foot.setAttribute("fill", L.lifted ? p.shoeTrim : p.shoe);
    }
  };

  const paintArm = (tag: "l" | "r", A: RearArmGeom): void => {
    setStroke(svg, `upper-${tag}`, A.ox, A.sy, A.sx, A.ey, A.w1, s.stroke);
    setStroke(svg, `fore-${tag}`, A.sx, A.ey - 2, A.sx, A.wy, A.w2, s.stroke);
  };

  const paintGeom = (g: RearGeom): void => {
    if (root) root.setAttribute("transform", `translate(${f(g.sway)} ${f(g.bob)})`);
    if (torso) torso.setAttribute("transform", `rotate(${f(g.twist)} 0 ${s.torso.hipY})`);
    if (head) head.setAttribute("transform", `rotate(${f(g.headTilt)} 0 ${s.head.pivotY})`);
    paintLeg("l", g.legL); paintLeg("r", g.legR);
    paintArm("l", g.armL); paintArm("r", g.armR);
  };

  const paint = (pose: Pose): void => paintGeom(rearGeometry(id, pose));

  /** Built once: it does not depend on the walk phase. */
  const SIT = sitGeometry(id);

  if (opts.reduced) {
    paint(IDLE);
    return {
      walk: () => undefined,
      sit: (on: boolean) => paintGeom(on ? sitGeometry(id) : rearGeometry(id, IDLE)),
      kill: () => undefined,
    };
  }

  const tick = (): void => {
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 24);
    t += dt;
    walking += (target - walking) * Math.min(1, dt * 6);
    // Sitting down takes longer than starting to walk. Folding onto the ground
    // at the speed of a footstep is what made the arrival feel abrupt.
    sitting += (sitTarget - sitting) * Math.min(1, dt * 2.6);
    if (walking > 0.002) phase = (phase + dt * cadence * walking) % 1;

    const fr = phase * 8;
    const i = Math.floor(fr);
    const walkPose = blendPose(walkFrame(i), walkFrame(i + 1), fr - i);
    const live = blendPose(IDLE, walkPose, walking);

    // a little idle life even when standing, so they never look pasted on
    const breath = Math.sin((t * Math.PI * 2) / 4.3) * (1 - walking);
    const standing = rearGeometry(id, {
      ...live, bob: live.bob + breath * 0.8, headTilt: live.headTilt + breath * 0.6,
    });

    if (sitting < 0.002) { paintGeom(standing); return; }

    // Ease the fold so the weight settles rather than dropping.
    const k = sitting < 0.5 ? 2 * sitting * sitting : 1 - (-2 * sitting + 2) ** 2 / 2;
    const seated = blendGeom(standing, SIT, k);
    // Seated, the breath moves the shoulders instead of the whole body, and the
    // head keeps looking up rather than nodding along with a walk.
    paintGeom({ ...seated, bob: seated.bob + breath * 0.5 * k });
  };

  gsap.ticker.add(tick);
  return {
    walk(on: boolean) { target = on ? 1 : 0; },
    sit(on: boolean) { sitTarget = on ? 1 : 0; if (on) target = 0; },
    kill() { gsap.ticker.remove(tick); },
  };
}
