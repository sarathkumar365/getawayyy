"use client";

import type { JSX } from "react";
import type { TripMapModel } from "@/lib/scene/tripmap";

const SERIF = "var(--font-display), Georgia, serif";
const MONO = "var(--font-mono), monospace";
const SANS = "var(--font-body), sans-serif";

/** The drawing box, in the same ink and paper as Muskoka's hand-drawn one.
    SQUARE, and it has to be: the projection puts the longer of the two spans
    on 0–1 and centres the shorter one, so both axes share a scale. A taller
    box than it is wide stretches north-south and the route stops being true. */
const W = 520;
const H = 520;
const PAD = 76;

/** Round the scale bar to something a person would say out loud. */
function niceKm(target: number): number {
  const steps = [2, 5, 10, 20, 25, 50, 100, 150, 200];
  return steps.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), 50);
}

/**
 * A trip's map, drawn from its own coordinates.
 *
 * Real towns in their real positions relative to each other, one line per day
 * in the day's own ink, north up, a true scale bar, and an arrow pointing the
 * real way home with the real distance on it. No shoreline, no roads that
 * bend: there is no outline data in this project and sketching one from memory
 * would invent exactly what the rest of the build refuses to.
 */
export function PlotMap({ model }: { model: TripMapModel }): JSX.Element {
  const px = (x: number): number => PAD + x * (W - PAD * 2);
  const py = (y: number): number => PAD + y * (H - PAD * 2);

  /* A projected length of 1 spans the whole box and stands for `kmPerUnit` km,
     so a bar across a third of the box is a third of that. */
  const unit = W - PAD * 2;
  const barKm = niceKm(model.kmPerUnit * 0.3);
  const barLen = model.kmPerUnit > 0 ? (barKm / model.kmPerUnit) * unit : 0;

  /* The way home, as an arrow off the bottom edge rather than a dot: Toronto is
     off the map at this scale on every one of these trips, and stretching the
     box to reach it would squash the trip itself into a corner. */
  const home = model.toronto;
  const first = model.places[0];
  /* The bearing already points AT Toronto. Flipping it by 180 pointed the way
     home at the wrong horizon — on Georgian Bay, north-west instead of
     south-east. */
  const homeAngle = home ? (home.bearing * Math.PI) / 180 : 0;

  return (
    <>
      <div className="mapbox">
        <svg viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label={`Map of the route, ${model.places.length} places, north at the top`}>
          <rect x="0" y="0" width={W} height={H} fill="#e3ded4" />

          {/* the way home */}
          {home && first && (() => {
            const x0 = px(first.x);
            const y0 = py(first.y);
            const x1 = x0 + Math.sin(homeAngle) * 54;
            const y1 = y0 - Math.cos(homeAngle) * 54;
            const ax = x0 + Math.sin(homeAngle) * 64;
            const ay = y0 - Math.cos(homeAngle) * 64;
            const perp = homeAngle + Math.PI / 2;
            return (
              <g>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#6d6458" strokeWidth="1.6" />
                <polygon
                  points={[
                    `${ax},${ay}`,
                    `${x1 + Math.cos(perp) * 5},${y1 + Math.sin(perp) * 5}`,
                    `${x1 - Math.cos(perp) * 5},${y1 - Math.sin(perp) * 5}`,
                  ].join(" ")}
                  fill="#6d6458"
                />
                <text x={ax} y={ay + 16} fontFamily={MONO} fontSize="10.5" fill="#4f4a42"
                  textAnchor="middle">TORONTO</text>
                <text x={ax} y={ay + 29} fontFamily={MONO} fontSize="9.5" fill="#7a7368"
                  textAnchor="middle">{home.km} km away</text>
              </g>
            );
          })()}

          {/* One line per day, in the day's ink — each picking up where the day
              before put you down, or Sunday starts in mid-air at whatever town
              you woke up in. */}
          {model.days.map((d, i) => {
            const prev = model.days[i - 1]?.places.at(-1);
            const run = prev ? [prev, ...d.places] : d.places;
            if (run.length < 2) return null;
            const pts = run.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
            return (
              <polyline key={d.day} points={pts} fill="none" stroke={d.ink}
                strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            );
          })}

          {/* a place you sleep is a bigger dot than a place you pass */}
          <g stroke="#2a3330" strokeWidth="1.6" fill="#f5f2ec">
            {model.places.filter((p) => p.first).map((p) => (
              <circle key={p.key} cx={px(p.x)} cy={py(p.y)} r={p.base ? 8 : 6} />
            ))}
          </g>

          {/* A label on a place near the right edge runs off the paper, so it
              hangs off the left of its dot instead. */}
          <g fontFamily={SANS} fontSize="12.5" fontWeight="600" fill="#222b28">
            {model.places.filter((p) => p.first).map((p) => {
              const flip = p.x > 0.62;
              return (
                <text key={p.key} x={px(p.x) + (flip ? -12 : 12)} y={py(p.y) + 4}
                  textAnchor={flip ? "end" : "start"}>
                  {p.name}
                  {p.approx && <tspan fontFamily={MONO} fontSize="9" fill="#7a7368"> ~</tspan>}
                </text>
              );
            })}
          </g>

          {/* scale bar, and north */}
          {barLen > 0 && (
            <g>
              <line x1={PAD} y1={H - 26} x2={PAD + barLen} y2={H - 26}
                stroke="#4f4a42" strokeWidth="2" />
              <line x1={PAD} y1={H - 30} x2={PAD} y2={H - 22} stroke="#4f4a42" strokeWidth="2" />
              <line x1={PAD + barLen} y1={H - 30} x2={PAD + barLen} y2={H - 22}
                stroke="#4f4a42" strokeWidth="2" />
              <text x={PAD} y={H - 34} fontFamily={MONO} fontSize="10" fill="#4f4a42">
                {barKm} km
              </text>
            </g>
          )}
          <g>
            <line x1={W - 40} y1={H - 60} x2={W - 40} y2={H - 26} stroke="#4f4a42" strokeWidth="1.6" />
            <polygon points={`${W - 40},${H - 66} ${W - 45},${H - 52} ${W - 35},${H - 52}`} fill="#4f4a42" />
            <text x={W - 40} y={H - 12} fontFamily={SERIF} fontSize="12" fill="#4f4a42"
              textAnchor="middle">N</text>
          </g>
        </svg>
      </div>

      <div className="maplegend">
        {model.days.map((d) => (
          <span key={d.day}><i style={{ background: d.ink }} />{shortDay(d.label)}</span>
        ))}
        {model.places.some((p) => p.approx) && (
          <span className="maplegend__note">~ nearest settlement on record</span>
        )}
      </div>
    </>
  );
}

/** "Saturday — the Highway 60 corridor" is a legend entry of "Saturday". */
function shortDay(label: string): string {
  const cut = label.split(/\s[—–-]\s/)[0];
  return (cut ?? label).trim();
}
