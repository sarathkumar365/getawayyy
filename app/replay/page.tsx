"use client";

import Link from "next/link";
import { useEffect, useState, type JSX } from "react";
import "@/styles/ending.css";
import { readReplayFragment, weekendLabel, REACTION_LABEL, type Answers } from "@/lib/answers";
import { HomeButton } from "@/components/nav/HomeButton";
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

  // A second link opened in the same tab changes only the fragment, which is
  // not a navigation: without this it kept showing the first link's answers.
  useEffect(() => {
    const read = (): void => setA(readReplayFragment() ?? null);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (a === "none") return <main className="replay"><p>Reading…</p></main>;

  if (!a) {
    return (
      <main className="replay">
        <h1>Hmm, this link is empty</h1>
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

  /**
   * A stop key is `<trip>:<day>:<time>` — and the TIME HAS A COLON IN IT.
   * Splitting on every colon gave four parts and a time of "22", which matched
   * nothing, so every stop she marked came back to him as the raw key
   * `muskoka:0:22:15` instead of "Bracebridge Falls night walk". Split on the
   * first two only.
   */
  const nameOf = (key: string): string => {
    const a1 = key.indexOf(":");
    const a2 = key.indexOf(":", a1 + 1);
    if (a1 < 0 || a2 < 0) return key;
    const tripId = key.slice(0, a1);
    const day = key.slice(a1 + 1, a2);
    const time = key.slice(a2 + 1);
    const t = allTrips.find((x) => x.id === tripId);
    const stop = t?.days.find((d) => String(d.day) === day)?.stops.find((s) => s.time === time);
    return stop?.name ?? key;
  };

  return (
    <main className="replay">
      <HomeButton />
      <p className="replay__eyebrow">Look what she sent back!</p>
      <h1>{a.name ? `${a.name}'s answers` : "Her answers!"}</h1>

      {a.pick && (
        <section>
          <h2>Her pick</h2>
          <p className="replay__big">{trip?.name ?? a.pick.tripId}</p>
          {a.pick.why && <p className="replay__quote">“{a.pick.why}”</p>}
        </section>
      )}

      {a.weekend && (
        <section><h2>Which weekend</h2><p>{weekendLabel(a.weekend)}</p></section>
      )}

      {Object.keys(a.trips).length > 0 && (
        <section>
          <h2>How she felt about the trips</h2>
          <ul>
            {Object.entries(a.trips).map(([id, r]) => (
              <li key={id}>{tripById(id)?.name ?? id} — <b>{REACTION_LABEL[r] ?? r}</b></li>
            ))}
          </ul>
        </section>
      )}

      {stopEntries.length > 0 && (
        <section>
          <h2>Stops she liked (or not)</h2>
          <ul>
            {stopEntries.map(([k, r]) => (
              <li key={k}>{nameOf(k)} — <b>{r === "want" ? "wants this" : "meh"}</b></li>
            ))}
          </ul>
        </section>
      )}

      {noteEntries.length > 0 && (
        <section>
          <h2>Her notes</h2>
          <ul>
            {noteEntries.map(([k, text]) => (
              <li key={k}><b>{nameOf(k)}</b><br />“{text}”</li>
            ))}
          </ul>
        </section>
      )}

      {a.missing && (
        <section><h2>What you forgot</h2><p className="replay__quote">“{a.missing}”</p></section>
      )}

      <p className="replay__foot">
        Answered {new Date(a.updatedAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
        {" — "}nothing here was stored anywhere, it travelled inside the link.
      </p>
      <Link href="/">Back to the start</Link>
    </main>
  );
}
