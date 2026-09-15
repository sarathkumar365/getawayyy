import Link from "next/link";
import type { JSX } from "react";
import "@/styles/arrival.css";
import { featuredTrips, meta, stopCount, tripById } from "@/lib/data";
import { budgetHeadline } from "@/lib/money";
import { itineraryFor } from "@/lib/scene/itinerary";

/**
 * The front door.
 *
 * One thing to do: start walking. Muskoka is the trip that is built, so it is
 * the one the button opens — the other four are listed honestly as what they
 * currently are, which is researched but not yet walkable.
 *
 * The workbench routes (/data, /panel, /stage, /sheets) still exist and are
 * still reachable; they are simply not what she lands on.
 */

const WALKABLE = "muskoka";

export default function Page(): JSX.Element {
  const muskoka = tripById(WALKABLE);
  const stations = muskoka ? itineraryFor(muskoka).stations.length : 0;

  return (
    <main className="arrival">
      <div className="arrival__inner">
        <p className="arrival__eyebrow">For Anjali</p>
        <h1 className="arrival__title">{meta.title}</h1>
        <p className="arrival__lede">
          Five weekends away from Toronto, one for each direction, all of them in
          October. Everything here was actually looked up — the prices, the opening
          hours, the reviews with the complaints left in. Nothing is invented.
        </p>

        {muskoka && (
          <div className="arrival__go">
            <Link className="arrival__start" href={`/journey/${muskoka.id}`}>
              Start walking
            </Link>
            <p className="arrival__hint">
              {muskoka.name} · {stations} stops · {budgetHeadline(muskoka)} for two.
              Scroll, and you walk it.
            </p>
          </div>
        )}

        <section className="arrival__rest">
          <h2>The other four</h2>
          <p className="arrival__note">
            Researched, costed, and ready to read — but not yet walkable. Muskoka is
            the one that is built.
          </p>
          <ul>
            {featuredTrips
              .filter((t) => t.id !== WALKABLE)
              .map((t) => (
                <li key={t.id}>
                  <Link href={`/panel/${t.id}`}>
                    <span className="arrival__dir">{t.direction}</span>
                    <span className="arrival__name">{t.name}</span>
                    <span className="arrival__meta">
                      {stopCount(t)} stops · {budgetHeadline(t)}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
