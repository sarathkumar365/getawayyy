"use client";

import { useEffect, type JSX, type ReactNode } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll, wired to ScrollTrigger.
 *
 * This is the single largest contributor to the site feeling expensive on an
 * iPad, and also the easiest thing to get subtly wrong. Two rules:
 *
 *  1. ONE clock. Lenis is driven from `gsap.ticker`, not its own rAF loop, and
 *     `lagSmoothing(0)` is off so a dropped frame does not desync scroll from
 *     the animations pinned to it. The character rigs already run on this
 *     ticker, so everything on screen advances on the same tick.
 *  2. Reduced motion means NO interception. Smooth-scrolling someone who asked
 *     for less motion is worse than not smoothing at all — so we simply never
 *     construct Lenis, and native scrolling stays untouched.
 */
export function SmoothScroll({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      ScrollTrigger.refresh();
      return undefined;
    }

    const lenis = new Lenis({
      // Slightly longer than default: the journey is a slow read, not an app.
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      // Touch is left alone. iOS momentum scrolling is better than anything we
      // would synthesise, and hijacking it is what makes sites feel broken.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    setLenis(lenis);

    const raf = (time: number): void => { lenis.raf(time * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      setLenis(null);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
