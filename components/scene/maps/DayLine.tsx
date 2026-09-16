"use client";

import type { JSX } from "react";
import type { TripMapModel } from "@/lib/scene/tripmap";

/**
 * The map for a trip you walk rather than drive.
 *
 * Montreal and Quebec City resolve to one coordinate each — every stop on them
 * is inside the same city, and the geocoder has no record finer than that. A
 * plot of five labels pointing at one dot would be worse than useless, so what
 * gets drawn instead is the thing that IS true about those days: the order,
 * the times, and which day each stop belongs to.
 */
export function DayLine({ model }: { model: TripMapModel }): JSX.Element {
  return (
    <div className="dayline">
      {model.days.map((d) => (
        <section key={d.day} className="dayline__day" style={{ ["--day-ink" as string]: d.ink }}>
          <h3 className="dayline__label">{d.label}</h3>
          <ol className="dayline__stops">
            {d.places.flatMap((p) =>
              p.stops.map((s) => (
                <li key={`${p.key}-${s.time}-${s.name}`} className="dayline__stop">
                  <span className="dayline__time">{s.time}</span>
                  <span className="dayline__name">{s.name}</span>
                </li>
              )))}
          </ol>
        </section>
      ))}
    </div>
  );
}
