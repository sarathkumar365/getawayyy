"use client";

import { useEffect, useRef, type JSX } from "react";
import { gsap } from "gsap";

export type RainProps = {
  /**
   * Wet-day rate, 0–1. Muskoka's October figure is 0.48 — the highest of the
   * five, and the only one that earns real rain. This is not a dial someone
   * turned for mood; it is the number from the archive pass.
   */
  intensity: number;
  className?: string;
};

type Drop = { x: number; y: number; len: number; v: number; a: number };
type Bead = { x: number; y: number; r: number; born: number; life: number };

const SLANT = 0.22;

/**
 * Rain, in two planes.
 *
 * Falling streaks in the middle distance, and beads on the glass in front —
 * which is the part that sells it. Rain without anything at the camera plane
 * reads as scratches on the film.
 */
export function Rain({ intensity, className }: RainProps): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let dpr = 1;
    let W = 0;
    let H = 0;
    const resize = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const k = Math.min(1, Math.max(0, intensity));
    const count = Math.round(70 + k * 220);
    const drops: Drop[] = Array.from({ length: count }, () => ({
      x: Math.random() * (W + 200) - 100,
      y: Math.random() * H,
      len: 9 + Math.random() * 20,
      v: 620 + Math.random() * 520,
      a: 0.16 + Math.random() * 0.3,
    }));

    let beads: Bead[] = [];
    let last = performance.now();

    const tick = (): void => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      ctx.clearRect(0, 0, W, H);

      ctx.lineCap = "round";
      ctx.strokeStyle = "#CFE0EA";
      for (const d of drops) {
        d.y += d.v * dt;
        d.x += d.v * SLANT * dt;
        if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 200) - 100; }
        ctx.globalAlpha = d.a;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * SLANT, d.y - d.len);
        ctx.stroke();
      }

      // glass
      if (Math.random() < k * 0.55) {
        beads.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.85,
          r: 1.6 + Math.random() * 3.4,
          born: now,
          life: 2400 + Math.random() * 3200,
        });
      }
      beads = beads.filter((b) => now - b.born < b.life);
      for (const b of beads) {
        const age = (now - b.born) / b.life;
        // heavy beads run once they have sat a moment
        const slip = age > 0.45 ? (age - 0.45) ** 2 * 190 * (b.r / 4) : 0;
        ctx.globalAlpha = (1 - age) * 0.32;
        ctx.fillStyle = "#E4EFF5";
        ctx.beginPath();
        ctx.arc(b.x, b.y + slip, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = (1 - age) * 0.5;
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y + slip - b.r * 0.3, b.r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    window.addEventListener("resize", resize);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(tick);
    };
  }, [intensity]);

  return <canvas ref={ref} className={`rain ${className ?? ""}`} aria-hidden="true" />;
}
