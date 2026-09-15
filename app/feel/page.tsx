import type { JSX } from "react";
import "./feel.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { SkyLayer } from "@/components/feel/SkyLayer";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { allStops, tripById } from "@/lib/data";
import { photosForStop } from "@/lib/photos";
import { skyFor } from "@/lib/sky";

export const metadata = { title: "The feel" };

/**
 * Phase 2 proving ground. One real day, scrolled: Lenis smoothing, the sky
 * driven by each stop's actual clock time, the Pencil trail, and the photo
 * pipeline on the stops that have a maps_query.
 */
export default function FeelPage(): JSX.Element {
  const trip = tripById("muskoka");
  if (!trip) return <main className="feel"><p>muskoka missing</p></main>;

  const stops = allStops(trip);
  const times = stops.map((s) => s.time);

  return (
    <SmoothScroll>
      <SkyLayer times={times} />
      <PointerTrail />
      <main className="feel">
        <div className="feel__inner">
          <header className="feel__head">
            <p className="feel__eyebrow">Phase 2 · the feel</p>
            <h1>{trip.name}, hour by hour</h1>
            <p className="feel__lede">
              The sky is not decoration. It is computed from each stop&apos;s real clock
              time in <code>trips.json</code> — so 18:00 on Friday is dusk and 09:30 on
              Saturday is morning, because that is when you would actually be standing
              there. Scroll, and the day passes. Draw with a Pencil and it leaves ink.
            </p>
          </header>

          {stops.map((stop, i) => {
            const sky = skyFor(stop.time);
            const local = photosForStop(stop.name);
            return (
              <section className="stop" key={`${stop.name}-${i}`}>
                <p className="stop__time">
                  {stop.time ?? "—"} <span aria-hidden="true">·</span>{" "}
                  <span className="stop__phase">{sky.phase}</span>
                </p>
                <h2>{stop.name}</h2>
                {stop.description && <p>{stop.description}</p>}
                <div className="card">
                  <PhotoGallery
                    name={stop.name}
                    local={local}
                    query={stop.maps_query ?? null}
                  />
                </div>
              </section>
            );
          })}

          <section className="stop">
            <h2>End of the day</h2>
            <p>
              Fifteen stops, seven sky phases, one continuous gradient. Nothing here
              re-renders while you scroll — the sky writes six CSS custom properties per
              tick and every surface reads them.
            </p>
          </section>
        </div>
      </main>
    </SmoothScroll>
  );
}
