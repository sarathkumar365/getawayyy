import type { ArrivalLine, Leg } from "../corridor";
import type { Itinerary } from "../itinerary";
import { legsFor, paceFor, type Script } from "./kit";
import { MUSKOKA } from "./muskoka";
import { ALGONQUIN } from "./algonquin";
import { GEORGIAN_BAY } from "./georgianBay";
import { MONTREAL } from "./montreal";
import { QUEBEC } from "./quebec";

/**
 * Every trip that has a script, by trip id.
 *
 * A trip missing from here still has a derived itinerary — stations, stops,
 * panels, all of it — it simply has nothing written to say while walking
 * between them. That is a real state and the page handles it, rather than
 * pretending the trip does not exist.
 */
const SCRIPTS: Record<string, Script> = {
  muskoka: MUSKOKA,
  "algonquin-haliburton": ALGONQUIN,
  "georgian-bay": GEORGIAN_BAY,
  montreal: MONTREAL,
  "quebec-city": QUEBEC,
};

export const hasScript = (tripId: string): boolean => tripId in SCRIPTS;

export type Staged = {
  legs: Record<string, Leg>;
  pace: Record<string, number>;
  arrivals: Record<string, readonly ArrivalLine[]>;
};

const EMPTY: Staged = { legs: {}, pace: {}, arrivals: {} };

/** Everything the Journey needs to play one trip. */
export function stageFor(tripId: string, itinerary: Itinerary, perScreen = 1900): Staged {
  const script = SCRIPTS[tripId];
  if (!script) return EMPTY;
  return {
    legs: legsFor(itinerary, script),
    pace: paceFor(itinerary, script, perScreen),
    arrivals: script.arrivals,
  };
}
