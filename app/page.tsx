import type { JSX } from "react";
import { Opening, type TripCard } from "./Opening";
import { featuredTrips, stopCount, tripById } from "@/lib/data";
import { budgetHeadline } from "@/lib/money";
import { itineraryFor } from "@/lib/scene/itinerary";

/**
 * The front door. All five are walkable now; Muskoka is simply the one the
 * opening leads into, because the north trip is the one it was built around.
 */
const WALKABLE = "muskoka";

const card = (id: string): TripCard | null => {
  const t = tripById(id);
  if (!t) return null;
  return {
    id: t.id, name: t.name, direction: t.direction,
    stops: stopCount(t), budget: budgetHeadline(t),
  };
};

export default function Page(): JSX.Element {
  const trip = tripById(WALKABLE);
  const walkable: TripCard = {
    id: WALKABLE,
    name: trip?.name ?? "Muskoka",
    direction: trip?.direction ?? "North",
    stops: trip ? itineraryFor(trip).stations.length : 0,
    budget: trip ? budgetHeadline(trip) : "—",
  };
  const rest = featuredTrips
    .filter((t) => t.id !== WALKABLE)
    .map((t) => card(t.id))
    .filter((c): c is TripCard => c !== null);

  return <Opening walkable={walkable} rest={rest} />;
}
