"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RATE, beatAlpha, clockAt, type Layer, type Strip } from "@/lib/scene/strip";
import { skyFor } from "@/lib/sky";

export type WalkProps = {
  strip: Strip;
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
export function Walk({ strip, scale = 1, pace = 8, children, className }: WalkProps): JSX.Element {
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
      const sky = skyFor(time);
      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));
      if (sky.scheme !== lastScheme) {
        lastScheme = sky.scheme;
        root.setAttribute("data-sky-scheme", sky.scheme);
      }
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: spacerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });

    return () => {
      st.kill();
      ["--sky-1", "--sky-2", "--sky-3", "--sky-light", "--sky-t"]
        .forEach((v) => root.style.removeProperty(v));
      root.removeAttribute("data-sky-scheme");
    };
  }, [strip, scale]);

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
