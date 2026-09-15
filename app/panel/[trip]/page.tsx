"use client";

import { useMemo, type JSX } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "@/styles/station.css";
import "./panel.css";
import { tripById } from "@/lib/data";
import { itineraryFor, type Station } from "@/lib/scene/itinerary";
import { StationPanel } from "@/components/station/StationPanel";
import { useAnswers } from "@/lib/answers";
import type { Trip } from "@/lib/types";

/**
 * Step 4 review surface. Not the journey — the journey is step 6.
 *
 * Muskoka is what ships first, so it is the default. The other trips are here
 * only because Muskoka has no reviews, no trails and no venue choices, and a
 * block nobody has ever rendered is a block that does not work.
 */

const TRIPS = ["muskoka", "algonquin-haliburton", "georgian-bay", "montreal", "quebec-city"];

/** Booking priority for a stop, matched by name against the trip's own list. */
function bookingPriorities(trip: Trip): Map<string, number> {
  const m = new Map<string, number>();
  for (const b of trip.bookings) m.set(b.name.toLowerCase(), b.priority);
  return m;
}

function priorityFor(map: Map<string, number>, name: string): number | undefined {
  const key = name.toLowerCase();
  for (const [b, p] of map) {
    if (key.includes(b) || b.includes(key)) return p;
  }
  return undefined;
}

export default function PanelPage(): JSX.Element {
  // One URL per trip, so each is directly reachable and can be checked without
  // driving a browser — which matters, since the rich blocks live in the trips
  // Muskoka has none of.
  const params = useParams<{ trip: string }>();
  const tripId = params?.trip ?? "muskoka";
  const { answers, loaded, reactToStop, setNote } = useAnswers();

  const trip = tripById(tripId);
  const stations: Station[] = useMemo(
    () => (trip ? itineraryFor(trip).stations : []), [trip],
  );
  const bookings = useMemo(() => (trip ? bookingPriorities(trip) : new Map()), [trip]);

  if (!trip) return <main className="panel-page"><p>No trip {tripId}.</p></main>;

  const reacted = Object.keys(answers.stops).length;
  const noted = Object.keys(answers.notes).filter((k) => k.includes(":")).length;

  return (
    <main className="panel-page" data-world={tripId}>
      <header className="panel-page__head">
        <p className="eyebrow">Step 4 · station panels</p>
        <h1>{trip.name}</h1>
        <p className="lede">
          Every station this trip has, rendered from <code>trips.json</code> through
          the derivation in <code>lib/scene/itinerary.ts</code>. The reactions are live —
          they write to localStorage and survive a reload.
        </p>

        <div className="picker">
          {TRIPS.map((id) => (
            <Link key={id} href={`/panel/${id}`} aria-current={id === tripId ? "page" : undefined}>
              {id}
            </Link>
          ))}
        </div>

        <p className="tally">
          {stations.length} stations
          {loaded && <> · {reacted} reacted to · {noted} with a note</>}
        </p>
      </header>

      <div className="panel-page__list">
        {stations.map((s) => (
          <div key={s.id} className="panel-page__slot">
            <StationPanel
              station={s}
              bookingPriority={priorityFor(bookings, s.stop.name)}
              reaction={answers.stops[s.key]}
              note={answers.notes[s.key]}
              onReact={reactToStop}
              onNote={setNote}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
