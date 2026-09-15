import type { JSX } from "react";
import {
  CHARACTERS, IDLE,
  type ArmPose, type BrowPose, type CharacterId, type EyeState,
  type MouthShape, type Outfit, type Pose, type Skeleton, type Palette,
} from "@/lib/characters/rig";
import {
  hairPath, backHairPath,
  SUN_SPIKES, CURSE_SPIKES, SUN_FRINGE, CURSE_FRINGE, SUN_HAIR, CURSE_HAIR,
  type HeadGeom,
} from "@/lib/characters/hair";

/**
 * One character, posed. Every joint is its own <g> with an explicit rotation
 * origin, and every part carries a `data-part` name matching PREP.md §4.4 — so
 * GSAP can address `[data-part="hair-front"]` and spin it about the crown
 * without any of this markup changing.
 *
 * Limbs are stroked, not filled: an ink pass under a colour pass gives outlined,
 * round-jointed limbs that stay correct at every angle. Filled limb shapes tear
 * at the joints when rotated; strokes cannot.
 */

export type CharacterProps = {
  id: CharacterId;
  pose?: Pose;
  brow?: BrowPose;
  eye?: EyeState;
  mouth?: MouthShape;
  outfit?: Outfit;
  /** unique per instance on a page — namespaces gradient/clip ids */
  uid: string;
  className?: string;
  /** true = mirrored, so they can walk the other way */
  flip?: boolean;
  /** "head" crops to the face, for expression swatches */
  crop?: "full" | "head";
  /** 0 = flat front, 1 = full 3/4 turn (narrows the body, shifts the features) */
  turn?: number;
};

const LIMB = { arm: 13, leg: 15 } as const;

/**
 * Sleeves are separated from the torso by VALUE, not by outline — an outline
 * alone does not survive the overlap, and a swinging arm in the torso's exact
 * fill reads as a stripe across the chest.
 *
 * Which direction to push depends on the garment: darkening a near-black top
 * does nothing (B loses his arms), so dark tops get a lighter sleeve and light
 * tops a darker one.
 */
function sleeveOf(hex: string): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  const body = m?.[1];
  if (!body) return hex;
  const n = Number.parseInt(body, 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  const lum = (0.2126 * (rgb[0] ?? 0) + 0.7152 * (rgb[1] ?? 0) + 0.0722 * (rgb[2] ?? 0)) / 255;
  const k = lum < 0.42 ? 1.7 : 0.88;
  const out = rgb.map((v) => Math.max(0, Math.min(255, Math.round(v * k + (lum < 0.42 ? 12 : 0)))));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function Limb({
  x1, y1, x2, y2, w, fill, ink, stroke,
}: {
  x1: number; y1: number; x2: number; y2: number;
  w: number; fill: string; ink: string; stroke: number;
}): JSX.Element {
  const d = `M${x1},${y1} L${x2},${y2}`;
  return (
    <>
      <path d={d} stroke={ink} strokeWidth={w + stroke * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none" />
    </>
  );
}

function Arm({
  side, shoulder, elbow, s, p, sleeve, markings,
}: {
  side: "L" | "R"; shoulder: number; elbow: number;
  s: Skeleton; p: Palette; sleeve: string; markings: boolean;
}): JSX.Element {
  const sx = side === "L" ? -s.shoulderX : s.shoulderX;
  const sy = s.torso.shoulderY;
  const ey = sy + s.upperArm;
  const wy = ey + s.foreArm;
  return (
    <g
      data-part={`arm-${side.toLowerCase()}`}
      data-origin={`${sx} ${sy}`}
      transform={`rotate(${shoulder} ${sx} ${sy})`}
    >
      <Limb x1={sx} y1={sy - 6} x2={sx} y2={ey} w={LIMB.arm} fill={sleeve} ink={p.ink} stroke={s.stroke} />
      <g
        data-part={`forearm-${side.toLowerCase()}`}
        data-origin={`${sx} ${ey}`}
        transform={`rotate(${elbow} ${sx} ${ey})`}
      >
        <Limb x1={sx} y1={ey - 2} x2={sx} y2={wy + 7} w={LIMB.arm - 2} fill={p.skin} ink={p.ink} stroke={s.stroke} />
        <circle cx={sx} cy={wy + 6} r={6.6} fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} />
        {markings && (
          <g data-part={`markings-${side.toLowerCase()}`} stroke={p.ink} strokeWidth={2.4} strokeLinecap="round">
            <path d={`M${sx - 4},${ey + 14} l8,0`} />
            <path d={`M${sx - 4},${ey + 22} l8,0`} />
          </g>
        )}
      </g>
    </g>
  );
}

function Leg({
  side, hip, knee, s, p,
}: {
  side: "L" | "R"; hip: number; knee: number; s: Skeleton; p: Palette;
}): JSX.Element {
  const hx = side === "L" ? -s.hipX : s.hipX;
  const hy = s.torso.hipY;
  const ky = hy + s.thigh;
  const ay = ky + s.shin;
  return (
    <g
      data-part={`leg-${side.toLowerCase()}`}
      data-origin={`${hx} ${hy}`}
      transform={`rotate(${hip} ${hx} ${hy})`}
    >
      <Limb x1={hx} y1={hy - 8} x2={hx} y2={ky} w={LIMB.leg} fill={p.bottom} ink={p.ink} stroke={s.stroke} />
      <g
        data-part={`shin-${side.toLowerCase()}`}
        data-origin={`${hx} ${ky}`}
        transform={`rotate(${-knee} ${hx} ${ky})`}
      >
        <Limb x1={hx} y1={ky - 2} x2={hx} y2={ay} w={LIMB.leg - 2} fill={p.bottom} ink={p.ink} stroke={s.stroke} />
        <path
          d={`M${hx - s.foot.len * 0.28},${ay} L${hx - s.foot.len * 0.72},${ay + s.foot.h} L${hx + s.foot.len * 0.3},${ay + s.foot.h} L${hx + s.foot.len * 0.28},${ay} Z`}
          fill={p.shoe}
          stroke={p.ink}
          strokeWidth={s.stroke}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function torsoPath(s: Skeleton): string {
  const t = s.torso;
  return [
    `M${-t.shoulderW / 2},${t.shoulderY + 4}`,
    `Q${-t.shoulderW / 2 - 2},${(t.shoulderY + t.waistY) / 2} ${-t.waistW / 2},${t.waistY}`,
    `Q${-t.hipW / 2 - 1},${t.hipY - 4} ${-t.hipW / 2},${t.hipY + 7}`,
    `L${t.hipW / 2},${t.hipY + 7}`,
    `Q${t.hipW / 2 + 1},${t.hipY - 4} ${t.waistW / 2},${t.waistY}`,
    `Q${t.shoulderW / 2 + 2},${(t.shoulderY + t.waistY) / 2} ${t.shoulderW / 2},${t.shoulderY + 4}`,
    `Q${t.shoulderW / 4},${t.shoulderY - 9} 0,${t.shoulderY - 10}`,
    `Q${-t.shoulderW / 4},${t.shoulderY - 9} ${-t.shoulderW / 2},${t.shoulderY + 4}`,
    "Z",
  ].join(" ");
}

/* ---------- face ---------- */

const BROW_SET: Record<BrowPose, { dy: number; rot: number; curve: number }> = {
  neutral:   { dy: 0,    rot: 0,   curve: -2.2 },
  raised:    { dy: -4,   rot: -5,  curve: -3.4 },
  furrowed:  { dy: 3,    rot: 15,  curve: 0.8 },
  worried:   { dy: -1,   rot: -17, curve: 1.6 },
  delighted: { dy: -3.5, rot: 2,   curve: -4.6 },
};

function Brows({ brow, s, p }: { brow: BrowPose; s: Skeleton; p: Palette }): JSX.Element {
  const b = BROW_SET[brow];
  const { eyeX, browY } = s.face;
  // `rot` is authored for the character's inner edge; mirrored across the centre
  const one = (sign: 1 | -1): JSX.Element => (
    <path
      d={`M-8,0 Q0,${b.curve} 8,0`}
      transform={`translate(${sign * eyeX} ${browY + b.dy}) rotate(${sign * b.rot})`}
      stroke={p.ink}
      strokeWidth={3.4}
      strokeLinecap="round"
      fill="none"
    />
  );
  return <g data-part="brows">{one(-1)}{one(1)}</g>;
}

function Eye({
  state, x, y, r, p,
}: { state: EyeState; x: number; y: number; r: number; p: Palette }): JSX.Element {
  const rx = r * 0.8;
  const g = (inner: JSX.Element): JSX.Element => <g transform={`translate(${x} ${y})`}>{inner}</g>;
  switch (state) {
    case "closed":
      return g(
        <path d={`M${-rx},1 Q0,${-r * 0.7} ${rx},1`} stroke={p.ink} strokeWidth={3.2}
          strokeLinecap="round" fill="none" />,
      );
    case "half":
      return g(
        <>
          <ellipse cx={0} cy={r * 0.3} rx={rx} ry={r * 0.55} fill={p.ink} />
          <path d={`M${-rx - 1},${-r * 0.2} L${rx + 1},${-r * 0.2}`} stroke={p.ink}
            strokeWidth={3} strokeLinecap="round" />
        </>,
      );
    case "wide":
      return g(
        <>
          <ellipse cx={0} cy={0} rx={rx * 1.18} ry={r * 1.2} fill="#fff"
            stroke={p.ink} strokeWidth={2.6} />
          <ellipse cx={0} cy={r * 0.12} rx={rx * 0.66} ry={r * 0.72} fill={p.ink} />
          <circle cx={-rx * 0.3} cy={-r * 0.34} r={r * 0.2} fill="#fff" />
        </>,
      );
    case "sparkle":
      return g(
        <>
          <ellipse cx={0} cy={0} rx={rx} ry={r} fill={p.ink} />
          <path d={`M0,${-r * 0.75} L${rx * 0.3},${-r * 0.1} L0,${r * 0.55} L${-rx * 0.3},${-r * 0.1} Z`}
            fill="#fff" />
          <circle cx={rx * 0.42} cy={r * 0.4} r={r * 0.17} fill="#fff" />
        </>,
      );
    case "side":
      return g(
        <>
          <ellipse cx={0} cy={0} rx={rx * 1.05} ry={r} fill="#fff"
            stroke={p.ink} strokeWidth={2.6} />
          <ellipse cx={-rx * 0.4} cy={0} rx={rx * 0.55} ry={r * 0.8} fill={p.ink} />
        </>,
      );
    case "open":
    default:
      return g(
        <>
          <ellipse cx={0} cy={0} rx={rx} ry={r} fill={p.ink} />
          <circle cx={-rx * 0.32} cy={-r * 0.36} r={r * 0.24} fill="#fff" />
        </>,
      );
  }
}

const MOUTH_SET: Record<MouthShape, (p: Palette) => JSX.Element> = {
  closed: (p) => <path d="M-5.5,0 Q0,2.4 5.5,0" stroke={p.ink} strokeWidth={3} strokeLinecap="round" fill="none" />,
  smile: (p) => <path d="M-7.5,-1.5 Q0,6.5 7.5,-1.5" stroke={p.ink} strokeWidth={3} strokeLinecap="round" fill="none" />,
  grin: (p) => (
    <>
      <path d="M-10,-2 Q0,10 10,-2 Z" fill={p.ink} />
      <path d="M-8.2,-1.4 L8.2,-1.4" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  open: (p) => <ellipse cx={0} cy={2} rx={6} ry={8} fill={p.ink} />,
  o: (p) => <circle cx={0} cy={1} r={4.6} fill={p.ink} />,
  talkA: (p) => <ellipse cx={0} cy={1} rx={7.6} ry={4.8} fill={p.ink} />,
  talkO: (p) => <ellipse cx={0} cy={1} rx={4} ry={6.6} fill={p.ink} />,
  sad: (p) => <path d="M-7,2.5 Q0,-4 7,2.5" stroke={p.ink} strokeWidth={3} strokeLinecap="round" fill="none" />,
};

/* ---------- outfits ---------- */

function outfitColour(outfit: Outfit, p: Palette): string {
  switch (outfit) {
    case "parka": return "#4E6E8E";
    case "shell": return "#3F7D62";
    case "beret": return "#6B4A7A";
    case "tote": return "#C9B79C";
    default: return p.top;
  }
}

function OutfitExtras({ outfit, s, p }: { outfit: Outfit; s: Skeleton; p: Palette }): JSX.Element | null {
  const t = s.torso;
  switch (outfit) {
    case "parka":
      return (
        <g data-part="outfit-extra">
          <path d={`M${-t.shoulderW / 2 - 4},${t.shoulderY + 2} Q0,${t.shoulderY + 20} ${t.shoulderW / 2 + 4},${t.shoulderY + 2}`}
            fill="#F3EDE4" stroke={p.ink} strokeWidth={s.stroke} />
        </g>
      );
    case "shell":
      return (
        <g data-part="outfit-extra">
          <path d={`M0,${t.shoulderY + 4} L0,${t.waistY}`} stroke={p.ink} strokeWidth={2} />
          <path d={`M${-t.shoulderW / 2},${t.shoulderY + 4} Q0,${t.shoulderY - 14} ${t.shoulderW / 2},${t.shoulderY + 4} Z`}
            fill="#2F5F4A" stroke={p.ink} strokeWidth={s.stroke} />
        </g>
      );
    case "tote":
      return (
        <g data-part="outfit-extra">
          <path d={`M${-t.shoulderW / 2 + 6},${t.shoulderY + 4} L${t.waistW / 2 + 2},${t.waistY + 14}`}
            stroke={p.ink} strokeWidth={3.4} fill="none" />
          <rect x={t.waistW / 2 - 6} y={t.waistY + 10} width={26} height={26} rx={3}
            fill="#C9B79C" stroke={p.ink} strokeWidth={s.stroke} />
        </g>
      );
    default:
      return null;
  }
}

export function Character({
  id, pose = IDLE, brow = "neutral", eye = "open", mouth = "smile",
  outfit = "base", uid, className, flip = false, crop = "full", turn = 0,
}: CharacterProps): JSX.Element {
  const c = CHARACTERS[id];
  const s = c.skeleton;
  const p = c.palette;
  const head: HeadGeom = { cx: s.head.cx, cy: s.head.cy, rx: s.head.rx, ry: s.head.ry };
  const spikes = id === "sun" ? SUN_SPIKES : CURSE_SPIKES;
  const fringe = id === "sun" ? SUN_FRINGE : CURSE_FRINGE;
  const hairOpts = id === "sun" ? SUN_HAIR : CURSE_HAIR;
  const top = outfitColour(outfit, p);
  const sleeve = sleeveOf(top);
  const mouthEl = MOUTH_SET[mouth];
  const viewBox =
    crop === "head"
      ? `${head.cx - head.rx * 2.1} ${head.cy - head.ry * 2.3} ${head.rx * 4.2} ${head.ry * 3.7}`
      : s.viewBox;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={c.name}
      data-character={id}
      id={`ch-${uid}`}
    >
      <g
        data-part="root"
        transform={`${flip ? "scale(-1 1) " : ""}scale(${1 - 0.22 * Math.abs(turn)} 1) translate(0 ${pose.bob})`}
      >
        {/* far limbs */}
        <g data-part="far-side" opacity={0.9} style={{ filter: "brightness(0.88)" }}>
          <Leg side="L" hip={pose.hipL} knee={pose.kneeL} s={s} p={p} />
          <Arm side="L" shoulder={pose.shoulderL} elbow={pose.elbowL} s={s} p={p} sleeve={sleeve} markings={c.markings} />
        </g>

        <g data-part="spine" data-origin={`0 ${s.torso.hipY}`} transform={`rotate(${pose.lean} 0 ${s.torso.hipY})`}>
          <Leg side="R" hip={pose.hipR} knee={pose.kneeR} s={s} p={p} />

          {/* neck */}
          <path
            d={`M${-s.neck.w / 2},${s.neck.top} L${-s.neck.w / 2},${s.neck.bottom} L${s.neck.w / 2},${s.neck.bottom} L${s.neck.w / 2},${s.neck.top} Z`}
            fill={p.skin}
            stroke={p.ink}
            strokeWidth={s.stroke}
            strokeLinejoin="round"
          />

          <g data-part="body">
            <path d={torsoPath(s)} fill={top} stroke={p.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
            <OutfitExtras outfit={outfit} s={s} p={p} />
          </g>

          <g
            data-part="head"
            data-origin={`0 ${s.head.pivotY}`}
            transform={`rotate(${pose.headTilt} 0 ${s.head.pivotY}) translate(${pose.headTurn + turn * -7} 0)`}
          >
            <path
              data-part="hair-back"
              data-origin={`${head.cx} ${head.cy}`}
              d={backHairPath(head, id === "sun" ? 0.55 : 0.95, 1.1)}
              fill={p.hairShade}
              stroke={p.ink}
              strokeWidth={s.stroke}
            />

            <ellipse cx={head.cx} cy={head.cy} rx={head.rx} ry={head.ry}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke} />
            <ellipse cx={head.cx - head.rx} cy={head.cy + 4} rx={4} ry={6}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke * 0.8} />
            <ellipse cx={head.cx + head.rx} cy={head.cy + 4} rx={4} ry={6}
              fill={p.skin} stroke={p.ink} strokeWidth={s.stroke * 0.8} />

            {c.markings && (
              <g data-part="markings" stroke={p.ink} strokeWidth={2.6} strokeLinecap="round" fill="none">
                <path d={`M${-head.rx * 0.82},${head.cy - 2} l-1,9`} />
                <path d={`M${-head.rx * 0.6},${head.cy - 1} l-1,9`} />
                <path d={`M${head.rx * 0.82},${head.cy - 2} l1,9`} />
                <path d={`M${head.rx * 0.6},${head.cy - 1} l1,9`} />
                <path d={`M${-10},${head.cy - head.ry * 0.78} l-3,7`} />
                <path d={`M${10},${head.cy - head.ry * 0.78} l3,7`} />
              </g>
            )}

            <g data-part="eyes">
              <Eye state={eye} x={-s.face.eyeX} y={s.face.eyeY} r={s.face.eyeR} p={p} />
              <Eye state={eye} x={s.face.eyeX} y={s.face.eyeY} r={s.face.eyeR} p={p} />
            </g>
            <Brows brow={brow} s={s} p={p} />
            <g data-part="mouth" transform={`translate(0 ${s.face.mouthY})`}>{mouthEl(p)}</g>

            <path
              data-part="hair-front"
              data-origin={`${head.cx} ${head.cy}`}
              d={hairPath(spikes, head, fringe, hairOpts)}
              fill={p.hair}
              stroke={p.ink}
              strokeWidth={s.stroke}
              strokeLinejoin="round"
            />
            {outfit === "beret" && (
              <path
                data-part="beret"
                d={`M${head.cx - head.rx * 1.05},${head.cy - head.ry * 0.62} Q${head.cx},${head.cy - head.ry * 2.0} ${head.cx + head.rx * 1.05},${head.cy - head.ry * 0.62} Z`}
                fill="#6B4A7A"
                stroke={p.ink}
                strokeWidth={s.stroke}
                strokeLinejoin="round"
              />
            )}
          </g>
        </g>

        {/* near arm, in front of the body */}
        <Arm side="R" shoulder={pose.shoulderR} elbow={pose.elbowR} s={s} p={p} sleeve={sleeve} markings={c.markings} />
      </g>
    </svg>
  );
}
