"use client";

import { useState, type JSX } from "react";
import type { StopReaction } from "@/lib/answers";

export type ReactionRowProps = {
  /** `stopKey(tripId, day, time)` — the key her answer is stored under. */
  stopKey: string;
  reaction: StopReaction | undefined;
  note: string | undefined;
  onReact: (key: string, r: StopReaction) => void;
  onNote: (key: string, text: string) => void;
};

/**
 * One small row, not a form.
 *
 * It closes every panel in the same place, so it becomes a habit rather than
 * something to hunt for. The note is folded away behind the pencil because most
 * stops will get a tap and nothing more — an always-open textarea on 37 panels
 * reads as homework.
 */
export function ReactionRow(
  { stopKey, reaction, note, onReact, onNote }: ReactionRowProps,
): JSX.Element {
  const [open, setOpen] = useState(Boolean(note));
  // Typing is local; the store is written on blur. Saving every keystroke to
  // localStorage would serialise the whole answers object on each character.
  const [draft, setDraft] = useState(note ?? "");

  return (
    <div className="hers">
      <button
        type="button"
        className="act act--want"
        aria-pressed={reaction === "want"}
        aria-label="Ooh, I want this!"
        title="Ooh, I want this!"
        onClick={() => onReact(stopKey, "want")}
      >
        ♡
      </button>

      <button
        type="button"
        className="act"
        aria-pressed={reaction === "meh"}
        aria-label="Nah, skip this"
        title="Nah, skip this"
        onClick={() => onReact(stopKey, "meh")}
      >
        ×
      </button>

      <button
        type="button"
        className="act"
        aria-expanded={open}
        aria-label="Write a note"
        title="Write a note"
        onClick={() => setOpen((o) => !o)}
      >
        ✎
      </button>

      {open && (
        <textarea
          className="note"
          value={draft}
          placeholder="Say anything about this one…"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { if (draft !== (note ?? "")) onNote(stopKey, draft); }}
        />
      )}
    </div>
  );
}
