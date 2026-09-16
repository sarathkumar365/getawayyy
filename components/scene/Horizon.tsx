import type { JSX } from "react";
import type { HorizonSpec } from "@/lib/scene/journeys/kit";

/**
 * The far country, behind everything.
 *
 * Props live in the corridor and are projected through the pinhole, which is
 * right for a tree eighty metres away and wrong for an escarpment eight
 * kilometres away: at that distance nothing changes size as you walk, it only
 * slides very slightly as the road bends. So the horizon is not a prop. It is a
 * band drawn across the back of the stage, moved a fraction of what the road
 * moves, which is what makes it read as far rather than as scenery.
 *
 * Each band is drawn behind the one before it and paler, because that is what
 * distance does to a ridge on a clear October morning.
 */

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A ridge across a 0–1000 box whose floor is y=100.
 *
 * Built from three sine waves rather than a random walk. A random walk with a
 * clamp gives a sawtooth — which is what the first cut of this looked like,
 * a row of identical spikes that read as a graph rather than as hills. Layered
 * waves at different frequencies give the long swell of a ridge with smaller
 * summits on it, which is what a range at eight kilometres actually does.
 *
 * `rough` mixes in the highest frequency: 0 is the rolling hardwood hills of
 * the Algonquin dome, 1 is a broken skyline.
 */
function ridge(seed: number, height: number, rough: number): string {
  const rnd = seeded(seed);
  const peak = 100 * height;
  // three waves, each with its own phase and wavelength
  const waves = [
    { k: 0.9 + rnd() * 0.5, p: rnd() * 6.28, a: 0.62 },
    { k: 2.3 + rnd() * 1.4, p: rnd() * 6.28, a: 0.26 + rough * 0.2 },
    { k: 5.5 + rnd() * 3.5, p: rnd() * 6.28, a: 0.06 + rough * 0.3 },
  ];
  const steps = 96;
  const pts: string[] = ["M-60,100"];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = -60 + 1120 * t;
    let n = 0;
    for (const wv of waves) n += wv.a * Math.sin(wv.k * t * 6.283 + wv.p);
    // 0 at the ends of the swing, 1 at its top; kept off the floor so the
    // ridge never disappears into the ground line
    const up = 0.34 + 0.66 * ((n + 1) / 2);
    pts.push(`L${x.toFixed(1)},${(100 - peak * up).toFixed(1)}`);
  }
  pts.push("L1060,100 Z");
  return pts.join(" ");
}

export function Horizon({ spec, seed }: { spec: HorizonSpec; seed: number }): JSX.Element {
  const bands = Math.max(1, spec.bands ?? 2);
  const tint = spec.tint ?? "#55635C";
  return (
    <svg
      className="corridor__horizon"
      data-horizon=""
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: bands }, (_, i) => {
        // furthest first, so the near ridge paints over it
        const k = (bands - 1 - i) / Math.max(1, bands - 1 || 1);
        return (
          <path
            key={i}
            d={ridge(seed + i * 977, spec.height * (1 - k * 0.38), spec.rough)}
            fill={tint}
            opacity={(0.26 + (1 - k) * 0.4).toFixed(2)}
          />
        );
      })}
    </svg>
  );
}
