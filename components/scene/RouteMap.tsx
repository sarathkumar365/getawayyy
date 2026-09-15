"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { COMPASS, type Route } from "@/lib/scene/route";
import { ICON_LABEL, MapIcon } from "./MapIcons";

export type RouteMapProps = {
  route: Route;
  label?: string;
  className?: string;
};

const PAD = 0.16;
const K = 100;

/** Round the scale bar to something a person would say out loud. */
function niceKm(target: number): number {
  const steps = [5, 10, 20, 25, 50, 100, 150, 200, 300, 500];
  return steps.reduce((best, s) =>
    Math.abs(s - target) < Math.abs(best - target) ? s : best, steps[0] ?? 50);
}

/**
 * The route as a map you want to look at.
 *
 * Still honest — real coordinates, a real scale bar, and no coastline, because
 * there is no outline data here and drawing Georgian Bay from memory would
 * invent exactly what the rest of the build refuses to. What it adds is what a
 * map is actually for: each place shows what you DO there, and the road reads
 * as a road.
 */
export function RouteMap({ route, label, className }: RouteMapProps): JSX.Element {
  const path = useRef<SVGPathElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<number | null>(null);

  const xs = route.points.map((p) => p.x * K);
  const ys = route.points.map((p) => p.y * K);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  const padX = Math.max(16, spanY * PAD);
  const padY = Math.max(14, spanX * PAD);
  const x0 = Math.min(...xs) - padX;
  const y0 = Math.min(...ys) - padY;
  const W = spanX + padX * 2;
  const H = spanY + padY * 2;

  const px = (p: { x: number; y: number }): [number, number] => [p.x * K, p.y * K];

  const d = route.points
    .map((p, i) => {
      const [x, y] = px(p);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // scale bar
  const kmPerUnit = route.kmPerUnit / K;
  const barKm = niceKm(W * 0.3 * kmPerUnit);
  const barLen = kmPerUnit > 0 ? barKm / kmPerUnit : 0;

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

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        line.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)";
        line.style.strokeDashoffset = "0";
        box.dataset.drawn = "true";
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(box);
    return () => io.disconnect();
  }, [d]);

  const anyApprox = route.points.some((p) => p.approx);
  const kinds = [...new Set(route.points.map((p) => p.icon))].filter((k) => k !== "origin");
  const shown = focus !== null ? route.points[focus] : null;

  return (
    <figure ref={host} className={`routemap ${className ?? ""}`} data-drawn="false">
      <div className="routemap__paper">
        <svg viewBox={`${x0.toFixed(2)} ${y0.toFixed(2)} ${W.toFixed(2)} ${H.toFixed(2)}`}
          role="img"
          aria-label={`Route: Toronto to ${route.points[route.points.length - 1]?.name ?? "destination"}`}>
          <defs>
            <pattern id="rm-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10,0 L0,0 L0,10" fill="none" stroke="var(--map-grid)" strokeWidth={0.35} />
            </pattern>
          </defs>
          <rect x={x0} y={y0} width={W} height={H} fill="url(#rm-grid)" />

          {/* the road: a casing under a fill, which is what makes a line read as a road */}
          <path d={d} className="routemap__casing" fill="none" />
          <path ref={path} d={d} className="routemap__line" fill="none" />

          {route.points.map((p, i) => {
            const [x, y] = px(p);
            return (
              <g key={`${p.name}-${i}`} transform={`translate(${x} ${y})`}
                className="routemap__stop" style={{ animationDelay: `${0.3 + i * 0.09}s` }}
                onMouseEnter={() => setFocus(i)} onMouseLeave={() => setFocus(null)}
                onClick={() => setFocus(focus === i ? null : i)}>
                <circle r={6} fill="transparent" />
                <MapIcon kind={p.icon} />
                {p.label && (
                  /* beside the pin, not above it — stops on the same trip can be
                     30 km apart against a 160 km first leg, so labels stacked
                     above collide with the pin at the next place */
                  <text x={x > x0 + W * 0.6 ? -6.8 : 6.8} y={1.4}
                    textAnchor={x > x0 + W * 0.6 ? "end" : "start"}
                    className="routemap__name">
                    {p.name}{p.approx ? "*" : ""}
                  </text>
                )}
              </g>
            );
          })}

          {/* north arrow */}
          <g transform={`translate(${x0 + W - 9} ${y0 + 11})`} className="routemap__north">
            <path d="M0,-6.5 L2.6,3 L0,1.2 L-2.6,3 Z" />
            <text y={7.6} textAnchor="middle">N</text>
          </g>

          {/* scale bar */}
          {barLen > 0 && (
            <g transform={`translate(${x0 + 6} ${y0 + H - 7})`} className="routemap__scale">
              <path d={`M0,0 L${barLen.toFixed(1)},0 M0,-2.2 L0,2.2 M${barLen.toFixed(1)},-2.2 L${barLen.toFixed(1)},2.2`} />
              <text x={barLen / 2} y={-4} textAnchor="middle">{barKm} km</text>
            </g>
          )}
        </svg>
      </div>

      <figcaption>
        <span className="routemap__meta">
          {route.km > 0 && <b>{route.km.toLocaleString("en-CA")} km</b>}
          <span>{COMPASS(route.bearing)} · {Math.round(route.bearing)}°</span>
          <span>{route.points.length} places</span>
        </span>

        <span className="routemap__legend">
          {kinds.map((k) => (
            <span key={k} className="routemap__key">
              <svg viewBox="-7 -7 14 14" aria-hidden="true"><MapIcon kind={k} /></svg>
              {ICON_LABEL[k]}
            </span>
          ))}
        </span>

        <span className="routemap__honest">
          {shown
            ? `${shown.name}${shown.time ? ` · ${shown.time}` : ""}${shown.types.length ? ` · ${shown.types.join(", ")}` : ""}`
            : (label ?? "Real coordinates. No coastline — there is no outline data here, so none is drawn.")}
          {!shown && anyApprox && " * stands in for a nearby town."}
          {!shown && barLen > 0 && " Scale is straight-line; the road is longer."}
        </span>
      </figcaption>
    </figure>
  );
}
