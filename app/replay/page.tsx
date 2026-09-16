"use client";

import Link from "next/link";
import { useEffect, useState, type JSX } from "react";
import "@/styles/ending.css";
import { readReplayFragment, type Answers } from "@/lib/answers";
import { allTrips, tripById } from "@/lib/data";

/**
 * What she sent back.
 *
 * The payload rides in the URL FRAGMENT, which is never sent with the request —
 * it does not reach Vercel, it is not in any access log, and there is no server
 * here to store it. It is read in the browser and shown, and that is the whole
 * mechanism.
 */
export default function ReplayPage(): JSX.Element {
  const [a, setA] = useState<Answers | null | "none">("none");

  useEffect(() => { setA(readReplayFragment() ?? null); }, []);

  if (a === "none") return <main className="replay"><p>Reading…</p></main>;

  if (!a) {
    return (
      <main className="replay">
        <h1>Nothing in this link</h1>
        <p>
          It needs the whole link, fragment and all — the part after the <code>#</code>
          {" "}is the only part that carries anything.
        </p>
        <Link href="/">Back to the start</Link>
      </main>
    );
  }

  const trip = a.pick ? tripById(a.pick.tripId) : undefined;
  const stopEntries = Object.entries(a.stops);
  const noteEntries = Object.entries(a.notes);

  const nameOf = (key: string): string => {
    const [tripId, day, time] = key.split(":");
    const t = allTrips.find((x) => x.id === tripId);
    const stop = t?.days.find((d) => String(d.day) === day)?.stops.find((s) => s.time === time);
    return stop?.name ?? key;
  };

  return (
    <main className="replay">
      <p className="replay__eyebrow">She sent this back</p>
      <h1>{a.name ? `${a.name}'s answers` : "Her answers"}</h1>

      {a.pick && (
        <section>
          <h2>She picked</h2>
          <p className="replay__big">{trip?.name ?? a.pick.tripId}</p>
          {a.pick.why && <p className="replay__quote">“{a.pick.why}”</p>}
        </section>
      )}

      {a.weekend && (
        <section><h2>Weekend</h2><p>{a.weekend}</p></section>
      )}

      {Object.keys(a.trips).length > 0 && (
        <section>
          <h2>On the trips</h2>
          <ul>
            {Object.entries(a.trips).map(([id, r]) => (
              <li key={id}>{tripById(id)?.name ?? id} — <b>{r}</b></li>
            ))}
          </ul>
        </section>
      )}

      {stopEntries.length > 0 && (
        <section>
          <h2>Stops</h2>
          <ul>
            {stopEntries.map(([k, r]) => (
              <li key={k}>{nameOf(k)} — <b>{r === "want" ? "wants this" : "meh"}</b></li>
            ))}
          </ul>
        </section>
      )}

      {noteEntries.length > 0 && (
        <section>
          <h2>What she wrote</h2>
          <ul>
            {noteEntries.map(([k, text]) => (
              <li key={k}><b>{nameOf(k)}</b><br />“{text}”</li>
            ))}
          </ul>
        </section>
      )}

      {a.missing && (
        <section><h2>What was missing</h2><p className="replay__quote">“{a.missing}”</p></section>
      )}

      <p className="replay__foot">
        Answered {new Date(a.updatedAt).toLocaleString("en-CA")}. Nothing here was stored
        anywhere — it travelled inside the link.
      </p>
      <Link href="/">Back to the start</Link>
    </main>
  );
}
