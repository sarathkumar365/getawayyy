"use client";

import { useEffect, useRef, type JSX } from "react";
import { COMPASS, type Route } from "@/lib/scene/route";

export type RouteMapProps = {
  route: Route;
  /** shown under the diagram */
  label?: string;
  className?: string;
};

const PAD = 0.14;

/**
 * The route, drawn from real coordinates.
 *
 * It traces itself from Toronto outward, dots landing as the line reaches them,
 * because a route is a thing that happens in an order and a map that appears all
 * at once throws that away.
 *
 * There is no coastline here on purpose — see lib/scene/route.ts. The caption
 * says so rather than hoping nobody notices.
 */
export function RouteMap({ route, label, className }: RouteMapProps): JSX.Element {
  const path = useRef<SVGPathElement>(null);
  const host = useRef<HTMLDivElement>(null);

  /**
   * Crop to the route's own bounds at a 1:1 scale.
   *
   * The points already share one scale so direction is true; a fixed square
   * frame would just leave a north-south trip as a thin line in a wide empty
   * box. Cropping keeps the honesty and uses the space.
   */
  const K = 100;
  const xs = route.points.map((p) => p.x * K);
  const ys = route.points.map((p) => p.y * K);
  const padX = Math.max(14, (Math.max(...ys) - Math.min(...ys)) * PAD);
  const padY = Math.max(10, (Math.max(...xs) - Math.min(...xs)) * PAD);
  const x0 = Math.min(...xs) - padX;
  const y0 = Math.min(...ys) - padY;
  const W = Math.max(...xs) - Math.min(...xs) + padX * 2;
  const H = Math.max(...ys) - Math.min(...ys) + padY * 2;

  const px = (p: { x: number; y: number }): [number, number] => [p.x * K, p.y * K];

  const d = route.points
    .map((p, i) => {
      const [x, y] = px(p);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  useEffect(() => {
    const line = path.current;
    const box = host.current;
    if (!line || !box) return undefined;

    const len = line.getTotalLength();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = reduced ? "0" : `${len}`;
    box.dataset.drawn = reduced ? "true" : "false";

    if (reduced) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          line.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)";
          line.style.strokeDashoffset = "0";
          box.dataset.drawn = "true";
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [d]);

  const anyApprox = route.points.some((p) => p.approx);

  return (
    <figure ref={host} className={`routemap ${className ?? ""}`} data-drawn="false">
      <svg viewBox={`${x0.toFixed(2)} ${y0.toFixed(2)} ${W.toFixed(2)} ${H.toFixed(2)}`} role="img"
        aria-label={`Route diagram: Toronto to ${route.points[route.points.length - 1]?.name ?? "destination"}`}>
        <path ref={path} d={d} className="routemap__line" fill="none" />

        {route.points.map((p, i) => {
          const [x, y] = px(p);
          const first = i === 0;
          return (
            <g key={`${p.name}-${i}`} style={{ animationDelay: `${0.25 + i * 0.085}s` }}
              className="routemap__stop">
              <circle cx={x} cy={y} r={first ? 2.6 : p.base ? 2.2 : 1.3}
                className={first ? "is-origin" : p.base ? "is-base" : "is-stop"} />
              {(first || p.label) && (
                <text x={x} y={y - 4.2} textAnchor="middle" className="routemap__name">
                  {p.name}{p.approx ? "*" : ""}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <figcaption>
        <span className="routemap__meta">
          {route.km > 0 && <b>{route.km.toLocaleString("en-CA")} km</b>}
          <span>{COMPASS(route.bearing)} · {Math.round(route.bearing)}°</span>
          <span>{route.points.length} places</span>
        </span>
        <span className="routemap__honest">
          {label ?? "Route diagram — real coordinates, no coastline drawn."}
          {anyApprox && " * stands in for a nearby town."}
        </span>
      </figcaption>
    </figure>
  );
}
