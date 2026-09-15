"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RATE, beatAlpha, clockAt, type Layer, type Strip } from "@/lib/scene/strip";
import { skyAtTime } from "@/lib/sky";

/** sRGB relative luminance, 0 (black) to 1 (white). */
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

function mix(a: readonly number[], b: readonly number[], t: number): string {
  const v = (i: number): number =>
    Math.round((a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t);
  return `rgb(${v(0)} ${v(1)} ${v(2)})`;
}

const INK_ON_LIGHT = [22, 25, 31] as const;
const INK_ON_DARK = [244, 240, 232] as const;
const DIM_ON_LIGHT = [61, 68, 80] as const;
const DIM_ON_DARK = [198, 199, 206] as const;
const ROAD_LIGHT = [[92, 100, 114], [62, 69, 82]] as const;
const ROAD_DARK = [[35, 43, 54], [23, 29, 38]] as const;

export type WalkProps = {
  strip: Strip;
  /** fires when she starts and stops scrolling — drives the walk cycle */
  onMoving?: (moving: boolean) => void;
  /** px per strip unit */
  scale?: number;
  /** how many viewport heights of scroll the whole walk takes */
  pace?: number;
  children: ReactNode;
  className?: string;
};

/**
 * Walks a strip.
 *
 * The stage is sticky and full-height; the scroll happens in a tall spacer
 * behind it. Scrolling therefore does not move the page, it moves the WORLD —
 * every layer translates left at its own rate, and the narration is anchored to
 * positions on the same axis as the scenery.
 *
 * That shared axis is the whole point. "Then the last of the streetlights" is
 * not a caption for a scene; it is pinned to the x where the last streetlight
 * actually leaves the frame.
 */
export function Walk({ strip, scale = 1, pace = 8, onMoving, children, className }: WalkProps): JSX.Element {
  const spacer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    if (!spacerEl || !stageEl) return undefined;

    const layers = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-layer]"));
    const beatEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-beat]"));
    const rail = stageEl.querySelector<HTMLElement>("[data-rail]");
    const clock = stageEl.querySelector<HTMLElement>("[data-clock]");
    const root = document.documentElement;
    let lastScheme = "";
    let wasMoving = false;
    let stopTimer: number | null = null;

    const apply = (p: number): void => {
      const x = p * strip.width;

      for (const node of layers) {
        const key = (node.dataset.layer ?? "mid") as Layer;
        const rate = RATE[key] ?? 0.5;
        node.style.transform = `translate3d(${(-x * rate * scale).toFixed(1)}px,0,0)`;
      }

      for (const node of beatEls) {
        const bx = Number(node.dataset.x ?? 0);
        const hold = Number(node.dataset.hold ?? 520);
        const a = beatAlpha({ x: bx, hold, voice: "narrate", text: "" }, x);
        node.style.opacity = a.toFixed(3);
        // a small lift as it arrives, so lines do not simply blink on
        node.style.transform = `translateY(${((1 - a) * 14).toFixed(1)}px)`;
        node.style.pointerEvents = a > 0.5 ? "auto" : "none";
      }

      if (rail) rail.style.width = `${(p * 100).toFixed(2)}%`;
      const time = clockAt(strip, x);
      if (clock) clock.textContent = time;

      // the sky follows the walk, from the clock anchors on the strip
      const sky = skyAtTime(time);
      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));

      /**
       * Contrast is CONTINUOUS, not a switch.
       *
       * `scheme` is a boolean, so every colour keyed to it snapped at the exact
       * moment dusk became night — text, the road, all of it flicked in one
       * frame. Interpolating against the sky's own luminance means the page
       * darkens at the same rate the sky does, and nothing jumps.
       */
      const dark = 1 - Math.min(1, Math.max(0, (luma(sky.gradient[1]) - 0.06) / 0.34));
      root.style.setProperty("--on-sky", mix(INK_ON_LIGHT, INK_ON_DARK, dark));
      root.style.setProperty("--on-sky-2", mix(DIM_ON_LIGHT, DIM_ON_DARK, dark));
      root.style.setProperty("--road-1", mix(ROAD_LIGHT[0], ROAD_DARK[0], dark));
      root.style.setProperty("--road-2", mix(ROAD_LIGHT[1], ROAD_DARK[1], dark));
      root.style.setProperty("--on-sky-3", mix(INK_ON_LIGHT, INK_ON_DARK, dark));

      if (sky.scheme !== lastScheme) {
        lastScheme = sky.scheme;
        root.setAttribute("data-sky-scheme", sky.scheme);
      }

      /**
       * Walking is her gesture: they move while she scrolls and stop when she
       * does. The stop has to come from a timer, not from a speed test — this
       * callback only runs WHILE scrolling, so when she lets go there is no
       * further tick to notice that she has.
       */
      if (!wasMoving) {
        wasMoving = true;
        onMoving?.(true);
      }
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        wasMoving = false;
        onMoving?.(false);
      }, 160);
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: spacerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });

    return () => {
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      st.kill();
      ["--sky-1", "--sky-2", "--sky-3", "--sky-light", "--sky-t"]
        .forEach((v) => root.style.removeProperty(v));
      root.removeAttribute("data-sky-scheme");
    };
  }, [strip, scale, onMoving]);

  return (
    <div ref={spacer} className={`walk ${className ?? ""}`} style={{ height: `${pace * 100}vh` }}>
      <div ref={stage} className="walk__stage">
        {children}
        <div className="walk__script">
          {strip.beats.map((b, i) => (
            <p
              key={i}
              data-beat=""
              data-x={b.x}
              data-hold={b.hold ?? 520}
              className={`beat beat--${b.voice}`}
              style={{ opacity: 0 }}
            >
              {b.voice !== "narrate" && (
                <span className="beat__who">{b.voice === "sun" ? "A" : "B"}</span>
              )}
              <span className="beat__t">{b.text}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WalkLayer({
  layer, width, height, baseline, children, className,
}: {
  layer: Layer; width: number; height: number; baseline: string;
  children: ReactNode; className?: string;
}): JSX.Element {
  return (
    <div data-layer={layer} className={`walk__layer walk__layer--${layer} ${className ?? ""}`}
      style={{ bottom: baseline }}>
      <svg viewBox={`0 ${-height} ${width} ${height}`} width={width} height={height}
        style={{ overflow: "visible" }} aria-hidden="true">
        {children}
      </svg>
    </div>
  );
}
