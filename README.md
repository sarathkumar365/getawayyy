# getawayyy

A private gift site: five researched weekend trips out of Toronto for October 2026,
presented as one continuous walk you scroll through with two characters.

Built from a pre-researched dataset (`trips.json`, schema 2.0.0 — 6 trips, 76 stops,
19 sources) whose defining quality is **provenance discipline**: costs that are
estimates say so, costs nobody could confirm stay `null`, closed venues stay in the
file marked closed, and ranges are never averaged into a single number. The site
preserves that rather than smoothing it over.

## Running it

```bash
bun install
bun run dev
```

No Node required — this is built and run with **bun**.

| route | what it is |
|---|---|
| `/` | the front door: the two of them, then the five trips |
| `/journey/<trip>` | the walk — one continuous world, cards rising at each stop |
| `/panel/<trip>` | every stop on one page, for going back to one card |
| `/replay` | what she sent back, read out of the link's fragment |

Trip ids: `muskoka`, `algonquin-haliburton`, `georgian-bay`, `montreal`,
`quebec-city`.

## The API key

`GOOGLE_PLACES_API_KEY` goes in `.env` (gitignored, never committed). Copy
`.env.example` to start. It is used **server-side only** — `/api/photo` proxies image
bytes so the key never appears in a browser-visible URL, and `/api/photos` degrades to
`available: false` when no key is present, which is a normal state rather than an
error.

## How the walk works

One sticky stage, one camera, one world. Scroll advances the camera down a
Catmull-Rom spline sampled into a lookup table; a station **holds** the camera still
while its card rises, so the landscape never cuts.

- **`lib/scene/itinerary.ts`** — which stops are stations and which are passed
  through, and how deep each leg is.
- **`lib/scene/schedule.ts`** — one scroll schedule for the whole trip: travel
  segments advance, station segments hold.
- **`lib/scene/journeys/`** — one written script per trip, plus the shared kit that
  turns runs and arrival lines into scenery and dialogue.
- **`lib/scene/tripmap.ts`** — each trip's map, from the Phase-0 coordinates.
- **`lib/characters/`** — the rig. `rig.ts` holds joint angles shared by both designs;
  `motion.ts` and `rearMotion.ts` drive every joint from one ticker.
- **`lib/answers.ts`** — localStorage plus an lz-string share-back link. The payload
  rides in the URL **fragment**, so it never reaches a server or a log.
- **`lib/money.ts`** — the dataset's most important rule in code: `0` is Free, `null`
  is "call to confirm", and a range stays a range.

Component styles travel with the component: a stylesheet is imported by the thing
that uses it, and its class names are namespaced to that thing.

## Two things worth knowing

**Canada reuses town names.** The first geocoding pass put Haliburton in Nova Scotia,
Kimberley in British Columbia and Whitney in New Brunswick. The resolver filters on
province parsed from the query. Places Open-Meteo has no record of resolve to a nearby
settlement and are flagged `approx: true` — no coordinate is hand-entered, and the
maps mark those with a `~`.

**Montreal and Quebec City have no map.** Every stop on them resolves to the one city
coordinate, so a plot would be five labels pointing at a single dot. They show the day
in order instead, which is the true shape of a day spent walking a city.

## Deploying

Vercel, from this repo. Next.js is auto-detected — no build settings to change.

Set `GOOGLE_PLACES_API_KEY` in Environment Variables. Without it the site still works;
the photo strips simply stay empty.

`data/coords.json` and `data/photos.json` are committed because the build imports
them. Regenerate with `bun run geocode` and `bun run photos`.
