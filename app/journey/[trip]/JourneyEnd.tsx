"use client";

import Link from "next/link";
import type { JSX } from "react";
import { useAnswers } from "@/lib/answers";
import type { Station } from "@/lib/scene/itinerary";
import type { Trip } from "@/lib/types";

/**
 * The end of the road.
 *
 * The journey used to just stop, leaving a blank screen where the walk ran out.
 * A trip that ends in nothing reads as a page that failed to load — so it ends
 * where the drive ends, with what she actually said along the way.
 */
export function JourneyEnd(
  { trip, stations }: { trip: Trip; stations: Station[] },
): JSX.Element {
  const { answers, loaded } = useAnswers();
  const keys = new Set(stations.map((s) => s.key));
  const wanted = Object.entries(answers.stops)
    .filter(([k, v]) => keys.has(k) && v === "want").length;
  const notes = Object.keys(answers.notes).filter((k) => keys.has(k)).length;

  return (
    <section className="journey__end">
      <h2>Home by quarter to six.</h2>
      <p>
        {trip.name} — {stations.length} stops, walked end to end.
      </p>
      {loaded && (
        <p className="tally">
          {wanted === 0
            ? "You didn't mark any of it yet. Scroll back and tap the heart on the ones you want."
            : `${wanted} of ${stations.length} marked as ones you want${notes > 0 ? `, ${notes} with a note` : ""}.`}
        </p>
      )}
      <Link className="again" href={`/panel/${trip.id}`}>
        See every stop on one page
      </Link>
    </section>
  );
}
