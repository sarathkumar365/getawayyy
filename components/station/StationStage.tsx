"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Station } from "@/lib/scene/itinerary";
import { skyAtTime } from "@/lib/sky";

export type StationStageProps = {
  station: Station;
  /** scroll height, in viewport heights */
  pace?: number;
  /** the panel, and anything else that rides with it */
  children: ReactNode;
  /** scenery for the place itself, behind the panel */
  backdrop?: ReactNode;
  className?: string;
};

/** 0 before `a`, 1 after `b`, smoothly between. */
function ramp(t: number, a: number, b: number): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const k = (t - a) / (b - a);
  return k * k * (3 - 2 * k);
}

/**
 * Arriving somewhere.
 *
 * Three acts across one scroll range, on a sticky stage:
 *
 *   0 – 25%    approach: the place resolves, the panel rises
 *   25 – 75%   hold: the panel is parked and she reads
 *   75 – 100%  depart: the panel sinks and the walk resumes
 *
 * The panel's position is a FUNCTION of scroll, never an event. That is the
 * whole reason there is no open/close state to get stuck: scrolling back up
 * runs the same numbers backwards, so there is no animation to cancel and no
 * way to end up with a panel that should not be there.
 */
export function StationStage({
  station, pace = 3, children, backdrop, className,
}: StationStageProps): JSX.Element {
  const spacer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    if (!spacerEl || !stageEl) return undefined;

    const panel = stageEl.querySelector<HTMLElement>("[data-panel]");
    const place = stageEl.querySelector<HTMLElement>("[data-place]");
    const root = document.documentElement;
    const sky = skyAtTime(station.stop.time);

    const apply = (p: number): void => {
      const rise = ramp(p, 0, 0.25);
      const sink = ramp(p, 0.75, 1);
      const up = rise * (1 - sink);

      if (panel) {
        // translate, not height — height would reflow the panel's own layout on
        // every frame, and the content inside it can be long.
        panel.style.transform = `translate3d(0, ${((1 - up) * 100).toFixed(2)}%, 0)`;
        panel.style.opacity = up.toFixed(3);
        panel.style.pointerEvents = up > 0.9 ? "auto" : "none";
      }

      // The place itself settles as you arrive and is pushed back as the panel
      // takes the screen, so the panel reads as being in front of somewhere
      // rather than replacing it.
      if (place) {
        const s = 0.88 + rise * 0.12;
        place.style.transform = `translate3d(0, ${(up * -40).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        place.style.opacity = (0.35 + rise * 0.65 - up * 0.25).toFixed(3);
      }
    };

    // A station has ONE clock time, so the sky is set on entry and held. The
    // corridor writes these same properties while travelling; whichever ran
    // last owns them, which is correct — it is whichever the camera is in.
    const paintSky = (): void => {
      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: spacerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onEnter: paintSky,
      onEnterBack: paintSky,
    });

    return () => { st.kill(); };
  }, [station]);

  return (
    <div
      ref={spacer}
      className={`station ${className ?? ""}`}
      style={{ height: `${pace * 100}vh` }}
      id={station.id}
    >
      <div ref={stage} className="station__stage">
        {backdrop && <div className="station__place" data-place="">{backdrop}</div>}

        {/* data-lenis-prevent hands the wheel to this element's own scroll
            first, so a long panel scrolls internally instead of dragging the
            page onward while she is still reading. */}
        <div className="station__panel" data-panel="" data-lenis-prevent="">
          {children}
        </div>
      </div>
    </div>
  );
}
