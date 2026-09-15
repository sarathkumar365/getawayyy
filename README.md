# getawayyy

A private gift site: five researched weekend trips out of Toronto for October 2026,
presented as a journey you walk through with two animated characters.

Built from a pre-researched dataset (`trips.json`, schema 2.0.0 — 6 trips, 76 stops,
19 sources) whose defining quality is **provenance discipline**: costs that are
estimates say so, costs nobody could confirm stay `null`, closed venues stay in the
file marked closed, and ranges are never averaged into a single number. The site is
built to preserve that, not to smooth it over.

## Running it

```bash
bun install
bun run geocode   # only if data/coords.json is missing
bun run dev
```

No Node required — this is built and run with **bun**.

| route | what it is |
|---|---|
| `/` | Phase 0 scaffold, proving the data layer end to end |
| `/sheets` | character model sheets — both designs, every pose |
| `/stage` | the rig moving: dialogue beats, walk cycle, expression system |
| `/embed` | extraction target for the standalone build (not part of the journey) |

## The API key

`GOOGLE_PLACES_API_KEY` goes in `.env` (gitignored, never committed). Copy
`.env.example` to start. It is used **server-side only** — `/api/photo` proxies image
bytes so the key never appears in a browser-visible URL, and every route degrades to
`available: false` when no key is present, which is a normal state rather than an error.

Open-Meteo needs no key. `/api/weather` returns a **five-year October average** from
the archive rather than a forecast, because no model reaches October 2026.

## Architecture

- **`lib/data.ts`** — typed loader and selectors. Groups the two north trips via
  `alternative_to`; filters on `featured`.
- **`lib/money.ts`** — the file's most important rule in code: `0` is Free, `null` is
  "call to confirm", and a range stays a range.
- **`lib/match.ts`** — subjective quiz scoring. Handles the key mismatch between
  `traveller_interests` and `scores` explicitly (see below).
- **`lib/sky.ts`** — scroll-driven time-of-day, computed from each stop's real `time`.
- **`lib/answers.ts`** — localStorage plus an lz-string share-back link. The payload
  rides in the URL **fragment**, so it never reaches a server or a log.
- **`lib/characters/`** — the rig. `rig.ts` holds joint angles shared by both designs;
  `motion.ts` drives every joint from one ticker; `dialogue.ts` is the written script.

## Two things worth knowing

**The handoff is wrong about the scoring keys.** `shared.traveller_interests` does not
share keys with `trip.scores`. Two are renames. But `authentic_food` is weighted `high`
and has **no score axis at all**, and `value` has a score with no declared interest.
This is surfaced rather than silently swallowed.

**Canada reuses town names.** The first geocoding pass put Haliburton in Nova Scotia,
Kimberley in British Columbia and Whitney in New Brunswick. The resolver now filters on
province parsed from the query. Two places Open-Meteo has no record of resolve to a
nearby settlement and are flagged `approx: true` — no coordinate is hand-entered.

## Deploying

Vercel, from this repo. Next.js is auto-detected — no build settings to change.

Set `GOOGLE_PLACES_API_KEY` in Environment Variables. Without it the site still
works: `/api/photos` and `/api/reviews` return `available: false` and the gallery
simply does not offer "show me more". That is a designed state, not a failure.

`data/coords.json` and `data/photos.json` are committed because the build imports
them. Regenerate with `bun run geocode` and `bun run photos`.

## Status

Phase 0 complete. Phase 1 (characters) complete through the rig, the motion system and
the script; outstanding is the walk judgement on real hardware.
