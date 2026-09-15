"use client";

import { useEffect, useRef, type JSX } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mixSky, skyFor, type Sky } from "@/lib/sky";

export type SkyLayerProps = {
  /** Each stop's real clock time, in journey order. `null` keeps the previous sky. */
  times: readonly (string | null)[];
  /** Scroll container to track. Defaults to the whole document. */
  targetId?: string;
  /**
   * Selector for the stop sections, in the same order as `times`.
   *
   * Without this the sky splits the page into equal slices, which silently
   * desyncs: a header and a trailing section are enough to put mid-afternoon
   * light on the 22:15 night walk. With it, each stop's sky is exact when that
   * stop is centred, and interpolated in between.
   */
  sectionSelector?: string;
  className?: string;
};

/**
 * The sky, driven by scroll position.
 *
 * Times come from the stops themselves, so the light moves the way the real day
 * would: a 07:30 breakfast stop is at dawn and a 17:00 lookout is in golden
 * hour, because that is what the file says.
 *
 * Nothing here re-renders. The scroll handler writes CSS custom properties on
 * the root element and every themed surface reads them, so one scroll tick costs
 * six string assignments rather than a React pass.
 */
export function SkyLayer({
  times, targetId, sectionSelector, className,
}: SkyLayerProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;

    const skies: Sky[] = times.length > 0
      ? times.map((t) => skyFor(t))
      : [skyFor(null)];

    let lastScheme = "";
    const write = (sky: Sky): void => {
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

    /** Document-Y at which each stop's sky should be exactly right. */
    let anchors: number[] = [];
    const measure = (): void => {
      if (!sectionSelector) { anchors = []; return; }
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(sectionSelector));
      anchors = nodes.slice(0, skies.length).map((n) => {
        const r = n.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
    };
    measure();

    const byFraction = (p: number): Sky => {
      if (skies.length === 1) return skies[0] as Sky;
      const span = (skies.length - 1) * Math.min(1, Math.max(0, p));
      const i = Math.min(skies.length - 2, Math.floor(span));
      const a = skies[i];
      const b = skies[i + 1];
      if (!a || !b) return skies[0] as Sky;
      return mixSky(a, b, span - i);
    };

    /** Sky at the viewport centre, interpolated between the two nearest stops. */
    const byAnchor = (): Sky | null => {
      if (anchors.length < 2) return null;
      const eye = window.scrollY + window.innerHeight / 2;
      const first = anchors[0] ?? 0;
      const last = anchors[anchors.length - 1] ?? 0;
      if (eye <= first) return skies[0] ?? null;
      if (eye >= last) return skies[anchors.length - 1] ?? null;
      for (let i = 0; i < anchors.length - 1; i += 1) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (a === undefined || b === undefined) continue;
        if (eye >= a && eye <= b) {
          const sa = skies[i];
          const sb = skies[i + 1];
          if (!sa || !sb) return null;
          return mixSky(sa, sb, b === a ? 0 : (eye - a) / (b - a));
        }
      }
      return null;
    };

    const update = (p: number): void => { write(byAnchor() ?? byFraction(p)); };
    update(0);

    const target = targetId ? document.getElementById(targetId) : document.body;
    if (!target) return undefined;

    const st = ScrollTrigger.create({
      trigger: target,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { update(self.progress); },
    });

    const onResize = (): void => { measure(); update(st.progress); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
      ["--sky-1", "--sky-2", "--sky-3", "--sky-light", "--sky-t"]
        .forEach((v) => root.style.removeProperty(v));
      root.removeAttribute("data-sky-scheme");
    };
  }, [times, targetId, sectionSelector]);

  return <div ref={ref} className={`sky ${className ?? ""}`} aria-hidden="true" />;
}
