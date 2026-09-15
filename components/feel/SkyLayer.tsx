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
export function SkyLayer({ times, targetId, className }: SkyLayerProps): JSX.Element {
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

    const at = (p: number): Sky => {
      if (skies.length === 1) return skies[0] as Sky;
      const span = (skies.length - 1) * Math.min(1, Math.max(0, p));
      const i = Math.min(skies.length - 2, Math.floor(span));
      const a = skies[i];
      const b = skies[i + 1];
      if (!a || !b) return skies[0] as Sky;
      return mixSky(a, b, span - i);
    };

    write(at(0));

    const target = targetId ? document.getElementById(targetId) : document.body;
    if (!target) return undefined;

    const st = ScrollTrigger.create({
      trigger: target,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { write(at(self.progress)); },
    });

    return () => {
      st.kill();
      ["--sky-1", "--sky-2", "--sky-3", "--sky-light", "--sky-t"]
        .forEach((v) => root.style.removeProperty(v));
      root.removeAttribute("data-sky-scheme");
    };
  }, [times, targetId]);

  return <div ref={ref} className={`sky ${className ?? ""}`} aria-hidden="true" />;
}
