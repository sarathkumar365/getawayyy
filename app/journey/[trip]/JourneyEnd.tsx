"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type JSX } from "react";
import { Actor } from "@/components/characters/Actor";
import { SpeechBubble } from "@/components/characters/SpeechBubble";
import { beat, type Line } from "@/lib/characters/dialogue";
import { useAnswers, shareUrl } from "@/lib/answers";
import type { Station } from "@/lib/scene/itinerary";
import type { Trip } from "@/lib/types";
import type { DetailId } from "@/lib/characters/detailed";

/** October 2026 weekends. Thanksgiving is the one the research recommends. */
const WEEKENDS = [
  { id: "oct-3", label: "Oct 3–4" },
  { id: "oct-10", label: "Oct 9–11 · Thanksgiving" },
  { id: "oct-17", label: "Oct 17–18" },
  { id: "oct-24", label: "Oct 24–25" },
];

/**
 * The end of the road, and the only part of this site that asks her anything.
 *
 * Everything below writes to `lib/answers.ts`, which has had working storage
 * and a share encoder since Phase 0 with no interface attached to it. This is
 * that interface. The two of them ask the questions, because a form is a form
 * but being asked by someone is a conversation.
 */
export function JourneyEnd(
  { trip, stations }: { trip: Trip; stations: Station[] },
): JSX.Element {
  const { answers, loaded, reactToTrip, setPick, setWeekend, setMissing } = useAnswers();
  const lines = useMemo(() => beat("ending"), []);
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [why, setWhy] = useState("");
  const [missing, setMissingDraft] = useState("");
  const [share, setShare] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const line = lines[i];
  const speaker: DetailId | null = line?.who ?? null;

  const advance = useCallback(() => {
    if (i + 1 < lines.length) setI(i + 1);
    else setSpoken(true);
  }, [i, lines.length]);

  const keys = new Set(stations.map((s) => s.key));
  const wanted = Object.entries(answers.stops).filter(([k, v]) => keys.has(k) && v === "want").length;
  const notes = Object.keys(answers.notes).filter((k) => keys.has(k)).length;

  const makeLink = useCallback(() => {
    const r = shareUrl(answers, window.location.origin);
    if (r.ok) {
      setShare(r.url);
      void navigator.clipboard?.writeText(r.url).then(
        () => setCopied(true),
        () => setCopied(false),
      );
    } else {
      // Over a safe URL length. Never hand over a link that will arrive broken.
      setShare(null);
      setCopied(false);
    }
  }, [answers]);

  const picked = answers.pick?.tripId === trip.id;

  return (
    <section className="ending">
      <div className="ending__stage">
        <Actor id="sun" x={32} turn={0.5} talking={speaker === "sun" && typing}
          expression={{ brow: "neutral", eye: "open", mouth: "smile" }} height={250} />
        <Actor id="curse" x={68} turn={0.5} flip talking={speaker === "curse" && typing}
          arms="crossed" expression={{ brow: "flat", eye: "half", mouth: "closed" }} height={275} />
      </div>

      <div className="ending__talk">
        {line && !spoken ? (
          <SpeechBubble key={i} speaker={line.who} text={line.text}
            side={line.who === "sun" ? "left" : "right"}
            onAdvance={advance} onTypingChange={setTyping} />
        ) : null}
      </div>

      {spoken && (
        <div className="ending__ask">
          <p className="ending__tally">
            {loaded && (wanted === 0
              ? "You didn't mark anything on the way. Totally allowed!"
              : `You liked ${wanted} of ${stations.length} stops${notes > 0 ? `, and left ${notes} note${notes === 1 ? "" : "s"}` : ""}.`)}
          </p>

          <fieldset className="ask">
            <legend>So? Would you go on this one?</legend>
            <div className="ask__row">
              {(["love", "maybe", "no"] as const).map((r) => (
                <button key={r} type="button"
                  aria-pressed={answers.trips[trip.id] === r}
                  onClick={() => reactToTrip(trip.id, r)}>
                  {r === "love" ? "Yes, this one!" : r === "maybe" ? "Hmm, maybe" : "Nah, not this one"}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ask">
            <legend>Which weekend works for you?</legend>
            <div className="ask__row">
              {WEEKENDS.map((w) => (
                <button key={w.id} type="button"
                  aria-pressed={answers.weekend === w.id}
                  onClick={() => setWeekend(w.id)}>
                  {w.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ask">
            <legend>{picked ? "Why this one? Tell tell!" : "Pick it, and tell me why"}</legend>
            <textarea value={why || answers.pick?.why || ""}
              placeholder="Because…"
              onChange={(e) => setWhy(e.target.value)}
              onBlur={() => setPick(trip.id, why || answers.pick?.why || "")} />
          </fieldset>

          <fieldset className="ask">
            <legend>Anything he forgot?</legend>
            <textarea value={missing || answers.missing || ""}
              placeholder="Something you'd rather do instead…"
              onChange={(e) => setMissingDraft(e.target.value)}
              onBlur={() => setMissing(missing || answers.missing || "")} />
          </fieldset>

          <div className="ending__send">
            <button type="button" className="ending__link" onClick={makeLink}>
              Send all this to him!
            </button>
            {share && (
              <p className="ending__note">
                {copied ? "Copied! Now paste it to him." : "Copy this link and send it to him:"}
                <br />
                <span className="ending__url">{share}</span>
              </p>
            )}
            {share === null && copied === false && (
              <p className="ending__note ending__note--quiet">
                Don't worry, nothing gets sent until you tap that.
              </p>
            )}
          </div>

          <div className="ending__more">
            <Link className="ending__again" href={`/panel/${trip.id}`}>
              See all the stops on one page
            </Link>
            <Link className="ending__again" href="/">
              Try the other trip
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
