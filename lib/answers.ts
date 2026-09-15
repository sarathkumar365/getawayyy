"use client";

import { useCallback, useEffect, useState } from "react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

/**
 * Everything Anjali types lives in her browser. There is no server.
 *
 * Getting it back: the final screen compresses this object, base64s it into the
 * URL *fragment* and offers a "send this back to him" link. The fragment never
 * leaves the browser — it is not sent with the request and never lands in a
 * server log. If the payload outgrows a safe URL length the UI falls back to
 * copy-to-clipboard rather than handing over a broken link.
 */

export type Reaction = "love" | "maybe" | "no";
export type StopReaction = "want" | "meh";

export type Answers = {
  v: 1;
  name: string | null;
  /** ScoreKey -> 0..3, from the opening quiz. */
  weights: Record<string, number>;
  /** trip id -> gut reaction */
  trips: Record<string, Reaction>;
  /** "<tripId>:<day>:<time>" -> reaction */
  stops: Record<string, StopReaction>;
  /** trip id -> free note */
  notes: Record<string, string>;
  /** A prompt id -> her answer on the honest blocks. */
  honest: Record<string, { changed: boolean; note?: string }>;
  /** Which October weekend suits her. */
  weekend: string | null;
  pick: { tripId: string; why: string } | null;
  missing: string | null;
  startedAt: string;
  updatedAt: string;
};

const KEY = "trip-getaway:answers:v1";
/** Well inside every browser's URL ceiling; Safari is the tight one. */
const MAX_URL_PAYLOAD = 8000;

export function emptyAnswers(): Answers {
  const now = new Date().toISOString();
  return {
    v: 1,
    name: null,
    weights: {},
    trips: {},
    stops: {},
    notes: {},
    honest: {},
    weekend: null,
    pick: null,
    missing: null,
    startedAt: now,
    updatedAt: now,
  };
}

export const stopKey = (tripId: string, day: number, time: string | null) =>
  `${tripId}:${day}:${time ?? "?"}`;

/* ------------------------------------------------------------- transport -- */

export function encodeAnswers(a: Answers): string {
  return compressToEncodedURIComponent(JSON.stringify(a));
}

export function decodeAnswers(payload: string): Answers | null {
  try {
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json) as Answers;
    return parsed && parsed.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export type ShareResult =
  | { ok: true; url: string }
  | { ok: false; reason: "too-long"; length: number };

/** Build the share-back URL, or say why it can't be one. */
export function shareUrl(a: Answers, origin: string): ShareResult {
  const payload = encodeAnswers(a);
  const url = `${origin}/replay#a=${payload}`;
  if (payload.length > MAX_URL_PAYLOAD) {
    return { ok: false, reason: "too-long", length: payload.length };
  }
  return { ok: true, url };
}

/** Read an incoming replay payload out of the fragment. */
export function readReplayFragment(): Answers | null {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/[#&]a=([^&]+)/);
  return m?.[1] ? decodeAnswers(m[1]) : null;
}

/* ------------------------------------------------------------------ hook -- */

export function useAnswers() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [loaded, setLoaded] = useState(false);

  // Hydrate after mount — localStorage doesn't exist during prerender, and
  // reading it in render would desync the server and client markup.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Answers;
        if (parsed?.v === 1) setAnswers(parsed);
      }
    } catch {
      // Private mode, disabled storage, corrupt JSON — start clean rather than
      // breaking the page. Her answers just won't survive a reload.
    }
    setLoaded(true);
  }, []);

  const update = useCallback((patch: (prev: Answers) => Answers) => {
    setAnswers((prev) => {
      const next = { ...patch(prev), updatedAt: new Date().toISOString() };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* nothing we can do; keep it in memory */
      }
      return next;
    });
  }, []);

  const setName = useCallback(
    (name: string) => update((p) => ({ ...p, name })), [update]);

  const setWeight = useCallback(
    (key: string, value: number) =>
      update((p) => ({ ...p, weights: { ...p.weights, [key]: value } })), [update]);

  const reactToTrip = useCallback(
    (tripId: string, r: Reaction) =>
      update((p) => ({ ...p, trips: { ...p.trips, [tripId]: r } })), [update]);

  const reactToStop = useCallback(
    (key: string, r: StopReaction) =>
      update((p) => {
        const stops = { ...p.stops };
        // Tapping the same reaction again clears it.
        if (stops[key] === r) delete stops[key];
        else stops[key] = r;
        return { ...p, stops };
      }), [update]);

  const setNote = useCallback(
    (tripId: string, note: string) =>
      update((p) => ({ ...p, notes: { ...p.notes, [tripId]: note } })), [update]);

  const setHonest = useCallback(
    (id: string, changed: boolean, note?: string) =>
      update((p) => ({ ...p, honest: { ...p.honest, [id]: { changed, note } } })), [update]);

  const setWeekend = useCallback(
    (weekend: string) => update((p) => ({ ...p, weekend })), [update]);

  const setPick = useCallback(
    (tripId: string, why: string) => update((p) => ({ ...p, pick: { tripId, why } })), [update]);

  const setMissing = useCallback(
    (missing: string) => update((p) => ({ ...p, missing })), [update]);

  const reset = useCallback(() => {
    try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
    setAnswers(emptyAnswers());
  }, []);

  return {
    answers,
    loaded,
    setName,
    setWeight,
    reactToTrip,
    reactToStop,
    setNote,
    setHonest,
    setWeekend,
    setPick,
    setMissing,
    reset,
  };
}
