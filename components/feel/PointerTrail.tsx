"use client";

import { useEffect, useRef, type JSX } from "react";
import { gsap } from "gsap";

export type PointerTrailProps = {
  /** Which pointer types leave a mark. Touch is off by default — a finger on an
   *  iPad is scrolling, and trailing every scroll turns the page into a scribble. */
  accept?: readonly ("pen" | "mouse" | "touch")[];
  /** How long a mark survives, in ms. */
  life?: number;
  /** Max stroke width in CSS pixels, at full pressure. */
  weight?: number;
  className?: string;
};

type Mark = { x: number; y: number; p: number; t: number };

const DEFAULT_ACCEPT = ["pen", "mouse"] as const;

/**
 * The Pencil trail.
 *
 * Pointer Events hand us `pressure` and tilt for free on an Apple Pencil, so the
 * stroke can behave like ink rather than like a cursor: heavier when pressed,
 * thinner when moving fast, and tapering to nothing as it fades.
 *
 * Redrawn from scratch each frame rather than composited with a translucent
 * "fade" rect. The fade-rect trick is cheaper but leaves grey residue that never
 * fully clears — visible immediately on a dark sky.
 */
export function PointerTrail({
  accept = DEFAULT_ACCEPT, life = 900, weight = 7, className,
}: PointerTrailProps): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const ok = new Set<string>(accept);
    let marks: Mark[] = [];
    let dpr = 1;

    const resize = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colour = (): string => {
      const s = getComputedStyle(document.documentElement);
      return (
        s.getPropertyValue("--trail").trim() ||
        s.getPropertyValue("--sky-light").trim() ||
        "#FF7A2F"
      );
    };

    const onMove = (e: PointerEvent): void => {
      if (!ok.has(e.pointerType)) return;
      // Pressure is 0 for a hovering pen and 0.5 for a mouse that has no sensor.
      const pressure = e.pressure > 0 ? e.pressure : e.pointerType === "pen" ? 0.18 : 0.5;
      // Tilt, when present, thins the mark as the pen lies flatter — the same
      // way a real nib loses contact area.
      const tilt = Math.min(1, Math.hypot(e.tiltX, e.tiltY) / 90);
      const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
      const now = performance.now();
      for (const c of events.length > 0 ? events : [e]) {
        marks.push({ x: c.clientX, y: c.clientY, p: pressure * (1 - tilt * 0.35), t: now });
      }
      if (marks.length > 600) marks = marks.slice(-600);
    };

    const draw = (): void => {
      const now = performance.now();
      marks = marks.filter((m) => now - m.t < life);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (marks.length < 2) return;

      const stroke = colour();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = stroke;

      for (let i = 1; i < marks.length; i += 1) {
        const a = marks[i - 1];
        const b = marks[i];
        if (!a || !b) continue;
        const age = (now - b.t) / life;
        if (age >= 1) continue;
        // speed thins the line, the way ink does when you move fast
        const speed = Math.min(1, Math.hypot(b.x - a.x, b.y - a.y) / 34);
        const fade = 1 - age;
        ctx.globalAlpha = fade * fade * 0.85;
        ctx.lineWidth = Math.max(0.4, weight * b.p * fade * (1 - speed * 0.55));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        // curve through the midpoint so the polyline never shows its corners
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.quadraticCurveTo(a.x, a.y, mx, my);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    gsap.ticker.add(draw);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(draw);
    };
  }, [accept, life, weight]);

  return <canvas ref={ref} className={`trail ${className ?? ""}`} aria-hidden="true" />;
}
