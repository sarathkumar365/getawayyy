"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import "@/styles/opening.css";
import { Actor } from "@/components/characters/Actor";
import { SpeechBubble } from "@/components/characters/SpeechBubble";
import { Ambience } from "@/components/feel/Ambience";
import { beat, type Line } from "@/lib/characters/dialogue";
import { wakeVoice } from "@/lib/audio/voice";
import type { DetailId } from "@/lib/characters/detailed";
import type { Expression } from "@/components/characters/Actor";
import type { ArmPose } from "@/lib/characters/rig";

export type TripCard = { id: string; name: string; direction: string; stops: number; budget: string };

type Held = { expr: Expression; arms: ArmPose | "crossed" | null };

const REST: Record<DetailId, Held> = {
  sun: { expr: { brow: "neutral", eye: "open", mouth: "smile" }, arms: null },
  curse: { expr: { brow: "flat", eye: "half", mouth: "closed" }, arms: "crossed" },
};

const heldFrom = (l: Line): Held => ({
  expr: { brow: l.brow, eye: l.eye, mouth: l.mouth, emote: l.emote },
  arms: l.arms ?? null,
});

/**
 * The opening.
 *
 * This is the only place she sees their faces — the walk itself is behind them
 * the whole way. So it is where the front rig and the written dialogue belong:
 * they introduce the trip in their own voices, and when she starts walking they
 * turn away, which is the same shot the journey opens on.
 */
export function Opening({ walkable, rest }: { walkable: TripCard; rest: TripCard[] }): JSX.Element {
  const router = useRouter();
  const lines = useMemo(() => beat("arrival"), []);
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [held, setHeld] = useState<Record<DetailId, Held>>(REST);
  const [spoken, setSpoken] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const line = lines[i];
  const speaker = line?.who ?? null;

  const advance = useCallback(() => {
    const next = i + 1;
    if (next < lines.length) {
      setI(next);
      const l = lines[next];
      if (l) setHeld((p) => ({ ...p, [l.who]: heldFrom(l) }));
    } else {
      setSpoken(true);
    }
  }, [i, lines]);

  /** They turn away, and then the walk starts. */
  const start = useCallback(() => {
    void wakeVoice();
    setLeaving(true);
    window.setTimeout(() => router.push(`/journey/${walkable.id}`), 760);
  }, [router, walkable.id]);

  return (
    <main className={`opening ${leaving ? "is-leaving" : ""}`}>
      <Ambience />

      <header className="opening__head">
        <p className="opening__eyebrow">For Anjali</p>
        <h1 className="opening__title">Five directions, one October</h1>
      </header>

      <div className="opening__stage">
        <div className="opening__cast">
          <Actor id="sun" x={32} turn={leaving ? 0 : 0.5} walking={leaving}
            talking={speaker === "sun" && typing}
            arms={held.sun.arms} expression={held.sun.expr} height={300} />
          <Actor id="curse" x={68} turn={leaving ? 0 : 0.5} flip walking={leaving}
            talking={speaker === "curse" && typing}
            arms={held.curse.arms} expression={held.curse.expr} height={330} />
        </div>
      </div>

      <div className="opening__talk">
        {line && !spoken && (
          <SpeechBubble
            key={i}
            speaker={line.who}
            text={line.text}
            side={line.who === "sun" ? "left" : "right"}
            onAdvance={advance}
            onTypingChange={setTyping}
          />
        )}
      </div>

      <div className="opening__go">
        {spoken ? (
          <>
            <button type="button" className="opening__start" onClick={start}>
              Start walking
            </button>
            <p className="opening__eyebrow" style={{ opacity: .7 }}>
              {walkable.name} · {walkable.stops} stops · {walkable.budget} for two
            </p>
          </>
        ) : (
          <button type="button" className="opening__skip" onClick={() => setSpoken(true)}>
            Skip ahead
          </button>
        )}
      </div>

      <details className="opening__rest">
        <summary>Or one of the other four</summary>
        <ul>
          {rest.map((t) => (
            <li key={t.id}>
              <Link href={`/journey/${t.id}`}>
                <span className="dir">{t.direction}</span>
                <span>{t.name}</span>
                <span className="meta">{t.stops} stops · {t.budget}</span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
