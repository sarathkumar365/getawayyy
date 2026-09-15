"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LENS, beatAlpha, clockAt, project, sortForPaint, type Leg } from "@/lib/scene/corridor";
import { makePath, STRAIGHT } from "@/lib/scene/path";
import { skyAtTime } from "@/lib/sky";
import { CORRIDOR_KINDS } from "./corridorKinds";

export type CorridorProps = {
  leg: Leg;
  /** scroll height, in viewport heights */
  pace?: number;
  onMoving?: (moving: boolean) => void;
  children?: ReactNode;
  className?: string;
};

function luma(hex: string): number {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  const body = m?.[1];
  if (!body) return 0.5;
  const n = Number.parseInt(body, 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0);
}

const mix = (a: readonly number[], b: readonly number[], t: number): string => {
  const v = (i: number): number => Math.round((a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t);
  return `rgb(${v(0)} ${v(1)} ${v(2)})`;
};

const INK_LIGHT = [22, 25, 31] as const;
const INK_DARK = [244, 240, 232] as const;
const DIM_LIGHT = [61, 68, 80] as const;
const DIM_DARK = [198, 199, 206] as const;

/**
 * Walks one leg of the journey.
 *
 * Nothing here re-renders while scrolling. The scroll callback projects every
 * billboard and writes its transform directly — a few hundred style writes a
 * frame, which is far cheaper than a React pass and keeps the camera exactly in
 * step with the scroll rather than a frame behind it.
 */
export function Corridor({
  leg, pace = 9, onMoving, children, className,
}: CorridorProps): JSX.Element {
  const spacer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const painted = sortForPaint(leg.items);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    if (!spacerEl || !stageEl) return undefined;

    const nodes = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-prop]"));
    const beatEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-beat]"));
    const rail = stageEl.querySelector<HTMLElement>("[data-rail]");
    const road = stageEl.querySelector<SVGPathElement>("[data-road]");
    const shoulder = stageEl.querySelector<SVGPathElement>("[data-shoulder]");
    const clockEl = stageEl.querySelector<HTMLElement>("[data-clock]");
    const root = document.documentElement;

    let wasMoving = false;
    let stopTimer: number | null = null;
    const path = leg.path && leg.path.length > 1 ? makePath(leg.path, leg.depth) : STRAIGHT;
    const cast = stageEl.querySelector<HTMLElement>("[data-cast]");

    let w = stageEl.clientWidth;
    let h = stageEl.clientHeight;
    const size = (): void => { w = stageEl.clientWidth; h = stageEl.clientHeight; };
    size();

    /**
     * The road surface, rebuilt each frame from the same curve the props use.
     *
     * Without this the markings bend while the tarmac stays a straight block,
     * which reads as the road sliding sideways underneath itself. Sampling the
     * edges and filling between them is what makes the bend look like a bend.
     */
    const ribbon = (cam: number, halfW: number): string => {
      const STEPS = 26;
      const left: string[] = [];
      const right: string[] = [];
      for (let i = 0; i <= STEPS; i += 1) {
        // sample denser up close, where the curvature actually shows
        const t = (i / STEPS) ** 1.9;
        const d = 8 + t * (LENS.far - 8);
        const z = cam + d;
        const scale = LENS.focal / (LENS.focal + d);
        const relX = path.bend(z) - path.bend(cam);
        const relRise = path.rise(z) - path.rise(cam);
        const y = h * LENS.horizon + h * LENS.ground * scale - relRise * scale;
        left.push(`${(w / 2 + (relX - halfW) * scale).toFixed(1)},${y.toFixed(1)}`);
        right.push(`${(w / 2 + (relX + halfW) * scale).toFixed(1)},${y.toFixed(1)}`);
      }
      return `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
    };

    const apply = (p: number): void => {
      const cam = p * leg.depth;
      if (road) road.setAttribute("d", ribbon(cam, 250));
      if (shoulder) shoulder.setAttribute("d", ribbon(cam, 340));

      for (const node of nodes) {
        const z = Number(node.dataset.z ?? 0);
        const x = Number(node.dataset.x ?? 0);
        const y = Number(node.dataset.y ?? 0);
        const s = Number(node.dataset.s ?? 1);
        const pr = project({ z, x, y, kind: "", s }, cam, w, h, LENS, path);
        if (!pr.visible || pr.opacity <= 0.004) {
          if (node.style.display !== "none") node.style.display = "none";
          continue;
        }
        if (node.style.display === "none") node.style.display = "";
        node.style.transform =
          `translate3d(${pr.left.toFixed(1)}px, ${pr.base.toFixed(1)}px, 0) ` +
          `translate(-50%, -100%) scale(${(pr.scale * s).toFixed(4)})`;
        node.style.opacity = pr.opacity.toFixed(3);
      }

      for (const node of beatEls) {
        const bz = Number(node.dataset.z ?? 0);
        const hold = Number(node.dataset.hold ?? 420);
        const a = beatAlpha({ z: bz, hold, voice: "narrate", text: "" }, cam);
        node.style.opacity = a.toFixed(3);
        node.style.transform = `translateY(${((1 - a) * 16).toFixed(1)}px)`;
        node.style.pointerEvents = a > 0.5 ? "auto" : "none";
      }

      /* The cast walks a little way ahead, so on a bend they are already into it
         while the camera is still straightening — which is what following
         someone round a corner actually looks like. */
      if (cast) {
        const lead = 170;
        const shift = (path.bend(cam + lead) - path.bend(cam)) * (LENS.focal / (LENS.focal + lead));
        cast.style.transform = `translateX(${shift.toFixed(1)}px)`;
      }

      if (rail) rail.style.width = `${(p * 100).toFixed(2)}%`;
      const time = clockAt(leg, cam);
      if (clockEl) clockEl.textContent = time;

      const sky = skyAtTime(time);
      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));
      const dark = 1 - Math.min(1, Math.max(0, (luma(sky.gradient[1]) - 0.06) / 0.34));
      root.style.setProperty("--on-sky", mix(INK_LIGHT, INK_DARK, dark));
      root.style.setProperty("--on-sky-2", mix(DIM_LIGHT, DIM_DARK, dark));
      root.style.setProperty("--on-sky-3", mix(INK_LIGHT, INK_DARK, dark));

      if (!wasMoving) { wasMoving = true; onMoving?.(true); }
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => { wasMoving = false; onMoving?.(false); }, 160);
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: spacerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });

    const onResize = (): void => { size(); apply(st.progress); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      st.kill();
    };
  }, [leg, onMoving]);

  return (
    <div ref={spacer} className={`corridor ${className ?? ""}`} style={{ height: `${pace * 100}vh` }}>
      <div ref={stage} className="corridor__stage">
        <div className="corridor__ground" />
        <svg className="corridor__surface" aria-hidden="true">
          <path data-shoulder="" className="corridor__shoulder" />
          <path data-road="" className="corridor__tarmac" />
        </svg>

        <div className="corridor__world">
          {painted.map((it, i) => (
            <div
              key={`${it.kind}-${i}`}
              data-prop=""
              data-z={it.z}
              data-x={it.x}
              data-y={it.y ?? 0}
              data-s={it.s ?? 1}
              className="prop"
              style={{ opacity: 0 }}
            >
              {CORRIDOR_KINDS[it.kind]?.(it) ?? null}
            </div>
          ))}
        </div>

        {children}

        <div className="corridor__script">
          {leg.beats.map((b, i) => (
            <p key={i} data-beat="" data-z={b.z} data-hold={b.hold ?? 420}
              className={`beat beat--${b.voice}`} style={{ opacity: 0 }}>
              {b.voice !== "narrate" && (
                <span className="beat__who">{b.voice === "sun" ? "A" : "B"}</span>
              )}
              <span className="beat__t">{b.text}</span>
            </p>
          ))}
        </div>

        {leg.title && <p className="corridor__title">{leg.title}</p>}
        <div className="corridor__clock" data-clock="" />
        <div className="corridor__rail"><i data-rail="" style={{ width: "0%" }} /></div>
      </div>
    </div>
  );
}
