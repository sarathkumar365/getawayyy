"use client";

import type { JSX } from "react";

export type FlockProps = {
  /** vertical position as a percentage of the scene height */
  top?: number;
  /** seconds to cross the screen */
  duration?: number;
  /** delay before the first crossing */
  delay?: number;
  count?: number;
  /** "south" is screen-right on the north trips — the way she is NOT going */
  direction?: "right" | "left";
  className?: string;
};

/**
 * Canada geese, flying south.
 *
 * October at these latitudes is migration, and all five trips sit under a
 * flyway — so this is the same kind of fact as the fall colour, not decoration.
 * They always head south, which on the north trips is the direction she is not
 * travelling.
 *
 * The V is deliberately uneven and each bird beats on its own offset; a tidy
 * V beating in unison reads as a logo.
 */
export function Flock({
  top = 22, duration = 42, delay = 0, count = 7, direction = "right", className,
}: FlockProps): JSX.Element {
  const birds = Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const rank = Math.ceil(i / 2);
    return {
      x: rank * 3.4,
      y: side * rank * 1.5 + (i % 3) * 0.35,
      scale: 1 - rank * 0.07,
      beat: 0.62 + (i % 4) * 0.11,
      delay: (i % 5) * 0.14,
    };
  });

  return (
    <div
      className={`flock flock--${direction} ${className ?? ""}`}
      style={{
        top: `${top}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
      aria-hidden="true"
    >
      <svg viewBox="-4 -10 34 20" className="flock__svg">
        {birds.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.scale})`}>
            <path
              className="flock__bird"
              d="M-1.5,0 Q-0.75,-1.1 0,-0.15 Q0.75,-1.1 1.5,0"
              style={{ animationDuration: `${b.beat}s`, animationDelay: `${b.delay}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
