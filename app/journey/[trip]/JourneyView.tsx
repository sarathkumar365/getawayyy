"use client";

import { useMemo, type JSX } from "react";
import "@/app/feel/feel.css";
import "@/app/walk/walk.css";
import "@/styles/station.css";
import "@/styles/journey.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { Celestial } from "@/components/scene/Celestial";
import { Journey } from "@/components/scene/Journey";
import { tripById } from "@/lib/data";
import { itineraryFor } from "@/lib/scene/itinerary";
import { muskokaLegs } from "@/lib/scene/muskoka-journey";

/**
 * The trip, walked.
 *
 * Only Muskoka has its runs authored. The other four are deliberately absent
 * until this one has been reviewed — doing one properly first was the point.
 */
export function JourneyView({ tripId }: { tripId: string }): JSX.Element {
  const trip = tripById(tripId);
  const itinerary = useMemo(() => (trip ? itineraryFor(trip) : null), [trip]);
  const legs = useMemo(
    () => (itinerary && tripId === "muskoka" ? muskokaLegs(itinerary) : {}),
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

        <Journey trip={trip} itinerary={itinerary} legs={legs} />

        <section className="walk__after">
          <p>
            {trip.name} — {itinerary.stations.length} stops, walked.
            {Object.keys(legs).length === 0 && " The runs for this one are not authored yet."}
          </p>
        </section>
      </div>
    </SmoothScroll>
  );
}
