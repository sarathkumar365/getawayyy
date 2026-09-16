import type { JSX } from "react";
import { Opening, type TripCard } from "./Opening";
import { featuredTrips, stopCount, tripById } from "@/lib/data";
import { budgetHeadline } from "@/lib/money";
import { itineraryFor } from "@/lib/scene/itinerary";

/**
 * The front door. Muskoka is the trip that is built, so it is the one the
 * opening leads into; the other four are listed honestly as researched but
 * not yet walkable.
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
