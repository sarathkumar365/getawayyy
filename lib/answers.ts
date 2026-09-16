"use client";

import { useEffect, useSyncExternalStore } from "react";
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

/** Re-exported so existing client callers keep one import. */
export { stopKey } from "./keys";

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

/* ----------------------------------------------------------------- store -- */

/**
 * ONE store, shared by every component that asks for it.
 *
 * This used to be a plain `useState` inside the hook, which meant each caller
 * got its own copy of her answers over one localStorage key. On the journey
 * page there are two callers — the station panels inside `Journey`, and the
 * questions in `JourneyEnd` — and both were mounted the whole time. So she
 * would walk the trip hearting stops (Journey's copy writes the whole object
 * to storage), reach the end, tap "Yes, this one", and JourneyEnd would write
 * ITS copy: the one hydrated at page load, before any of those hearts existed.
 * Every stop reaction was silently erased, the end screen counted zero, and
 * the link she sent back carried none of it.
 *
 * A module-level store with subscribers fixes it at the root: there is one
 * value, every caller sees the same one, and a write is a write. The `storage`
 * listener extends that to a second tab.
 */

type Store = { answers: Answers; loaded: boolean };

const EMPTY_STORE: Store = { answers: emptyAnswers(), loaded: false };

let store: Store = EMPTY_STORE;
let hydrated = false;
const subs = new Set<() => void>();

function publish(next: Store): void {
  store = next;
  for (const fn of subs) fn();
}

function readStored(): Answers | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Answers;
    return parsed?.v === 1 ? parsed : null;
  } catch {
    // Private mode, disabled storage, corrupt JSON — start clean rather than
    // breaking the page. Her answers just won't survive a reload.
    return null;
  }
}

/**
 * Hydrate after mount, never during render: localStorage does not exist while
 * prerendering, and reading it in render desyncs the server and client markup.
 */
function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  publish({ answers: readStored() ?? store.answers, loaded: true });
}

function subscribe(fn: () => void): () => void {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

const getSnapshot = (): Store => store;
const getServerSnapshot = (): Store => EMPTY_STORE;

/** Another tab wrote; take its version rather than fighting over the key. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const next = readStored();
    if (next) publish({ answers: next, loaded: true });
  });
}

function update(patch: (prev: Answers) => Answers): void {
  const next = { ...patch(store.answers), updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* nothing we can do; keep it in memory */
  }
  publish({ answers: next, loaded: true });
}

/* ------------------------------------------------------------------ hook -- */

const setName = (name: string): void => update((p) => ({ ...p, name }));

const setWeight = (key: string, value: number): void =>
  update((p) => ({ ...p, weights: { ...p.weights, [key]: value } }));

const reactToTrip = (tripId: string, r: Reaction): void =>
  update((p) => ({ ...p, trips: { ...p.trips, [tripId]: r } }));

const reactToStop = (key: string, r: StopReaction): void =>
  update((p) => {
    const stops = { ...p.stops };
    // Tapping the same reaction again clears it.
    if (stops[key] === r) delete stops[key];
    else stops[key] = r;
    return { ...p, stops };
  });

const setNote = (tripId: string, note: string): void =>
  update((p) => ({ ...p, notes: { ...p.notes, [tripId]: note } }));

const setHonest = (id: string, changed: boolean, note?: string): void =>
  update((p) => ({ ...p, honest: { ...p.honest, [id]: { changed, note } } }));

const setWeekend = (weekend: string): void => update((p) => ({ ...p, weekend }));

const setPick = (tripId: string, why: string): void =>
  update((p) => ({ ...p, pick: { tripId, why } }));

const setMissing = (missing: string): void => update((p) => ({ ...p, missing }));

const reset = (): void => {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  publish({ answers: emptyAnswers(), loaded: true });
};

export function useAnswers() {
  const { answers, loaded } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(hydrate, []);

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
