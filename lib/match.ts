import type { Trip, Scores } from "./types";
import { shared } from "./data";

/**
 * SUBJECTIVE. `scores` is a judgement call, not sourced data — unlike everything
 * else in trips.json. Every surface that renders a match must say so.
 */

export type ScoreKey = keyof Scores;

/**
 * shared.traveller_interests does NOT use the same keys as trip.scores, despite
 * what the handoff says. Two are simple renames; two have no counterpart at all:
 *
 *   interest            score axis            status
 *   ------------------  --------------------  ---------------------------------
 *   pottery             pottery               match
 *   korean_anime        korean_anime          match
 *   nature              nature                match
 *   architecture_history architecture_history match
 *   relaxation          relaxation            match
 *   famous              famous_landmark       RENAMED
 *   photos              photo_spots           RENAMED
 *   authentic_food      —                     ORPHAN (and weighted "high")
 *   —                   value                 ORPHAN (no interest weight)
 *
 * `authentic_food` being unscoreable is the one that bites: it is a high-weight
 * interest with nothing to weigh, so it cannot influence the ranking. The quiz
 * should either ask about it and fold it in by hand, or not ask at all — but it
 * must not silently pretend the axis exists.
 */
export const INTEREST_TO_SCORE: Record<string, ScoreKey | null> = {
  pottery: "pottery",
  korean_anime: "korean_anime",
  nature: "nature",
  architecture_history: "architecture_history",
  relaxation: "relaxation",
  famous: "famous_landmark",
  photos: "photo_spots",
  authentic_food: null,
};

/** Interests carrying real weight that no score axis can satisfy. */
export const UNSCOREABLE_INTERESTS = Object.entries(INTEREST_TO_SCORE)
  .filter(([, v]) => v === null)
  .map(([k]) => k);

/** Score axes nobody declared an interest in. `value` is the only one. */
export const UNWEIGHTED_SCORES: ScoreKey[] = ["value"];

const WEIGHT_VALUE: Record<string, number> = { high: 2, medium: 1, low: 0.5 };

export const SCORE_KEYS: ScoreKey[] = [
  "nature",
  "architecture_history",
  "pottery",
  "korean_anime",
  "famous_landmark",
  "photo_spots",
  "relaxation",
  "value",
];

/**
 * The file's own declared weights, as a usable map.
 * `relaxation` is declared high in traveller_interests and maps 1:1, so it is
 * picked up by the loop. `value` stays 0 — nobody declared an interest in it.
 */
export function defaultWeights(): Record<ScoreKey, number> {
  const w = Object.fromEntries(SCORE_KEYS.map((k) => [k, 0])) as Record<ScoreKey, number>;
  for (const interest of shared.traveller_interests) {
    const axis = INTEREST_TO_SCORE[interest.key];
    if (!axis) continue;
    w[axis] = WEIGHT_VALUE[interest.weight] ?? 1;
  }
  return w;
}

export const SCORE_LABELS: Record<ScoreKey, string> = {
  nature: "Nature",
  architecture_history: "Architecture & history",
  pottery: "Pottery & making things",
  korean_anime: "Korean food & anime",
  famous_landmark: "Famous landmarks",
  photo_spots: "Photographs",
  relaxation: "A slow pace",
  value: "Value for money",
};

export type Match = {
  trip: Trip;
  /** 0–1. Normalised so it's comparable across different weight sets. */
  score: number;
  /** Which axes contributed most — for "because you said…" copy. */
  topAxes: { key: ScoreKey; label: string; contribution: number }[];
};

/**
 * Weighted sum of a trip's 0–5 scores against a weight map, normalised to 0–1.
 * Weights of 0 drop out entirely, so an all-zero map returns 0 for everything
 * rather than dividing by zero.
 */
export function matchScore(trip: Trip, weights: Partial<Record<ScoreKey, number>>): Match {
  let weighted = 0;
  let maxPossible = 0;
  const parts: { key: ScoreKey; label: string; contribution: number }[] = [];

  for (const key of SCORE_KEYS) {
    const w = weights[key] ?? 0;
    if (w <= 0) continue;
    const s = trip.scores[key] ?? 0;
    weighted += s * w;
    maxPossible += 5 * w;
    parts.push({ key, label: SCORE_LABELS[key], contribution: s * w });
  }

  parts.sort((a, b) => b.contribution - a.contribution);
  return {
    trip,
    score: maxPossible === 0 ? 0 : weighted / maxPossible,
    topAxes: parts.slice(0, 3),
  };
}

/** Rank trips best-first. Ties break on the file's own `order`. */
export function rankTrips(trips: Trip[], weights: Partial<Record<ScoreKey, number>>): Match[] {
  return trips
    .map((t) => matchScore(t, weights))
    .sort((a, b) => b.score - a.score || a.trip.order - b.trip.order);
}
