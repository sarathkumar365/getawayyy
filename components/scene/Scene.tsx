"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type Layer = "celestial" | "weather" | "far" | "mid" | "near" | "ground";

/** How far each layer travels, as a multiple of the scene width. */
export const SPEED: Record<Layer, number> = {
  celestial: 0.05,
  weather: 0.1,
  far: 0.25,
  mid: 0.5,
  near: 0.85,
  ground: 1,
};

/**
 * The walking mechanic.
 *
 * Vertical scroll drives HORIZONTAL movement. That single inversion is what
 * makes scrolling read as walking rather than as reading — the world slides past
 * her at six different rates and she supplies the motion.
 *
 * Transforms are written straight to the elements from one ticker-free
 * ScrollTrigger callback. No React state, no re-render: a scroll tick costs six
 * style writes.
 */
export function Scene({
  children, className, travel = 1.1, trackId,
}: {
  children: ReactNode; className?: string; travel?: number;
  /**
   * Element whose scroll progress drives the walk. Defaults to the document.
   * It must NOT default to the scene itself: the scene is usually pinned to the
   * viewport, and a fixed element never moves relative to it, so its own
   * progress saturates at 1 the moment the page scrolls at all.
   */
  trackId?: string;
}): JSX.Element {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = host.current;
    if (!el) return undefined;

    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-layer]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = (p: number): void => {
      for (const node of layers) {
        const key = (node.dataset.layer ?? "mid") as Layer;
        const speed = SPEED[key] ?? 0.5;
        const x = -p * speed * travel * 100;
        node.style.transform = `translate3d(${x.toFixed(3)}%, 0, 0)`;
      }
    };

    apply(0);
    if (reduced) return undefined;

    const track = trackId ? document.getElementById(trackId) : document.body;
    if (!track) return undefined;

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });

    return () => { st.kill(); };
  }, [travel, trackId]);

  return <div ref={host} className={`scene-layers ${className ?? ""}`}>{children}</div>;
}

export function SceneLayer({
  layer, children, className, style,
}: {
  layer: Layer; children: ReactNode; className?: string;
  style?: React.CSSProperties;
}): JSX.Element {
  return (
    <div data-layer={layer} className={`scene-layer scene-layer--${layer} ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
