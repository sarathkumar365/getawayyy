"use client";

import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Actor, type Expression } from "./Actor";
import { SpeechBubble } from "./SpeechBubble";
import { beat, type Line } from "@/lib/characters/dialogue";
import type { ArmPose } from "@/lib/characters/rig";
import type { DetailId, DOutfit } from "@/lib/characters/detailed";

export type SceneProps = {
  /** key into DIALOGUE */
  beatKey: string;
  outfit?: DOutfit;
  onComplete?: () => void;
  /** replay from the top whenever this changes */
  resetKey?: string | number;
  className?: string;
};

type Held = { expr: Expression; arms: ArmPose | "crossed" | null };

const REST: Record<DetailId, Held> = {
  sun: { expr: { brow: "neutral", eye: "open", mouth: "smile" }, arms: null },
  curse: { expr: { brow: "flat", eye: "half", mouth: "closed" }, arms: "crossed" },
};

function heldFrom(line: Line): Held {
  return {
    expr: { brow: line.brow, eye: line.eye, mouth: line.mouth, emote: line.emote },
    arms: line.arms ?? null,
  };
}

/**
 * Plays one beat: the speaker's line types out, the listener holds their last
 * expression, and a tap either skips the typing or advances. The talk loop is
 * driven by the bubble, not by a timer, so the mouth stops the instant the words do.
 */
export function Scene({
  beatKey, outfit = "kit", onComplete, resetKey, className,
}: SceneProps): JSX.Element {
  const lines = useMemo(() => beat(beatKey), [beatKey]);
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [held, setHeld] = useState<Record<DetailId, Held>>(REST);

  useEffect(() => { setI(0); setHeld(REST); }, [beatKey, resetKey]);

  const line = lines[i];

  useEffect(() => {
    if (!line) return;
    setHeld((prev) => ({ ...prev, [line.who]: heldFrom(line) }));
  }, [line]);

  const advance = useCallback(() => {
    if (i + 1 < lines.length) setI(i + 1);
    else onComplete?.();
  }, [i, lines.length, onComplete]);

  const speaker: DetailId | null = line?.who ?? null;

  return (
    <div className={`scene ${className ?? ""}`}>
      <div className="scene__stage">
        <Actor
          id="sun"
          outfit={outfit}
          x={30}
          turn={0.5}
          talking={speaker === "sun" && typing}
          arms={held.sun.arms}
          expression={held.sun.expr}
          height={300}
        />
        <Actor
          id="curse"
          outfit={outfit}
          x={70}
          turn={0.5}
          flip
          talking={speaker === "curse" && typing}
          arms={held.curse.arms}
          expression={held.curse.expr}
          height={340}
        />
      </div>

      <div className="scene__talk">
        {line ? (
          <SpeechBubble
            key={`${beatKey}-${i}`}
            speaker={line.who}
            text={line.text}
            side={line.who === "sun" ? "left" : "right"}
            onTypingChange={setTyping}
            onAdvance={advance}
          />
        ) : (
          <p className="scene__end">— end of beat —</p>
        )}
      </div>

      <div className="scene__progress" aria-hidden="true">
        {lines.map((_, n) => (
          <span key={n} data-on={n <= i ? "true" : "false"} />
        ))}
      </div>
    </div>
  );
}
