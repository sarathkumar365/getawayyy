"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import type { DetailId } from "@/lib/characters/detailed";
import { blip, chirp, wakeVoice } from "@/lib/audio/voice";

export type SpeechBubbleProps = {
  speaker: DetailId;
  text: string;
  /** called on the tap AFTER the line has finished revealing */
  onAdvance?: () => void;
  /** fires the moment the line finishes typing — drives the talk loop */
  onTypingChange?: (typing: boolean) => void;
  side?: "left" | "right";
  className?: string;
};

/** Punctuation is where a voice breathes. Typing at a constant rate sounds robotic. */
function delayAfter(ch: string): number {
  if (ch === "." || ch === "!" || ch === "?") return 260;
  if (ch === "," || ch === ";" || ch === ":") return 130;
  if (ch === "—") return 170;
  return 26;
}

export function SpeechBubble({
  speaker, text, onAdvance, onTypingChange, side = "left", className,
}: SpeechBubbleProps): JSX.Element {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);
  const notify = useRef(onTypingChange);
  notify.current = onTypingChange;

  const finish = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setShown(text.length);
    setDone(true);
  }, [text.length]);

  useEffect(() => {
    setShown(0);
    setDone(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || text.length === 0) {
      setShown(text.length);
      setDone(true);
      return undefined;
    }
    notify.current?.(true);
    let i = 0;
    const step = (): void => {
      i += 1;
      setShown(i);
      // One blip per letter revealed — the voice IS the typing.
      blip(speaker, text.charAt(i - 1));
      if (i >= text.length) {
        setDone(true);
        notify.current?.(false);
        chirp(speaker);
        return;
      }
      timer.current = window.setTimeout(step, delayAfter(text.charAt(i - 1)));
    };
    timer.current = window.setTimeout(step, 240);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      notify.current?.(false);
    };
  }, [text, speaker]);

  useEffect(() => {
    if (done) notify.current?.(false);
  }, [done]);

  const handle = useCallback(() => {
    // Any tap is a gesture, which is the only moment a browser will let audio
    // start. Cheap to call repeatedly; it no-ops once running.
    void wakeVoice();
    if (!done) finish();
    else onAdvance?.();
  }, [done, finish, onAdvance]);

  return (
    <div
      className={`bubble bubble--${side} bubble--${speaker} ${className ?? ""}`}
      data-done={done ? "true" : "false"}
      role="button"
      tabIndex={0}
      onClick={handle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
      }}
      aria-label={done ? "Next" : "Skip to the end of this line"}
    >
      <p className="bubble__text" aria-hidden="true">
        {text.slice(0, shown)}
        {!done && <span className="bubble__caret" />}
      </p>
      {/* the whole line, always, for screen readers */}
      <p className="bubble__sr">{text}</p>
      <span className="bubble__more" aria-hidden="true">
        {done ? "tap to continue" : "tap to skip"}
      </span>
    </div>
  );
}
