"use client";

import { useCallback, useEffect, useMemo, type ComponentType, type JSX } from "react";
import type { Trip } from "@/lib/types";
import { mapModelFor } from "@/lib/scene/tripmap";
import { MuskokaMap, MUSKOKA_NOTE } from "./maps/MuskokaMap";
import { AlgonquinMap, ALGONQUIN_NOTE } from "./maps/AlgonquinMap";
import { GeorgianBayMap, GEORGIAN_BAY_NOTE } from "./maps/GeorgianBayMap";
import { MontrealMap, MONTREAL_NOTE } from "./maps/MontrealMap";
import { QuebecMap, QUEBEC_NOTE } from "./maps/QuebecMap";
import { PlotMap } from "./maps/PlotMap";
import { DayLine } from "./maps/DayLine";

/** Trips with a hand-drawn sheet in Muskoka's style. Anything else plots itself. */
const DRAWN: Record<string, { Map: ComponentType; note: string }> = {
  muskoka: { Map: MuskokaMap, note: MUSKOKA_NOTE },
  "algonquin-haliburton": { Map: AlgonquinMap, note: ALGONQUIN_NOTE },
  "georgian-bay": { Map: GeorgianBayMap, note: GEORGIAN_BAY_NOTE },
  montreal: { Map: MontrealMap, note: MONTREAL_NOTE },
  "quebec-city": { Map: QuebecMap, note: QUEBEC_NOTE },
};

/**
 * The route, as an honest diagram — this trip's route, not a trip's route.
 *
 * Every featured trip has its own hand-drawn sheet in the style of Muskoka's:
 * water, the main roads, each day in its own ink, and the way home. A trip
 * without one falls back to plotting its Phase-0 coordinates, or — for a city
 * trip where every stop resolves to one dot — its days in order.
 */
export function TripMap(
  { trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void },
): JSX.Element | null {
  const close = useCallback(() => onClose(), [onClose]);
  const model = useMemo(() => mapModelFor(trip), [trip]);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e: KeyboardEvent): void => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", esc);
    // The walk behind must not scroll while the map is over it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  const drawn = DRAWN[trip.id];
  const note = drawn ? drawn.note : describe(trip, model.spreadKm, model.geographic);

  return (
    <div className="tripmap" role="dialog" aria-modal="true"
      aria-label={`Map of ${trip.name}`}>
      <div className="tripmap__sheet">
        <header className="tripmap__head">
          <div>
            <h2>{trip.name}</h2>
            <p>{note}</p>
          </div>
          <button type="button" className="tripmap__close" onClick={close} aria-label="Close the map">
            Close
          </button>
        </header>

        {drawn ? <drawn.Map />
          : model.geographic ? <PlotMap model={model} />
          : <DayLine model={model} />}

        <div className="daylinks">
          {model.days.filter((d) => d.route).map((d) => (
            <a key={d.day} className="btn" target="_blank" rel="noopener noreferrer"
              href={d.route as string}>
              {shortDay(d.label)} in Maps
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function shortDay(label: string): string {
  const cut = label.split(/\s[—–-]\s/)[0];
  return (cut ?? label).trim();
}

/** One true sentence about the shape of this trip, from its own numbers. */
function describe(trip: Trip, spreadKm: number, geographic: boolean): string {
  const base = trip.stats?.base_town;
  const km = trip.stats?.distance_km;
  const hours = trip.stats?.drive_time_hours;

  if (!geographic) {
    return `Everything on this one is inside the city, so this is the order of it rather than a plot. `
      + (km ? `${km} km of driving in total, almost all of it getting there and back.` : "");
  }
  const parts: string[] = [];
  if (base) parts.push(`${base} is the base`);
  parts.push(`the furthest two points are about ${Math.round(spreadKm)} km apart`);
  if (km && hours) parts.push(`${km} km and about ${hours} hours of driving over the weekend`);
  return `${parts.join(", ")}.`.replace(/^./, (c) => c.toUpperCase());
}
