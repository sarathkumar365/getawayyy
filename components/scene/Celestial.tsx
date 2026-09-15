"use client";

import { useEffect, useRef, type JSX } from "react";
import { gsap } from "gsap";

/**
 * Sun, moon and stars — positioned from `--sky-t`, the same value the sky
 * gradient already uses. One source of truth for time of day: if the file says
 * 18:00, the sun is low, and nobody had to place it there.
 *
 * `--sky-t` maps hour 6 → 0 and hour 21 → 1. Sunrise and sunset in lib/sky.ts
 * are 07:25 and 18:30, which land at 0.083 and 0.833 on that scale.
 */
const RISE = 0.083;
const SET = 0.833;

/** Sun altitude, 0 at the horizon and 1 at solar noon. Negative means it is down. */
function altitude(t: number): number {
  if (t <= RISE || t >= SET) return -1;
  return Math.sin((Math.PI * (t - RISE)) / (SET - RISE));
}

export function Celestial({ className }: { className?: string }): JSX.Element {
  const sun = useRef<SVGGElement>(null);
  const moon = useRef<SVGGElement>(null);
  const stars = useRef<SVGGElement>(null);
  const clouds = useRef<SVGGElement>(null);
  const shoot = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let lastT = -1;

    const place = (): void => {
      const t = Number.parseFloat(root.style.getPropertyValue("--sky-t") || "0.5");
      if (Number.isNaN(t) || Math.abs(t - lastT) < 0.0005) return;
      lastT = t;

      const alt = altitude(t);
      const up = alt > 0;

      if (sun.current) {
        // x tracks the day; y is the arc. 12 → 88 keeps it clear of the horizon line.
        const x = 6 + t * 88;
        const y = 78 - Math.max(0, alt) * 62;
        sun.current.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        sun.current.style.opacity = up ? String(Math.min(1, alt * 5 + 0.25)) : "0";
      }
      if (moon.current) {
        // The moon runs the opposite half of the same arc.
        const mt = t < 0.5 ? t + 0.5 : t - 0.5;
        const malt = altitude(mt);
        const x = 94 - mt * 88;
        const y = 78 - Math.max(0, malt) * 54;
        moon.current.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        moon.current.style.opacity = up ? "0" : "0.92";
      }
      if (stars.current) {
        stars.current.style.opacity = up ? "0" : String(Math.min(1, -alt * 1.6));
      }
      if (clouds.current) {
        // Cloud is only interesting when the sun is low enough to light it from
        // underneath. Overhead it is flat and grey, so it fades out at midday
        // and disappears entirely at night.
        const lit = up ? Math.max(0, 1 - Math.abs(alt - 0.16) / 0.42) : 0;
        clouds.current.style.opacity = (lit * 0.85).toFixed(3);
      }
    };

    /* ---- shooting stars ---- */
    // One at a time, on a long random interval. Two at once reads as a screensaver.
    let next = 3 + Math.random() * 7;
    let born = -99;
    let path = { x: 0, y: 0, dx: 0, dy: 0 };
    let clock = 0;
    const LIFE = 0.85;

    const streak = (dt: number): void => {
      const g = shoot.current;
      if (!g) return;
      clock += dt;
      const t = document.documentElement.style.getPropertyValue("--sky-t");
      const night = altitude(Number.parseFloat(t || "0.5")) <= 0;

      if (night && clock >= next) {
        born = clock;
        next = clock + 8 + Math.random() * 14;
        // always falling, always shallow — a steep one looks like a firework
        path = {
          x: 12 + Math.random() * 62,
          y: 6 + Math.random() * 22,
          dx: 14 + Math.random() * 16,
          dy: 7 + Math.random() * 7,
        };
      }

      const age = (clock - born) / LIFE;
      if (!night || age < 0 || age > 1) { g.style.opacity = "0"; return; }
      const e = age * age * (3 - 2 * age);              // ease so it does not start abruptly
      g.setAttribute("transform",
        `translate(${(path.x + path.dx * e).toFixed(2)} ${(path.y + path.dy * e).toFixed(2)}) ` +
        `rotate(${((Math.atan2(path.dy, path.dx) * 180) / Math.PI).toFixed(1)})`);
      // bright on arrival, gone by the end
      g.style.opacity = (Math.sin(Math.PI * age) * 0.9).toFixed(3);
    };

    const tick = (): void => {
      place();
      streak(gsap.ticker.deltaRatio(60) / 60);
    };

    place();
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); };
  }, []);

  return (
    <svg
      className={`celestial ${className ?? ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        {/* lit from below — which is the whole reason a sunset cloud is worth drawing */}
        <linearGradient id="cloudlit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-2, #E8B06B)" stopOpacity="0.55" />
          <stop offset="62%" stopColor="var(--sky-light, #FFC67D)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFE6C4" stopOpacity="1" />
        </linearGradient>
      </defs>

      <g ref={clouds} className="celestial__clouds" style={{ opacity: 0 }} fill="url(#cloudlit)">
        {CLOUDS.map((c, i) => (
          <g key={i} style={{ animationDelay: `${i * -37}s`, animationDuration: `${170 + i * 44}s` }}>
            <ellipse cx={c[0]} cy={c[1]} rx={c[2]} ry={c[3]} />
            <ellipse cx={c[0] - c[2] * 0.42} cy={c[1] + c[3] * 0.32} rx={c[2] * 0.58} ry={c[3] * 0.62} />
            <ellipse cx={c[0] + c[2] * 0.5} cy={c[1] + c[3] * 0.2} rx={c[2] * 0.44} ry={c[3] * 0.55} />
          </g>
        ))}
      </g>

      <g ref={stars} className="celestial__stars" style={{ opacity: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} fill="#FFF8E6"
            style={{ animationDelay: `${(i % 7) * 0.9}s` }} />
        ))}
      </g>

      <g ref={moon} style={{ opacity: 0 }}>
        {/* Waxing gibbous — which is what October 2026 actually offers.
            A crescent would be prettier and wrong. */}
        <circle r={3.1} fill="#F2EEDF" opacity={0.96} />
        <ellipse cx={-2.0} cy={-0.3} rx={2.2} ry={3.0} fill="var(--sky-1, #1C2436)" opacity={0.38} />
        <circle cx={0.9} cy={-1.0} r={0.5} fill="#DAD3C0" opacity={0.7} />
        <circle cx={-0.4} cy={1.2} r={0.7} fill="#DAD3C0" opacity={0.5} />
      </g>

      <g ref={shoot} className="celestial__shoot" style={{ opacity: 0 }}>
        <path d="M0,0 L-9,-1.1 L-9,1.1 Z" fill="#FFF8E6" opacity={0.55} />
        <circle r={0.42} fill="#FFFFFF" />
      </g>

      <g ref={sun} style={{ opacity: 0 }}>
        <circle r={7.5} fill="var(--sky-light, #FFC67D)" opacity={0.16} />
        <circle r={4.6} fill="var(--sky-light, #FFC67D)" opacity={0.3} />
        <circle r={2.7} fill="#FFF6E2" />
      </g>
    </svg>
  );
}

/**
 * Long, flat cloud banks — cx, cy, rx, ry. Wide and thin on purpose: the
 * streaked altocumulus you actually get over Ontario at sunset, not the
 * cauliflower shapes a cartoon reaches for.
 */
const CLOUDS: readonly [number, number, number, number][] = [
  [22, 30, 15, 1.9],
  [58, 22, 19, 1.6],
  [80, 36, 13, 2.2],
  [38, 44, 22, 1.7],
  [68, 52, 16, 2.0],
];

/** Fixed field, so the sky does not reshuffle itself on every render. */
const STARS: readonly [number, number, number][] = [
  [8, 12, 0.28], [15, 26, 0.2], [23, 7, 0.34], [31, 19, 0.22], [38, 31, 0.26],
  [44, 9, 0.3], [52, 22, 0.2], [58, 14, 0.36], [65, 29, 0.24], [71, 6, 0.28],
  [78, 20, 0.32], [84, 11, 0.22], [91, 27, 0.26], [12, 38, 0.2], [27, 42, 0.24],
  [49, 38, 0.22], [69, 41, 0.28], [88, 36, 0.2], [34, 15, 0.18], [61, 34, 0.18],
  [19, 33, 0.3], [75, 33, 0.2], [96, 17, 0.24], [4, 24, 0.22],
];
