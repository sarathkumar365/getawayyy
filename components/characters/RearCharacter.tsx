import type { JSX } from "react";
import { DETAILED, type DetailId } from "@/lib/characters/detailed";
import { IDLE, type Pose } from "@/lib/characters/rig";
import { rearFrom, type RearLimb } from "@/lib/characters/rear";
import { crownPath, hairPathFallback } from "./rearHair";

export type RearCharacterProps = {
  id: DetailId;
  pose?: Pose;
  uid: string;
  className?: string;
};

const n = (v: number): string => `${Math.round(v * 100) / 100}`;
const LIMB = { arm: 14, leg: 20 } as const;

function Stroke({
  x1, y1, x2, y2, w, fill, ink, stroke,
}: {
  x1: number; y1: number; x2: number; y2: number;
  w: number; fill: string; ink: string; stroke: number;
}): JSX.Element {
  const d = `M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}`;
  return (
    <>
      <path d={d} stroke={ink} strokeWidth={w + stroke * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none" />
    </>
  );
}

/**
 * The cast from behind, walking away.
 *
 * No face — which removes eyes, brows, mouths and emotes, most of the weight of
 * the front-facing rig. What carries the character from this angle is the
 * silhouette: hair mass, shoulder width, and how they move.
 */
export function RearCharacter({ id, pose = IDLE, uid, className }: RearCharacterProps): JSX.Element {
  const c = DETAILED[id];
  const s = c.skeleton;
  const p = c.palette;
  const f = c.face;
  const r = rearFrom(pose);
  const t = s.torso;

  const legFor = (side: -1 | 1, limb: RearLimb): JSX.Element => {
    const hx = side * s.hipX + limb.out;
    const hy = t.hipY;
    const ky = hy + s.thigh * limb.scale - limb.lift * 0.45;
    const ay = ky + s.shin * limb.scale - limb.lift * 0.55;
    const footOut = limb.out * 0.35;
    return (
      <g data-part={`rear-leg-${side < 0 ? "l" : "r"}`}>
        <Stroke x1={hx} y1={hy - 8} x2={hx + footOut * 0.4} y2={ky} w={LIMB.leg * limb.scale}
          fill={p.bottom} ink={p.ink} stroke={s.stroke} />
        <Stroke x1={hx + footOut * 0.4} y1={ky - 2} x2={hx + footOut} y2={ay}
          w={(LIMB.leg - 4) * limb.scale} fill={p.bottom} ink={p.ink} stroke={s.stroke} />
        {/* a planted foot shows its heel; a lifted one shows the sole */}
        <ellipse cx={hx + footOut} cy={ay + 4} rx={11 * limb.scale}
          ry={limb.lift > 2.5 ? 6.5 : 4.2}
          fill={limb.lift > 2.5 ? p.shoeTrim : p.shoe}
          stroke={p.ink} strokeWidth={s.stroke} />
      </g>
    );
  };

  const armFor = (side: -1 | 1, limb: RearLimb): JSX.Element => {
    const sx = side * s.shoulderX + limb.out;
    const sy = t.shoulderY + 4;
    const ey = sy + s.upperArm * limb.scale;
    const wy = ey + s.foreArm * limb.scale - limb.lift;
    return (
      <g data-part={`rear-arm-${side < 0 ? "l" : "r"}`}>
        <Stroke x1={side * s.shoulderX} y1={sy} x2={sx} y2={ey} w={LIMB.arm * limb.scale}
          fill={p.top} ink={p.ink} stroke={s.stroke} />
        <Stroke x1={sx} y1={ey - 2} x2={sx + limb.out * 0.25} y2={wy}
          w={(LIMB.arm - 3) * limb.scale} fill={p.skin} ink={p.ink} stroke={s.stroke} />
      </g>
    );
  };

  const backPath = [
    `M${n(-t.shoulderW / 2)},${n(t.shoulderY + 4)}`,
    `C${n(-t.shoulderW / 2 - 2)},${n(t.waistY - 26)} ${n(-t.waistW / 2 - 3)},${n(t.waistY - 10)} ${n(-t.waistW / 2)},${n(t.waistY)}`,
    `C${n(-t.hipW / 2 - 2)},${n(t.hipY - 12)} ${n(-t.hipW / 2)},${n(t.hipY - 2)} ${n(-t.hipW / 2)},${n(t.hipY + 8)}`,
    `L${n(t.hipW / 2)},${n(t.hipY + 8)}`,
    `C${n(t.hipW / 2)},${n(t.hipY - 2)} ${n(t.hipW / 2 + 2)},${n(t.hipY - 12)} ${n(t.waistW / 2)},${n(t.waistY)}`,
    `C${n(t.waistW / 2 + 3)},${n(t.waistY - 10)} ${n(t.shoulderW / 2 + 2)},${n(t.waistY - 26)} ${n(t.shoulderW / 2)},${n(t.shoulderY + 4)}`,
    `Q0,${n(t.shoulderY - 8)} ${n(-t.shoulderW / 2)},${n(t.shoulderY + 4)}`,
    "Z",
  ].join(" ");

  return (
    <svg viewBox={s.viewBox} className={className} role="img" aria-label={`${c.name}, from behind`}
      data-character={id} data-view="rear" id={`rc-${uid}`}>
      <g data-part="root" transform={`translate(${n(r.sway)} ${n(r.bob)})`}>
        {/* far side first */}
        {legFor(-1, r.legL)}
        {armFor(-1, r.armL)}

        <g data-part="rear-torso" transform={`rotate(${n(r.twist)} 0 ${t.hipY})`}>
          {legFor(1, r.legR)}
          <path d={backPath} fill={p.top} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
          {/* a seam down the spine: without it the back is a blank slab */}
          <path d={`M0,${n(t.shoulderY + 10)} L0,${n(t.waistY + 4)}`}
            stroke={p.ink} strokeWidth={1.4} opacity={0.3} />

          <g data-part="rear-head"
            transform={`rotate(${n(r.headTilt - r.twist * 0.55)} 0 ${n(s.head.pivotY)})`}>
            <path d={`M${n(-s.neck.w / 2)},${n(s.neck.top)} L${n(-s.neck.w / 2 - 2)},${n(s.neck.bottom)}
              L${n(s.neck.w / 2 + 2)},${n(s.neck.bottom)} L${n(s.neck.w / 2)},${n(s.neck.top)} Z`}
              fill={p.skinShade} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <ellipse cx={0} cy={f.craniumY} rx={f.craniumRx * 0.97} ry={f.craniumRy * 1.02}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} />
            {/* ears are all the face you get from here */}
            <path d={`M${n(-f.craniumRx - 1)},${n(f.earY - 6)} q-6,1 -6,7 q0,7 6,8 Z`}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <path d={`M${n(f.craniumRx + 1)},${n(f.earY - 6)} q6,1 6,7 q0,7 -6,8 Z`}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <path data-part="rear-hair" d={crownPath(id, f) || hairPathFallback(f)}
              fill={p.hair} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <path d={`M${n(-f.craniumRx * 0.5)},${n(f.craniumY - f.craniumRy * 0.5)}
              q${n(f.craniumRx * 0.5)},${n(-f.craniumRy * 0.34)} ${n(f.craniumRx)},0`}
              fill="none" stroke={p.hairLight} strokeWidth={3} opacity={0.5} strokeLinecap="round" />
          </g>
        </g>

        {armFor(1, r.armR)}
      </g>
    </svg>
  );
}
