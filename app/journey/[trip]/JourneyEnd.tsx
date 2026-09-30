"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Actor } from "@/components/characters/Actor";
import { SpeechBubble } from "@/components/characters/SpeechBubble";
import { beat, type Line } from "@/lib/characters/dialogue";
import { useAnswers, shareUrl, WEEKENDS, REACTION_LABEL } from "@/lib/answers";
import { canSendDirect, isApple, sendText, smsHref, whatsappHref } from "@/lib/send";
import type { Station } from "@/lib/scene/itinerary";
import type { Trip } from "@/lib/types";
import type { DetailId } from "@/lib/characters/detailed";

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
  const { answers, loaded, reactToTrip, setWeekend, setMissing } = useAnswers();
  const lines = useMemo(() => beat("ending"), []);
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [missing, setMissingDraft] = useState("");
  const [origin, setOrigin] = useState<string | null>(null);
  const [apple, setApple] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
    setApple(isApple());
    setCanShare(typeof navigator.share === "function");
  }, []);

  const line = lines[i];
  const speaker: DetailId | null = line?.who ?? null;

  const advance = useCallback(() => {
    if (i + 1 < lines.length) setI(i + 1);
    else setSpoken(true);
  }, [i, lines.length]);

  const keys = new Set(stations.map((s) => s.key));
  const wanted = Object.entries(answers.stops).filter(([k, v]) => keys.has(k) && v === "want").length;
  const notes = Object.keys(answers.notes).filter((k) => keys.has(k)).length;

  /*
   * Built on every render, not on click, so the buttons are real links: a
   * WhatsApp or Messages link opened from a click handler after an await is
   * what popup blockers eat. The typed-but-not-yet-blurred note is folded in,
   * because tapping a button is the blur that would have saved it.
   */
  const share = useMemo(() => {
    if (!origin) return null;
    return shareUrl({ ...answers, missing: missing || answers.missing }, origin);
  }, [answers, missing, origin]);
  const text = share?.ok ? sendText(share.url) : null;

  const copy = useCallback(() => {
    if (!share?.ok) return;
    void navigator.clipboard?.writeText(share.url).then(() => setCopied(true), () => setCopied(false));
  }, [share]);

  const more = useCallback(() => {
    if (!share?.ok || !text) return;
    navigator.share?.({ text }).catch(() => {});
  }, [share, text]);

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
                  {REACTION_LABEL[r]}
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
            <legend>Anything he forgot?</legend>
            <textarea value={missing || answers.missing || ""}
              placeholder="Something you'd rather do instead…"
              onChange={(e) => setMissingDraft(e.target.value)}
              onBlur={() => setMissing(missing || answers.missing || "")} />
          </fieldset>

          <div className="ending__send">
            <p className="ending__sendhead">Send all this to him!</p>
            {share && !share.ok ? (
              <p className="ending__note">
                That's a lot of notes! Too long to fit in one message. Trim a couple and try again.
              </p>
            ) : text ? (
              <>
                <div className="ending__buttons">
                  {canSendDirect && (
                    <>
                      <a className="sendbtn sendbtn--wa" href={whatsappHref(text)}
                        target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
                          <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2z" />
                        </svg>
                        WhatsApp
                      </a>
                      <a className="sendbtn sendbtn--sms" href={smsHref(text, apple)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 4c-4.97 0-9 3.36-9 7.5 0 2.2 1.14 4.18 2.95 5.55L5 21l4.3-2.2c.87.2 1.77.3 2.7.3 4.97 0 9-3.36 9-7.5S16.97 4 12 4z" />
                        </svg>
                        {apple ? "iMessage" : "Text message"}
                      </a>
                    </>
                  )}
                  {canShare && (
                    <button type="button" className="sendbtn" onClick={more}>More…</button>
                  )}
                </div>
                <button type="button" className="ending__copy" onClick={copy}>
                  {copied ? "Copied! Paste it anywhere." : "Or copy the link"}
                </button>
              </>
            ) : null}
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
