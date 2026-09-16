"use client";

import { useMemo, useState, type JSX } from "react";
import "@/app/feel/feel.css";
import "@/app/walk/walk.css";
import "@/styles/station.css";
import "@/styles/journey.css";
import "@/styles/ending.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { Ambience } from "@/components/feel/Ambience";
import { Celestial } from "@/components/scene/Celestial";
import { Journey } from "@/components/scene/Journey";
import { tripById } from "@/lib/data";
import { itineraryFor } from "@/lib/scene/itinerary";
import { stageFor, hasScript } from "@/lib/scene/journeys";
import { JourneyEnd } from "./JourneyEnd";
import { TripMap } from "@/components/scene/TripMap";

/**
 * The trip, walked. All five are written; the script for each lives in
 * `lib/scene/journeys/`.
 */
export function JourneyView({ tripId }: { tripId: string }): JSX.Element {
  const [mapOpen, setMapOpen] = useState(false);
  const trip = tripById(tripId);
  const itinerary = useMemo(() => (trip ? itineraryFor(trip) : null), [trip]);
  const stage = useMemo(
    () => (itinerary ? stageFor(tripId, itinerary) : null),
    [itinerary, tripId],
  );

  if (!trip || !itinerary) {
    return <main className="walk__after"><p>No trip called {tripId}.</p></main>;
  }

  return (
    <SmoothScroll>
      <div data-world={trip.id}>
        <Celestial />
        <PointerTrail />
        <div className="sky" aria-hidden="true" />

        <Ambience />

        <button
          type="button"
          className="journey__mapbtn"
          onClick={() => setMapOpen(true)}
          aria-label="Show the map of this trip"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M9 3 L3 5.5 v15 L9 18 l6 3 6-2.5 v-15 L15 6 Z" strokeLinejoin="round" />
            <path d="M9 3 v15 M15 6 v15" />
          </svg>
          Map
        </button>

        <Journey
          trip={trip}
          itinerary={itinerary}
          legs={stage?.legs ?? {}}
          pace={stage?.pace}
          arrivals={stage?.arrivals}
        />

        <TripMap open={mapOpen} onClose={() => setMapOpen(false)} />

        <JourneyEnd trip={trip} stations={itinerary.stations} />
      </div>
    </SmoothScroll>
  );
}
