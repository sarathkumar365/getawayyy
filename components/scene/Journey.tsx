"use client";

import { useCallback, useMemo, useState, type JSX } from "react";
import { Corridor } from "./Corridor";
import { RearActor } from "@/components/characters/RearActor";
import { StationStage } from "@/components/station/StationStage";
import { StationPanel } from "@/components/station/StationPanel";
import { useAnswers } from "@/lib/answers";
import type { Itinerary, Station, Travel } from "@/lib/scene/itinerary";
import type { Leg } from "@/lib/scene/corridor";
import type { Trip } from "@/lib/types";

export type JourneyProps = {
  trip: Trip;
  itinerary: Itinerary;
  /** Scenery for each travel leg, keyed by the leg's id. */
  legs: Record<string, Leg>;
  /** Scenery for a station, keyed by station id. Optional — most have none. */
  backdrops?: Record<string, JSX.Element>;
};

/** Depth per viewport of scroll. Lower = the world comes at you faster. */
const DEPTH_PER_SCREEN = 760;

/** How long a station holds, from how much it actually has to show. */
const stationPace = (s: Station): number => 2.2 + Math.min(2.4, s.richness * 0.34);

function bookingPriorities(trip: Trip): Map<string, number> {
  return new Map(trip.bookings.map((b) => [b.name.toLowerCase(), b.priority]));
}

function priorityFor(map: Map<string, number>, name: string): number | undefined {
  const key = name.toLowerCase();
  for (const [b, p] of map) if (key.includes(b) || b.includes(key)) return p;
  return undefined;
}

/**
 * A whole trip, walked.
 *
 * The sequence is not authored here — it comes from `itineraryFor(trip)`, so the
 * page cannot disagree with the data about where you stop. This component only
 * decides how much SCROLL each node gets: travel from its depth, a station from
 * how much it has to say.
 */
export function Journey({ trip, itinerary, legs, backdrops }: JourneyProps): JSX.Element {
  const [moving, setMoving] = useState(false);
  const onMoving = useCallback((m: boolean) => setMoving(m), []);
  const { answers, reactToStop, setNote } = useAnswers();
  const bookings = useMemo(() => bookingPriorities(trip), [trip]);

  return (
    <>
      {itinerary.nodes.map((node) => {
        if (node.kind === "travel") return travelNode(node, legs, onMoving, moving);

        const pace = stationPace(node);
        return (
          <StationStage
            key={node.id}
            station={node}
            pace={pace}
            backdrop={backdrops?.[node.id]}
          >
            <StationPanel
              station={node}
              bookingPriority={priorityFor(bookings, node.stop.name)}
              reaction={answers.stops[node.key]}
              note={answers.notes[node.key]}
              onReact={reactToStop}
              onNote={setNote}
            />
          </StationStage>
        );
      })}
    </>
  );
}

function travelNode(
  node: Travel, legs: Record<string, Leg>,
  onMoving: (m: boolean) => void, moving: boolean,
): JSX.Element | null {
  const leg = legs[node.id];
  // A leg with no scenery authored yet is skipped rather than rendered empty —
  // a blank corridor reads as a bug, where a missing one just reads as a cut.
  if (!leg) return null;

  return (
    <Corridor
      key={node.id}
      leg={leg}
      pace={Math.max(2, Math.round(leg.depth / DEPTH_PER_SCREEN))}
      onMoving={onMoving}
      className={`corridor--${leg.terrain ?? "highway"}`}
    >
      <div className="corridor__cast" data-cast="">
        <RearActor id="curse" walking={moving} className="rear rear--b" />
        <RearActor id="sun" walking={moving} className="rear rear--a" />
      </div>
    </Corridor>
  );
}
