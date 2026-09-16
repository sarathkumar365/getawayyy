"use client";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "@/styles/station.css";
import "./panel.css";
import { featuredTrips, tripById } from "@/lib/data";
import { itineraryFor, type Station } from "@/lib/scene/itinerary";
import { StationPanel } from "@/components/station/StationPanel";
import { useAnswers } from "@/lib/answers";
import type { Trip } from "@/lib/types";

/**
 * Every stop on one page.
 *
 * The walk is the way in; this is for afterwards, when she wants to go back to
 * the one with the bridge without scrolling a whole weekend to reach it. The
 * reactions are the same ones the walk writes, so a heart left here is a heart
 * left there.
 */

/** Booking priority for a stop, matched by name against the trip's own list. */
function bookingPriorities(trip: Trip): Map<string, number> {
  const m = new Map<string, number>();
  for (const b of trip.bookings) m.set(b.name.toLowerCase(), b.priority);
  return m;
}

/** Shared empty set, so switching trips does not allocate one per render. */
const EMPTY_SLOTS: ReadonlySet<number> = new Set<number>();

function priorityFor(map: Map<string, number>, name: string): number | undefined {
  const key = name.toLowerCase();
  for (const [b, p] of map) {
    if (key.includes(b) || b.includes(key)) return p;
  }
  return undefined;
}

export default function PanelPage(): JSX.Element {
  const params = useParams<{ trip: string }>();
  const tripId = params?.trip ?? "muskoka";
  const { answers, loaded, reactToStop, setNote } = useAnswers();

  const trip = tripById(tripId);
  const stations: Station[] = useMemo(
    () => (trip ? itineraryFor(trip).stations : []), [trip],
  );
  const bookings = useMemo(() => (trip ? bookingPriorities(trip) : new Map()), [trip]);

  const host = useRef<HTMLDivElement>(null);
  /**
   * Which panels are near enough to be worth their photos. Keyed by trip,
   * because the picker is a client-side navigation: the component instance is
   * reused, and a bare Set carried the previous trip's indices into the new one
   * — which fired photo lookups for stops she had not scrolled to yet, the very
   * thing the gating exists to prevent.
   */
  const [near, setNear] = useState<{ trip: string; slots: Set<number> }>(
    () => ({ trip: tripId, slots: new Set() }),
  );
  const seen = near.trip === tripId ? near.slots : EMPTY_SLOTS;

  useEffect(() => {
    const root = host.current;
    if (!root) return undefined;
    const io = new IntersectionObserver((entries) => {
      const hit: number[] = [];
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        hit.push(Number(e.target.getAttribute("data-slot")));
        io.unobserve(e.target);
      }
      if (hit.length > 0) {
        setNear((p) => ({
          trip: tripId,
          slots: new Set(p.trip === tripId ? [...p.slots, ...hit] : hit),
        }));
      }
    }, { rootMargin: "400px 0px" });
    for (const s of root.querySelectorAll("[data-slot]")) io.observe(s);
    return () => io.disconnect();
  }, [tripId, stations.length]);

  if (!trip) return <main className="panel-page"><p>No trip called {tripId}.</p></main>;

  // Only this trip's stops. The count sits under this trip's name, and
  // answers.stops holds every trip she has walked.
  const keys = new Set(stations.map((s) => s.key));
  const reacted = Object.keys(answers.stops).filter((k) => keys.has(k)).length;

  return (
    <main className="panel-page" data-world={tripId}>
      <header className="panel-page__head">
        <p className="eyebrow">Every stop</p>
        <h1>{trip.name}</h1>
        <p className="lede">{trip.tagline ?? trip.summary}</p>

        <div className="picker">
          {featuredTrips.map((t) => (
            <Link key={t.id} href={`/panel/${t.id}`}
              aria-current={t.id === tripId ? "page" : undefined}>
              {t.name}
            </Link>
          ))}
        </div>

        <p className="tally">
          {stations.length} stops
          {loaded && reacted > 0 && <> · {reacted} you have marked</>}
        </p>
      </header>

      <div className="panel-page__list" ref={host}>
        {stations.map((s, i) => (
          <div key={s.id} className="panel-page__slot" data-slot={i}>
            <StationPanel
              station={s}
              bookingPriority={priorityFor(bookings, s.stop.name)}
              reaction={answers.stops[s.key]}
              note={answers.notes[s.key]}
              onReact={reactToStop}
              onNote={setNote}
              active={seen.has(i)}
            />
          </div>
        ))}
      </div>

      <p className="panel-page__back">
        <Link href={`/journey/${trip.id}`}>Walk this one</Link>
        <Link href="/">All five</Link>
      </p>
    </main>
  );
}
