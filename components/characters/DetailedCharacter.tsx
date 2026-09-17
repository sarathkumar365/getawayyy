import type { JSX } from "react";
import { IDLE, type Pose, type Skeleton } from "@/lib/characters/rig";
import {
  DETAILED, SUN_CROWN, CURSE_CROWN, SUN_STRANDS, CURSE_STRANDS,
  D_BROWS, D_EYES, D_MOUTHS, D_EMOTES,
  type Crown, type DBrow, type DEmote, type DetailId, type DetailPalette,
  type DEye, type DMouth, type DOutfit, type Face, type Strand,
} from "@/lib/characters/detailed";

/**
 * The detailed rig. Same joint angles as the mascot rig, a completely different
 * drawing. Every part still carries `data-part`, so the same GSAP code drives
 * either one.
 */

export type DetailedProps = {
  id: DetailId;
  pose?: Pose;
  brow?: DBrow;
  eye?: DEye;
  mouth?: DMouth;
  emote?: DEmote;
  outfit?: DOutfit;
  uid: string;
  className?: string;
  flip?: boolean;
  crop?: "full" | "head";
  turn?: number;
  /**
   * Render EVERY expression variant as a hidden sibling, tagged `data-brow` /
   * `data-eye` / `data-mouth` / `data-emote`. Lets a build with no React switch
   * expressions by toggling `display` instead of re-rendering the tree.
   */
  variants?: boolean;
};

const n = (v: number): string => `${Math.round(v * 100) / 100}`;
const LIMB = { upperArm: 15, foreArm: 12, thigh: 21, shin: 16 } as const;

/* ---------------- head construction ---------------- */

function headPath(f: Face): string {
  const rx = f.craniumRx;
  const cy = f.craniumY;
  const ry = f.craniumRy;
  return [
    `M0,${n(f.top)}`,
    `C${n(rx * 0.64)},${n(f.top)} ${n(rx)},${n(cy - ry * 0.55)} ${n(rx)},${n(cy)}`,
    `C${n(rx)},${n(cy + ry * 0.36)} ${n(f.jawX + 3)},${n(f.jawY - 5)} ${n(f.jawX)},${n(f.jawY)}`,
    `C${n(f.jawX - 1)},${n(f.jawY + 10)} 9,${n(f.chin - 3)} 0,${n(f.chin)}`,
    `C-9,${n(f.chin - 3)} ${n(-f.jawX + 1)},${n(f.jawY + 10)} ${n(-f.jawX)},${n(f.jawY)}`,
    `C${n(-f.jawX - 3)},${n(f.jawY - 5)} ${n(-rx)},${n(cy + ry * 0.36)} ${n(-rx)},${n(cy)}`,
    `C${n(-rx)},${n(cy - ry * 0.55)} ${n(-rx * 0.64)},${n(f.top)} 0,${n(f.top)}`,
    "Z",
  ].join(" ");
}

/* ---------------- eyes ---------------- */

type EyeCfg = {
  closed: boolean;
  /** fraction of the eye the upper lid covers, 0 = fully open */
  lid: number;
  scleraY: number;
  irisScale: number;
  irisDx: number;
  highlight: "normal" | "sparkle" | "none";
  shadow: boolean;
  /** upward curve of the closed/squint line */
  curve: number;
};

const EYE_CFG: Record<DEye, EyeCfg> = {
  open:     { closed: false, lid: 0,    scleraY: 1,    irisScale: 1,    irisDx: 0,    highlight: "normal",  shadow: false, curve: 0 },
  half:     { closed: false, lid: 0.42, scleraY: 1,    irisScale: 1,    irisDx: 0,    highlight: "normal",  shadow: false, curve: 0 },
  closed:   { closed: true,  lid: 0,    scleraY: 1,    irisScale: 1,    irisDx: 0,    highlight: "none",    shadow: false, curve: 0.75 },
  wide:     { closed: false, lid: 0,    scleraY: 1.22, irisScale: 0.72, irisDx: 0,    highlight: "normal",  shadow: false, curve: 0 },
  sparkle:  { closed: false, lid: 0,    scleraY: 1.1,  irisScale: 1.08, irisDx: 0,    highlight: "sparkle", shadow: false, curve: 0 },
  side:     { closed: false, lid: 0.1,  scleraY: 1,    irisScale: 1,    irisDx: 0.34, highlight: "normal",  shadow: false, curve: 0 },
  squint:   { closed: false, lid: 0.6,  scleraY: 1,    irisScale: 1,    irisDx: 0,    highlight: "none",    shadow: false, curve: 0 },
  shadowed: { closed: false, lid: 0.16, scleraY: 1,    irisScale: 0.9,  irisDx: 0,    highlight: "none",    shadow: true,  curve: 0 },
};

function EyeInner({
  state, f, p, uid, side,
}: { state: DEye; f: Face; p: DetailPalette; uid: string; side: "L" | "R" }): JSX.Element {
  const c = EYE_CFG[state];
  const ew = f.eyeW / 2;
  const eh = (f.eyeH / 2) * c.scleraY;
  const cid = `eye-${uid}-${side}-${state}`;

  const sclera = [
    `M${n(-ew)},${n(-eh * 0.1)}`,
    `C${n(-ew * 0.74)},${n(-eh * 1.08)} ${n(ew * 0.58)},${n(-eh * 1.12)} ${n(ew)},${n(-eh * 0.46)}`,
    `C${n(ew * 0.96)},${n(eh * 0.52)} ${n(ew * 0.3)},${n(eh * 1.02)} ${n(-ew * 0.26)},${n(eh * 0.92)}`,
    `C${n(-ew * 0.72)},${n(eh * 0.82)} ${n(-ew)},${n(eh * 0.4)} ${n(-ew)},${n(-eh * 0.1)}`,
    "Z",
  ].join(" ");

  const lash = [
    `M${n(-ew - 1)},${n(-eh * 0.06)}`,
    `C${n(-ew * 0.74)},${n(-eh * 1.16)} ${n(ew * 0.58)},${n(-eh * 1.2)} ${n(ew + 2)},${n(-eh * 0.52)}`,
    `L${n(ew + 1)},${n(-eh * 0.02)}`,
    `C${n(ew * 0.45)},${n(-eh * 0.82)} ${n(-ew * 0.7)},${n(-eh * 0.66)} ${n(-ew - 1)},${n(eh * 0.14)}`,
    "Z",
  ].join(" ");

  if (c.closed) {
    return (
      <>
        <path
          d={`M${n(-ew)},${n(eh * 0.1)} Q0,${n(-eh * c.curve * 1.5)} ${n(ew)},${n(-eh * 0.15)}`}
          stroke={p.ink} strokeWidth={2.8} strokeLinecap="round" fill="none"
        />
        <path d={`M${n(ew)},${n(-eh * 0.15)} l3,-2.5`} stroke={p.ink} strokeWidth={2.2} strokeLinecap="round" />
      </>
    );
  }

  const irx = ew * 0.74 * c.irisScale;
  const iry = eh * 1.02 * c.irisScale;
  const idx = ew * c.irisDx;

  return (
    <>
      <defs>
        <clipPath id={cid}><path d={sclera} /></clipPath>
      </defs>
      <path d={sclera} fill="#FFFDFA" />
      <g clipPath={`url(#${cid})`}>
        {/* two-tone iris: deep at the top where the lid shadows it */}
        <ellipse cx={idx} cy={eh * 0.04} rx={irx} ry={iry} fill={p.irisDeep} />
        <ellipse cx={idx} cy={eh * 0.24} rx={irx * 0.88} ry={iry * 0.82} fill={p.iris} />
        <ellipse cx={idx} cy={eh * 0.1} rx={irx * 0.44} ry={iry * 0.56} fill={p.ink} />
        <ellipse cx={idx} cy={eh * 0.04} rx={irx} ry={iry} fill="none"
          stroke={p.ink} strokeWidth={1.3} opacity={0.75} />
        {c.highlight !== "none" && (
          <>
            <circle cx={idx - ew * 0.3} cy={-eh * 0.42} r={ew * (c.highlight === "sparkle" ? 0.4 : 0.3)} fill="#fff" />
            <circle cx={idx + ew * 0.28} cy={eh * 0.42} r={ew * 0.16} fill="#fff" opacity={0.9} />
          </>
        )}
        {c.highlight === "sparkle" && (
          <path
            d={`M${n(idx + ew * 0.1)},${n(-eh * 0.95)} l${n(ew * 0.12)},${n(eh * 0.42)} l${n(ew * 0.4)},${n(eh * 0.14)} l${n(-ew * 0.4)},${n(eh * 0.14)} l${n(-ew * 0.12)},${n(eh * 0.42)} l${n(-ew * 0.12)},${n(-eh * 0.42)} l${n(-ew * 0.4)},${n(-eh * 0.14)} l${n(ew * 0.4)},${n(-eh * 0.14)} Z`}
            fill="#fff"
          />
        )}
        <ellipse cx={0} cy={-eh * 1.02} rx={ew * 1.1} ry={eh * 0.62} fill={p.ink} opacity={0.22} />
        {c.shadow && <rect x={-ew * 1.2} y={-eh * 1.3} width={ew * 2.4} height={eh * 1.5} fill={p.ink} opacity={0.34} />}
        {c.lid > 0 && (
          <rect x={-ew * 1.2} y={-eh * 1.35} width={ew * 2.4} height={eh * (0.35 + c.lid * 2)} fill={p.skin} />
        )}
      </g>
      <path d={sclera} fill="none" stroke={p.ink} strokeWidth={1.4} opacity={0.5} />
      <g transform={`translate(0 ${eh * c.lid * 2})`}>
        <path d={lash} fill={p.ink} />
      </g>
      <path
        d={`M${n(-ew * 0.6)},${n(eh * 1.02)} Q${n(ew * 0.1)},${n(eh * 1.24)} ${n(ew * 0.82)},${n(eh * 0.62)}`}
        stroke={p.ink} strokeWidth={1.3} fill="none" opacity={0.6} strokeLinecap="round"
      />
    </>
  );
}

/** Placed eye: React owns the outer transform, the motion controller owns the blink group. */
function Eye({
  state, f, p, uid, side, variants,
}: {
  state: DEye; f: Face; p: DetailPalette; uid: string; side: "L" | "R"; variants: boolean;
}): JSX.Element {
  const sign = side === "L" ? -1 : 1;
  const tag = side.toLowerCase();
  return (
    <g data-part={`eye-${tag}`} transform={`translate(${sign * f.eyeX} ${f.eyeY}) scale(${sign} 1)`}>
      <g data-part={`blink-${tag}`}>
        {variants
          ? D_EYES.map((v) => (
              <g key={v} data-eye={v}><EyeInner state={v} f={f} p={p} uid={uid} side={side} /></g>
            ))
          : <EyeInner state={state} f={f} p={p} uid={uid} side={side} />}
      </g>
    </g>
  );
}

/* ---------------- brows ---------------- */

const BROW_CFG: Record<DBrow, { dy: number; rot: number; arch: number; thick: number }> = {
  neutral:   { dy: 0,  rot: 0,   arch: 2.6, thick: 3.2 },
  raised:    { dy: -4, rot: -6,  arch: 4.2, thick: 3.0 },
  furrowed:  { dy: 4,  rot: 16,  arch: -1,  thick: 3.8 },
  worried:   { dy: -1, rot: -19, arch: 1.4, thick: 2.8 },
  delighted: { dy: -4, rot: 3,   arch: 5.4, thick: 3.0 },
  angry:     { dy: 5,  rot: 24,  arch: -2,  thick: 4.2 },
  flat:      { dy: 1,  rot: 0,   arch: 0,   thick: 3.0 },
};

function Brows({ brow, f, p }: { brow: DBrow; f: Face; p: DetailPalette }): JSX.Element {
  const b = BROW_CFG[brow];
  const half = f.eyeW * 0.56;
  // tapered filled shape — a plain stroke reads as a pencil mark, not a brow
  const d = [
    `M${n(-half)},${n(b.thick * 0.2)}`,
    `Q0,${n(-b.arch)} ${n(half)},${n(-b.thick * 0.1)}`,
    `L${n(half)},${n(b.thick * 0.7)}`,
    `Q0,${n(-b.arch + b.thick * 1.15)} ${n(-half)},${n(b.thick * 1.25)}`,
    "Z",
  ].join(" ");
  const one = (sign: 1 | -1): JSX.Element => (
    <path
      d={d}
      transform={`translate(${sign * f.eyeX} ${f.browY + b.dy}) scale(${sign} 1) rotate(${b.rot})`}
      fill={p.ink}
    />
  );
  return <g data-part="brows">{one(-1)}{one(1)}</g>;
}

/* ---------------- mouth ---------------- */

const MOUTH_SET: Record<DMouth, (p: DetailPalette) => JSX.Element> = {
  closed:  (p) => <path d="M-6,0 Q0,2.2 6,-0.4" stroke={p.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" />,
  smile:   (p) => <path d="M-8,-1.6 Q0,5.6 8,-1.6" stroke={p.ink} strokeWidth={2.4} strokeLinecap="round" fill="none" />,
  grin:    (p) => (
    <>
      <path d="M-10.5,-2.2 Q0,9.5 10.5,-2.2 Q0,1.6 -10.5,-2.2 Z" fill="#3A1418" />
      <path d="M-9.2,-1.9 Q0,0.9 9.2,-1.9 L8.4,-3.4 Q0,-0.6 -8.4,-3.4 Z" fill="#FFFDFA" />
      <path d="M-10.5,-2.2 Q0,9.5 10.5,-2.2" stroke={p.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),
  open:    (p) => (
    <>
      <ellipse cx={0} cy={2.5} rx={6.2} ry={8} fill="#3A1418" stroke={p.ink} strokeWidth={1.8} />
      <ellipse cx={0} cy={7.5} rx={3.4} ry={2.6} fill="#D4707A" />
    </>
  ),
  o:       (p) => <ellipse cx={0} cy={1.5} rx={4.4} ry={5} fill="#3A1418" stroke={p.ink} strokeWidth={1.8} />,
  talkA:   (p) => (
    <>
      <ellipse cx={0} cy={1.5} rx={7.8} ry={5} fill="#3A1418" stroke={p.ink} strokeWidth={1.8} />
      <path d="M-6.6,-0.6 Q0,-2.4 6.6,-0.6 L6.2,-2 Q0,-3.6 -6.2,-2 Z" fill="#FFFDFA" />
    </>
  ),
  talkO:   (p) => <ellipse cx={0} cy={1.5} rx={4} ry={7} fill="#3A1418" stroke={p.ink} strokeWidth={1.8} />,
  sad:     (p) => <path d="M-7.5,2.6 Q0,-3.8 7.5,2.6" stroke={p.ink} strokeWidth={2.4} strokeLinecap="round" fill="none" />,
  smirk:   (p) => (
    <>
      <path d="M-7,1.4 Q1,2.6 8,-3" stroke={p.ink} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M8,-3 l1.6,-1.2" stroke={p.ink} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  grimace: (p) => (
    <>
      <path d="M-7.5,-1.6 L7.5,-1.6 Q6,4.2 0,4.6 Q-6,4.2 -7.5,-1.6 Z" fill="#331216" stroke={p.ink} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-6.2,-0.5 L6.2,-0.5" stroke="#F2E7E0" strokeWidth={1.8} />
      <path d="M-2.8,-1.6 L-2.8,-0.5 M0.5,-1.6 L0.5,-0.5 M3.7,-1.6 L3.7,-0.5" stroke={p.ink} strokeWidth={0.8} />
    </>
  ),
};

/* ---------------- emotes ---------------- */

function Emote({ emote, f, p }: { emote: DEmote; f: Face; p: DetailPalette }): JSX.Element | null {
  const x = f.eyeX + 2;
  switch (emote) {
    case "blush":
      return (
        <g data-part="emote" opacity={0.75}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * x} ${f.eyeY + f.eyeH * 0.62})`}>
              <ellipse cx={0} cy={0} rx={7.5} ry={4} fill={p.blush} opacity={0.45} />
              <path d="M-3.6,-2 l0,4 M0,-2.6 l0,4.8 M3.6,-2 l0,4"
                stroke={p.blush} strokeWidth={1.3} strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    case "sweat":
      return (
        <g data-part="emote" transform={`translate(${f.craniumRx * 0.82} ${f.browY - 4})`}>
          <path d="M0,-9 C4.8,-2.6 6,0.6 6,2.6 A6,6 0 1 1 -6,2.6 C-6,0.6 -4.8,-2.6 0,-9 Z"
            fill="#9FD4F0" stroke="#4E8FB8" strokeWidth={1.4} />
          <ellipse cx={-1.8} cy={1.6} rx={1.8} ry={2.6} fill="#fff" opacity={0.85} />
        </g>
      );
    case "anger":
      return (
        <g data-part="emote" transform={`translate(${-f.craniumRx * 0.7} ${f.browY - 8})`}
          stroke="#E0303C" strokeWidth={2.2} strokeLinecap="round" fill="none">
          <path d="M-5,-4 L0,0 L-5,4" />
          <path d="M5,-4 L0,0 L5,4" />
          <path d="M-1,-6 L-1,-1 M1,6 L1,1" />
        </g>
      );
    case "sparkle":
      return (
        <g data-part="emote" fill={p.accent}>
          {[[-f.craniumRx * 1.18, f.browY - 10, 4.4], [f.craniumRx * 1.22, f.craniumY - 2, 5.6], [f.craniumRx * 0.95, f.chin - 8, 3.4]].map(
            ([sx, sy, r], i) => (
              <path key={i}
                d={`M${n(sx ?? 0)},${n((sy ?? 0) - (r ?? 3))} l${n((r ?? 3) * 0.28)},${n((r ?? 3) * 0.72)} l${n(r ?? 3)},${n((r ?? 3) * 0.28)} l${n(-(r ?? 3))},${n((r ?? 3) * 0.28)} l${n(-((r ?? 3) * 0.28))},${n((r ?? 3) * 0.72)} l${n(-((r ?? 3) * 0.28))},${n(-((r ?? 3) * 0.72))} l${n(-(r ?? 3))},${n(-((r ?? 3) * 0.28))} l${n(r ?? 3)},${n(-((r ?? 3) * 0.28))} Z`} />
            ),
          )}
        </g>
      );
    case "shadow":
      return (
        <g data-part="emote">
          <path
            d={`M${n(-f.craniumRx * 0.97)},${n(f.browY - 9)} L${n(f.craniumRx * 0.97)},${n(f.browY - 9)}
                Q${n(f.craniumRx * 0.86)},${n(f.eyeY + 4)} ${n(f.craniumRx * 0.5)},${n(f.eyeY + 7)}
                L${n(-f.craniumRx * 0.5)},${n(f.eyeY + 7)}
                Q${n(-f.craniumRx * 0.86)},${n(f.eyeY + 4)} ${n(-f.craniumRx * 0.97)},${n(f.browY - 9)} Z`}
            fill={p.ink} opacity={0.6}
          />
          {[-0.55, -0.18, 0.18, 0.55].map((t) => (
            <path key={t}
              d={`M${n(t * f.craniumRx * 0.9)},${n(f.eyeY + 6)} l0,${n(-(f.eyeY - f.browY) * 0.55)}`}
              stroke={p.skin} strokeWidth={1.2} opacity={0.22} strokeLinecap="round" />
          ))}
        </g>
      );
    case "cold":
      return (
        <g data-part="emote">
          {/* pink cheeks and nose tip */}
          {[-1, 1].map((s) => (
            <ellipse key={s} cx={s * x} cy={f.eyeY + f.eyeH * 0.66} rx={6.5} ry={3.4} fill={p.blush} opacity={0.4} />
          ))}
          <ellipse cx={0} cy={f.noseY + 0.5} rx={3.2} ry={2.4} fill="#FF7F8A" opacity={0.75} />
          {/* shiver ticks either side of the head */}
          <g stroke={p.ink} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7}>
            {[-1, 1].map((s) => (
              <g key={s}>
                <path d={`M${n(s * (f.craniumRx + 11))},${n(f.craniumY - 8)} q${n(s * 4)},6 0,12`} />
                <path d={`M${n(s * (f.craniumRx + 17))},${n(f.craniumY - 5)} q${n(s * 3)},4.5 0,9`} />
              </g>
            ))}
          </g>
          {/* breath fogging in the air */}
          <g fill="#F4F8FF">
            {[0, 0.6, 1.2].map((delay) => (
              <circle key={delay} cx={7} cy={f.mouthY + 2} r={2} opacity={0}>
                <animate attributeName="cx" values={`7;${n(f.craniumRx + 4)}`} dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${n(f.mouthY + 2)};${n(f.mouthY - 8)}`} dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="2;7.5" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.85;0" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        </g>
      );
    default:
      return null;
  }
}

/* ---------------- hair ---------------- */

function onSkull(a: number, f: Face, scale: number): [number, number] {
  const r = (a * Math.PI) / 180;
  return [Math.sin(r) * f.craniumRx * scale, f.craniumY - Math.cos(r) * f.craniumRy * scale];
}

function crownSilhouette(crown: readonly Crown[], f: Face, temple: number): string {
  const VALLEY = 0.92;
  const start = onSkull(-temple, f, 1);
  const parts: string[] = [`M${n(start[0])},${n(start[1])}`];
  for (const c of crown) {
    const l = onSkull(c.a - c.w / 2, f, VALLEY);
    const t = onSkull(c.a + c.skew, f, 1 + c.len);
    const r = onSkull(c.a + c.w / 2, f, VALLEY);
    parts.push(`L${n(l[0])},${n(l[1])}`, `L${n(t[0])},${n(t[1])}`, `L${n(r[0])},${n(r[1])}`);
  }
  const end = onSkull(temple, f, 1);
  parts.push(`L${n(end[0])},${n(end[1])}`);
  // close along the hairline, bowed UP so the face stays clear
  parts.push(`Q0,${n(f.craniumY - f.craniumRy * 0.92)} ${n(start[0])},${n(start[1])}`);
  return `${parts.join(" ")} Z`;
}

function strandPath(s: Strand, f: Face): string {
  const x0 = s.base * f.craniumRx * 0.96;
  const y0 = f.craniumY - f.craniumRy * 0.58 + s.base * s.base * 13;
  const x1 = x0 + s.dx;
  const y1 = y0 + s.dy;
  return [
    `M${n(x0 - s.w)},${n(y0)}`,
    `Q${n(x0 - s.w * 0.4 + s.bow)},${n(y0 + s.dy * 0.6)} ${n(x1)},${n(y1)}`,
    `Q${n(x0 + s.w * 0.4 + s.bow)},${n(y0 + s.dy * 0.6)} ${n(x0 + s.w)},${n(y0)}`,
    "Z",
  ].join(" ");
}

function sheenPath(f: Face): string {
  const y = f.craniumY - f.craniumRy * 0.72;
  const w = f.craniumRx * 0.82;
  const pts: string[] = [`M${n(-w)},${n(y)}`];
  for (let i = 0; i < 5; i += 1) {
    const x = -w + (2 * w * (i + 0.5)) / 5;
    pts.push(`L${n(x)},${n(y + (i % 2 === 0 ? -4.5 : 4.5))}`);
  }
  pts.push(`L${n(w)},${n(y)}`, `L${n(w)},${n(y + 7)}`);
  for (let i = 4; i >= 0; i -= 1) {
    const x = -w + (2 * w * (i + 0.5)) / 5;
    pts.push(`L${n(x)},${n(y + 7 + (i % 2 === 0 ? -4.5 : 4.5))}`);
  }
  pts.push(`L${n(-w)},${n(y + 7)}`);
  return `${pts.join(" ")} Z`;
}

function backHair(f: Face, drop: number): string {
  const rx = f.craniumRx * 1.16;
  const ry = f.craniumRy * 1.12;
  const cy = f.craniumY;
  const bottom = cy + ry * drop;
  return [
    `M${n(-rx)},${n(cy)}`,
    `C${n(-rx)},${n(cy - ry * 1.15)} ${n(rx)},${n(cy - ry * 1.15)} ${n(rx)},${n(cy)}`,
    `C${n(rx * 1.05)},${n(cy + ry * drop * 0.6)} ${n(rx * 0.92)},${n(bottom - 6)} ${n(rx * 0.72)},${n(bottom)}`,
    `L${n(rx * 0.5)},${n(bottom - 9)} L${n(rx * 0.24)},${n(bottom + 4)} L0,${n(bottom - 7)}`,
    `L${n(-rx * 0.24)},${n(bottom + 4)} L${n(-rx * 0.5)},${n(bottom - 9)} L${n(-rx * 0.72)},${n(bottom)}`,
    `C${n(-rx * 0.92)},${n(bottom - 6)} ${n(-rx * 1.05)},${n(cy + ry * drop * 0.6)} ${n(-rx)},${n(cy)}`,
    "Z",
  ].join(" ");
}

/* ---------------- garments ---------------- */

function torsoPath(s: Skeleton): string {
  const t = s.torso;
  const chestY = t.shoulderY + (t.waistY - t.shoulderY) * 0.38;
  return [
    `M${n(-t.shoulderW / 2)},${n(t.shoulderY + 6)}`,
    `C${n(-t.shoulderW / 2 - 1)},${n(chestY)} ${n(-t.waistW / 2 - 4)},${n(t.waistY - 14)} ${n(-t.waistW / 2)},${n(t.waistY)}`,
    `C${n(-t.hipW / 2 - 2)},${n(t.hipY - 12)} ${n(-t.hipW / 2)},${n(t.hipY - 2)} ${n(-t.hipW / 2)},${n(t.hipY + 8)}`,
    `L${n(t.hipW / 2)},${n(t.hipY + 8)}`,
    `C${n(t.hipW / 2)},${n(t.hipY - 2)} ${n(t.hipW / 2 + 2)},${n(t.hipY - 12)} ${n(t.waistW / 2)},${n(t.waistY)}`,
    `C${n(t.waistW / 2 + 4)},${n(t.waistY - 14)} ${n(t.shoulderW / 2 + 1)},${n(chestY)} ${n(t.shoulderW / 2)},${n(t.shoulderY + 6)}`,
    `C${n(t.shoulderW / 4)},${n(t.shoulderY - 7)} ${n(-t.shoulderW / 4)},${n(t.shoulderY - 7)} ${n(-t.shoulderW / 2)},${n(t.shoulderY + 6)}`,
    "Z",
  ].join(" ");
}

function TorsoGarment({
  id, outfit, s, p,
}: { id: DetailId; outfit: DOutfit; s: Skeleton; p: DetailPalette }): JSX.Element {
  const t = s.torso;
  const fill =
    outfit === "parka" ? "#4E6E8E"
    : outfit === "shell" ? "#3B7A60"
    : outfit === "beret" ? "#5C4468"
    : outfit === "tote" ? "#EDE6DA"
    : p.top;
  const collarY = t.shoulderY + 2;

  return (
    <g data-part="body">
      <path d={torsoPath(s)} fill={fill} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
      {outfit === "kit" && id === "sun" && (
        <>
          {/* V-neck collar and shoulder trim — sportswear construction */}
          <path
            d={`M${n(-15)},${n(collarY - 3)} L0,${n(collarY + 16)} L15,${n(collarY - 3)} L${n(11)},${n(collarY - 5)} L0,${n(collarY + 10)} L${n(-11)},${n(collarY - 5)} Z`}
            fill={p.trim}
          />
          <path d={`M${n(-t.shoulderW / 2 + 3)},${n(t.shoulderY + 14)} L${n(-t.waistW / 2 + 1)},${n(t.waistY - 4)}`}
            stroke={p.trim} strokeWidth={4} opacity={0.9} strokeLinecap="round" />
          <path d={`M${n(t.shoulderW / 2 - 3)},${n(t.shoulderY + 14)} L${n(t.waistW / 2 - 1)},${n(t.waistY - 4)}`}
            stroke={p.trim} strokeWidth={4} opacity={0.9} strokeLinecap="round" />
          <path d={`M${n(-t.waistW / 2 - 2)},${n(t.waistY + 6)} L${n(t.waistW / 2 + 2)},${n(t.waistY + 6)}`}
            stroke={p.trim} strokeWidth={3} opacity={0.5} />
        </>
      )}
      {outfit === "kit" && id === "curse" && (
        <>
          {/* crossed kimono front, right panel over left */}
          <path
            d={`M${n(-t.shoulderW / 2 + 6)},${n(collarY + 2)} L2,${n(t.waistY + 4)} L${n(t.waistW / 2)},${n(t.waistY + 2)} L${n(t.shoulderW / 2 - 6)},${n(collarY + 2)} Z`}
            fill="#1A1921" opacity={0.85}
          />
          <path
            d={`M${n(-t.shoulderW / 2 + 6)},${n(collarY + 1)} L${n(-2)},${n(t.waistY + 6)} L${n(6)},${n(t.waistY + 4)} L${n(-t.shoulderW / 2 + 15)},${n(collarY)} Z`}
            fill={p.trim} opacity={0.95}
          />
          <path
            d={`M${n(t.shoulderW / 2 - 6)},${n(collarY + 1)} L${n(2)},${n(t.waistY + 6)} L${n(-6)},${n(t.waistY + 4)} L${n(t.shoulderW / 2 - 15)},${n(collarY)} Z`}
            fill={p.trim} opacity={0.95}
          />
          {/* obi */}
          <path
            d={`M${n(-t.waistW / 2 - 3)},${n(t.waistY + 2)} L${n(t.waistW / 2 + 3)},${n(t.waistY + 2)} L${n(t.waistW / 2 + 1)},${n(t.waistY + 20)} L${n(-t.waistW / 2 - 1)},${n(t.waistY + 20)} Z`}
            fill="#3A3742" stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
          />
          <path d={`M${n(-t.waistW / 2)},${n(t.waistY + 11)} L${n(t.waistW / 2)},${n(t.waistY + 11)}`}
            stroke={p.trim} strokeWidth={2} opacity={0.8} />
        </>
      )}
      {outfit === "parka" && (
        <path d={`M${n(-t.shoulderW / 2 - 3)},${n(t.shoulderY + 2)} Q0,${n(t.shoulderY + 26)} ${n(t.shoulderW / 2 + 3)},${n(t.shoulderY + 2)} Q0,${n(t.shoulderY - 12)} ${n(-t.shoulderW / 2 - 3)},${n(t.shoulderY + 2)} Z`}
          fill="#EFE7DA" stroke={p.ink} strokeWidth={s.stroke} />
      )}
      {outfit === "shell" && (
        <>
          <path d={`M0,${n(t.shoulderY + 8)} L0,${n(t.waistY + 4)}`} stroke={p.ink} strokeWidth={1.6} opacity={0.6} />
          <path d={`M${n(-t.shoulderW / 2 + 2)},${n(t.shoulderY + 6)} Q0,${n(t.shoulderY - 18)} ${n(t.shoulderW / 2 - 2)},${n(t.shoulderY + 6)} Z`}
            fill="#2E6149" stroke={p.ink} strokeWidth={s.stroke} />
        </>
      )}
      {outfit === "tote" && (
        <>
          <path d={`M${n(-t.shoulderW / 2 + 10)},${n(t.shoulderY + 6)} L${n(t.waistW / 2 + 2)},${n(t.waistY + 18)}`}
            stroke="#8A7A62" strokeWidth={4} fill="none" />
          <rect x={t.waistW / 2 - 8} y={t.waistY + 14} width={30} height={30} rx={2}
            fill="#C9B79C" stroke={p.ink} strokeWidth={s.stroke} />
        </>
      )}
    </g>
  );
}

/* ---------------- limbs ---------------- */

function Limb({
  x, y1, y2, w, fill, ink, stroke,
}: { x: number; y1: number; y2: number; w: number; fill: string; ink: string; stroke: number }): JSX.Element {
  const d = `M${n(x)},${n(y1)} L${n(x)},${n(y2)}`;
  return (
    <>
      <path d={d} stroke={ink} strokeWidth={w + stroke * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none" />
    </>
  );
}

function Arm({
  id, side, shoulder, elbow, s, p, outfit, markings,
}: {
  id: DetailId; side: "L" | "R"; shoulder: number; elbow: number;
  s: Skeleton; p: DetailPalette; outfit: DOutfit; markings: boolean;
}): JSX.Element {
  const sx = side === "L" ? -s.shoulderX : s.shoulderX;
  const sy = s.torso.shoulderY;
  const ey = sy + s.upperArm;
  const wy = ey + s.foreArm;
  const longSleeve = outfit === "parka" || outfit === "shell";
  const sleeveFill =
    outfit === "parka" ? "#44607C" : outfit === "shell" ? "#336B54"
    : outfit === "beret" ? "#513B5C" : outfit === "tote" ? "#DCD3C4" : p.top;

  return (
    <g data-part={`arm-${side.toLowerCase()}`} data-origin={`${sx} ${sy}`}
      transform={`rotate(${shoulder} ${sx} ${sy})`}>
      {/* bare upper arm under the sleeve, so short sleeves read as short */}
      <Limb x={sx} y1={sy - 7} y2={ey} w={LIMB.upperArm} fill={p.skin} ink={p.ink} stroke={s.stroke} />
      {id === "curse" && outfit === "kit" ? (
        // wide hanging kimono sleeve
        <path
          d={`M${n(sx - 15)},${n(sy - 4)} L${n(sx + 15)},${n(sy - 4)} L${n(sx + 19)},${n(ey + 6)} L${n(sx - 19)},${n(ey + 14)} Z`}
          fill={p.top} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
        />
      ) : (
        <Limb x={sx} y1={sy - 7} y2={longSleeve ? wy - 6 : ey - s.upperArm * 0.32}
          w={LIMB.upperArm + 2} fill={sleeveFill} ink={p.ink} stroke={s.stroke} />
      )}
      <g data-part={`forearm-${side.toLowerCase()}`} data-origin={`${sx} ${ey}`}
        transform={`rotate(${elbow} ${sx} ${ey})`}>
        <Limb x={sx} y1={ey - 3} y2={wy + 5} w={LIMB.foreArm} fill={longSleeve ? sleeveFill : p.skin} ink={p.ink} stroke={s.stroke} />
        {markings && !longSleeve && (
          <g data-part={`markings-${side.toLowerCase()}`} stroke={p.ink} strokeWidth={2.2} strokeLinecap="round">
            <path d={`M${n(sx - 4.5)},${n(ey + 14)} l9,0`} />
            <path d={`M${n(sx - 4.5)},${n(ey + 23)} l9,0`} />
          </g>
        )}
        {/* hand: a wedge, not a ball */}
        <path
          d={`M${n(sx - 5.5)},${n(wy + 2)} Q${n(sx - 7.5)},${n(wy + 12)} ${n(sx - 2)},${n(wy + 15)} Q${n(sx + 5)},${n(wy + 16)} ${n(sx + 6.5)},${n(wy + 8)} L${n(sx + 5.5)},${n(wy + 2)} Z`}
          fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function Leg({
  id, side, hip, knee, s, p, outfit,
}: {
  id: DetailId; side: "L" | "R"; hip: number; knee: number;
  s: Skeleton; p: DetailPalette; outfit: DOutfit;
}): JSX.Element {
  const hx = side === "L" ? -s.hipX : s.hipX;
  const hy = s.torso.hipY;
  const ky = hy + s.thigh;
  const ay = ky + s.shin;
  const shorts = outfit === "kit" && id === "sun";
  const hakama = outfit === "kit" && id === "curse";

  return (
    <g data-part={`leg-${side.toLowerCase()}`} data-origin={`${hx} ${hy}`}
      transform={`rotate(${hip} ${hx} ${hy})`}>
      <Limb x={hx} y1={hy - 10} y2={ky} w={LIMB.thigh} fill={shorts ? p.skin : p.bottom} ink={p.ink} stroke={s.stroke} />
      {shorts && (
        <path
          d={`M${n(hx - 15)},${n(hy - 8)} L${n(hx + 15)},${n(hy - 8)} L${n(hx + 17)},${n(hy + 42)} L${n(hx - 17)},${n(hy + 46)} Z`}
          fill={p.bottom} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
        />
      )}
      {hakama && (
        <path
          d={`M${n(hx - 17)},${n(hy - 8)} L${n(hx + 17)},${n(hy - 8)} L${n(hx + 21)},${n(ky + 30)} L${n(hx - 21)},${n(ky + 30)} Z`}
          fill={p.bottom} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
        />
      )}
      <g data-part={`shin-${side.toLowerCase()}`} data-origin={`${hx} ${ky}`}
        transform={`rotate(${-knee} ${hx} ${ky})`}>
        <Limb x={hx} y1={ky - 3} y2={ay} w={LIMB.shin} fill={shorts ? p.skin : p.bottom} ink={p.ink} stroke={s.stroke} />
        {shorts && (
          /* knee pad — the one detail that says volleyball rather than gym */
          <path d={`M${n(hx - 9.5)},${n(ky - 4)} L${n(hx + 9.5)},${n(ky - 4)} L${n(hx + 9.5)},${n(ky + 16)} L${n(hx - 9.5)},${n(ky + 16)} Z`}
            fill="#EFE9DE" stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
        )}
        <path
          d={`M${n(hx - s.foot.len * 0.3)},${n(ay - 4)} L${n(hx - s.foot.len * 0.78)},${n(ay + s.foot.h)} Q${n(hx - s.foot.len * 0.8)},${n(ay + s.foot.h + 4)} ${n(hx - s.foot.len * 0.66)},${n(ay + s.foot.h + 4)} L${n(hx + s.foot.len * 0.34)},${n(ay + s.foot.h + 4)} Q${n(hx + s.foot.len * 0.4)},${n(ay + 2)} ${n(hx + s.foot.len * 0.3)},${n(ay - 4)} Z`}
          fill={p.shoe} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
        />
        <path d={`M${n(hx - s.foot.len * 0.74)},${n(ay + s.foot.h)} L${n(hx + s.foot.len * 0.36)},${n(ay + s.foot.h)}`}
          stroke={p.shoeTrim} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ---------------- assembly ---------------- */

export function DetailedCharacter({
  id, pose = IDLE, brow = "neutral", eye = "open", mouth = "smile",
  emote = "none", outfit = "kit", uid, className, flip = false,
  crop = "full", turn = 0, variants = false,
}: DetailedProps): JSX.Element {
  const c = DETAILED[id];
  const s = c.skeleton;
  const f = c.face;
  const p = c.palette;
  const crown = id === "sun" ? SUN_CROWN : CURSE_CROWN;
  const strands = id === "sun" ? SUN_STRANDS : CURSE_STRANDS;
  const mouthEl = MOUTH_SET[mouth];

  const viewBox =
    crop === "head"
      ? `${n(-f.craniumRx * 1.95)} ${n(f.top - f.craniumRy * 1.0)} ${n(f.craniumRx * 3.9)} ${n(f.chin - f.top + f.craniumRy * 1.5)}`
      : s.viewBox;

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={c.name}
      data-character={id} data-style="detailed" id={`dc-${uid}`}>
      <g data-part="root"
        transform={`${flip ? "scale(-1 1) " : ""}scale(${1 - 0.2 * Math.abs(turn)} 1) translate(0 ${pose.bob})`}>

        {crop !== "head" && (
          <g data-part="far-side" style={{ filter: "brightness(0.86)" }}>
            <Leg id={id} side="L" hip={pose.hipL} knee={pose.kneeL} s={s} p={p} outfit={outfit} />
            <Arm id={id} side="L" shoulder={pose.shoulderL} elbow={pose.elbowL} s={s} p={p}
              outfit={outfit} markings={c.markings} />
          </g>
        )}

        <g data-part="spine" data-origin={`0 ${s.torso.hipY}`}
          transform={`rotate(${pose.lean} 0 ${s.torso.hipY})`}>
          {crop !== "head" && (
            <>
              <Leg id={id} side="R" hip={pose.hipR} knee={pose.kneeR} s={s} p={p} outfit={outfit} />
              <path
                d={`M${n(-s.neck.w / 2)},${n(s.neck.top)} L${n(-s.neck.w / 2 - 2)},${n(s.neck.bottom)} L${n(s.neck.w / 2 + 2)},${n(s.neck.bottom)} L${n(s.neck.w / 2)},${n(s.neck.top)} Z`}
                fill={p.skinShade} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round"
              />
              <TorsoGarment id={id} outfit={outfit} s={s} p={p} />
            </>
          )}

          <g data-part="head" data-origin={`0 ${s.head.pivotY}`}
            transform={`rotate(${pose.headTilt} 0 ${s.head.pivotY}) translate(${pose.headTurn + turn * -6} 0)`}>

            <path data-part="hair-back" data-origin={`0 ${f.craniumY}`}
              d={backHair(f, id === "sun" ? 1.05 : 1.75)}
              fill={p.hairShade} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />

            <path data-part="face" d={headPath(f)} fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} />
            {/* cheek and jaw shading — this is what gives the head structure */}
            <path d={`M${n(f.jawX - 2)},${n(f.jawY - 8)} Q${n(f.jawX - 4)},${n(f.jawY + 4)} ${n(f.jawX - 9)},${n(f.jawY + 10)}`}
              stroke={p.skinShade} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
            <path d={`M${n(-f.jawX + 2)},${n(f.jawY - 8)} Q${n(-f.jawX + 4)},${n(f.jawY + 4)} ${n(-f.jawX + 9)},${n(f.jawY + 10)}`}
              stroke={p.skinShade} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />

            <path data-part="ear-l"
              d={`M${n(-f.craniumRx - 1)},${n(f.earY - 6)} q-6,1 -6,7 q0,7 6,8 Z`}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <path data-part="ear-r"
              d={`M${n(f.craniumRx + 1)},${n(f.earY - 6)} q6,1 6,7 q0,7 -6,8 Z`}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />

            {c.markings && (
              <g data-part="markings" stroke={p.ink} strokeWidth={2.4} strokeLinecap="round" fill="none">
                <path d={`M${n(-f.craniumRx * 0.86)},${n(f.eyeY + 1)} l-1.5,9`} />
                <path d={`M${n(-f.craniumRx * 0.64)},${n(f.eyeY + 3)} l-1.5,8`} />
                <path d={`M${n(f.craniumRx * 0.86)},${n(f.eyeY + 1)} l1.5,9`} />
                <path d={`M${n(f.craniumRx * 0.64)},${n(f.eyeY + 3)} l1.5,8`} />
                <path d={`M-9,${n(f.browY - 9)} l-3.5,8`} />
                <path d={`M9,${n(f.browY - 9)} l3.5,8`} />
              </g>
            )}

            <Eye state={eye} f={f} p={p} uid={uid} side="L" variants={variants} />
            <Eye state={eye} f={f} p={p} uid={uid} side="R" variants={variants} />
            {variants
              ? D_BROWS.map((v) => <g key={v} data-brow={v}><Brows brow={v} f={f} p={p} /></g>)
              : <Brows brow={brow} f={f} p={p} />}

            {/* nose: a shadow and a nostril tick, never an outline */}
            <path d={`M${n(-2.5)},${n(f.noseY - 4)} Q${n(-3.5)},${n(f.noseY)} 0,${n(f.noseY + 0.5)}`}
              stroke={p.skinShade} strokeWidth={2} fill="none" strokeLinecap="round" />

            <g data-part="mouth" transform={`translate(0 ${f.mouthY})`}>
              <g data-part="mouth-anim">
                {variants
                  ? D_MOUTHS.map((v) => <g key={v} data-mouth={v}>{MOUTH_SET[v](p)}</g>)
                  : mouthEl(p)}
              </g>
            </g>
            {variants
              ? D_EMOTES.map((v) => <g key={v} data-emote={v}><Emote emote={v} f={f} p={p} /></g>)
              : <Emote emote={emote} f={f} p={p} />}

            <path data-part="hair-front" data-origin={`0 ${f.craniumY}`}
              d={crownSilhouette(crown, f, id === "sun" ? 128 : 124)}
              fill={p.hair} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <path data-part="sheen" d={sheenPath(f)} fill={p.hairLight} opacity={0.65} />
            <g data-part="strands" data-origin={`0 ${f.craniumY}`}>
              {strands.map((st, i) => {
                const edge = Math.abs(st.base) > 0.74;
                return (
                  <path
                    key={i}
                    d={strandPath(st, f)}
                    fill={edge ? p.hairShade : p.hair}
                    stroke={edge ? p.ink : p.hairShade}
                    strokeWidth={edge ? s.stroke : 1}
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>

            {outfit === "beret" && (
              <path data-part="beret"
                d={`M${n(-f.craniumRx * 1.15)},${n(f.craniumY - f.craniumRy * 0.5)} Q0,${n(f.craniumY - f.craniumRy * 2.3)} ${n(f.craniumRx * 1.15)},${n(f.craniumY - f.craniumRy * 0.5)} Q0,${n(f.craniumY - f.craniumRy * 0.15)} ${n(-f.craniumRx * 1.15)},${n(f.craniumY - f.craniumRy * 0.5)} Z`}
                fill="#5C4468" stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            )}
          </g>
        </g>

        {crop !== "head" && (
          <Arm id={id} side="R" shoulder={pose.shoulderR} elbow={pose.elbowR} s={s} p={p}
            outfit={outfit} markings={c.markings} />
        )}
      </g>
    </svg>
  );
}
