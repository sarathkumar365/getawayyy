# Handoff — Weekend Getaways site

Paste this into Claude Code at the start of the build. It's written to be read by an agent, not a person.

## What we're building

A small site that presents **six researched weekend trips from Toronto** for a couple to choose between. Read-only. No booking, no auth, no backend. All content comes from `trips.json`.

The audience is two people picking a trip, not the general public. So the site's job is **comparison and decision**, not marketing.

## The data

- `trips.json` — the single source of truth. Schema version `2.0.0`. ~136 KB, 6 trips, 76 stops.
- `trips.d.ts` — complete TypeScript types. Import these; don't re-derive them.

Load the JSON statically at build time. It doesn't change at runtime and there is no API.

### Shape

```
meta            title, currency, origin, travellers, notes[]
trips[]         the six trips
shared          rental_car, gas_assumptions, traveller_interests,
                constraints, date_plan, open_questions
research_notes  which review sources were reachable and which weren't
sources[]       every URL, tagged by trip id
```

Each trip: `id, slug, featured, order, name, tagline, direction, bearing_deg,
summary, why_this_trip, stats, highlights[], scores, dates, budget, lodging,
days[] → stops[], bookings[], warnings[], alternatives[]`.

## Conventions you must code against

**`featured`** — five trips are `true`, `kingston-pec` is `false` (superseded by Montreal, kept because it's the only sub-$500 east option). Filter on it for the main listing.

**`alternative_to`** — `muskoka` and `algonquin-haliburton` point at each other. They are two versions of the *same* north trip, not two unrelated offerings. Group them in the UI. `algonquin-haliburton` also carries `how_it_differs_from_muskoka[]`, which is exactly the copy you want on that comparison.

**`budget`** — uniform across all trips:
```ts
{ total: number | null, total_range: string | null,
  default_variant: string, line_items: LineItem[],
  variants: BudgetVariant[], note: string | null }
```
`total` and `line_items` mirror the default variant, so a summary card reads those two and ignores the rest. Two variants have `total: null` and a `total_range` string instead (`quebec-city` flying, `georgian-bay` with-pottery) — these are genuinely ranges, so render the range, don't average it.

**`cost.amount`** on a stop — `0` means free, `null` means *unknown, needs a phone call*. Render `null` as "call to confirm", never as `$0` or "Free". Currently only the two pottery stops.

**`estimated: true`** on a line item means it's an unverified guess. **`data_source`** means it came from AllTrails / Booking.com / Google Places on 2026-09-15. Surface this distinction — it's the point of the whole file.

**No coordinates.** Every stop has `maps_query`, a string to hand to a Maps embed or geocoder. Do not invent lat/lng. If you need a map, geocode at build time and cache, or use the query strings directly in embed URLs. `bearing_deg` exists if you want a compass/radial layout instead of a map.

**Null-but-present.** Every stop is guaranteed to have `time, name, type, description, duration_min, cost{amount,per,note}, maps_query, tags[], address`. Any may be `null`; the key always exists. Everything beyond that is genuinely optional — check before rendering.

## Content rules — do not sand these off

The value of this data is that it's honest about its own weak points. Several fields exist specifically to carry bad news, and the site must show them:

- **`warnings[]`** on each trip. Real ones: Algonquin's busiest-weekend problem, Quebec City's 800 km each way, the French-language note.
- **`the_honest_problem`** on `quebec-city` — a four-way drive/fly/train/bus comparison with a recommendation. This is the single most important block on that trip. Give it real estate; don't bury it in a footnote.
- **`correction`** on the Old Baldy stop — the earlier version of this data had it as a moderate 4.3 km stroll. It's a hard 6 km hike with 419 m of climbing. The correction text should be visible.
- **`closed_since_v1`** / **`removed`** — two venues turned out to be permanently closed (O-Taku Manga Lounge in Montreal, Georgian Bay Pottery in Collingwood). Replacements are in `options[]` / `alternatives_nearby[]`. Don't silently drop the closure note.
- **`reviews.complaints[]`** — e.g. Scandinave Spa enforces a strict no-talking policy that reviewers say ruins it for couples. That complaint is why it's an alternative and not a main stop. Show praise *and* complaints.
- **`dates.collision`** on `quebec-city` — it clashes with Georgian Bay's best weekend. Surface it on any calendar view.

If a design choice forces a cut, cut the marketing copy, not these.

## Suggested structure

- **Index** — the five featured trips as comparison cards. Direction, dates, headline total, one-line tagline. The two north trips visibly paired.
- **Trip detail** — hero, why-this-trip, dates with reasoning, a day-by-day timeline from `days[] → stops[]`, budget with a variant toggle, lodging table, booking checklist ordered by `priority`, warnings, alternatives.
- **Compare** — `scores` is 0–5 across eight axes (`nature, architecture_history, pottery, korean_anime, famous_landmark, photo_spots, relaxation, value`). `shared.traveller_interests` has the same keys with weights, so a "best match for us" score is a weighted sum. **Label these as subjective** — they're a judgement call, not sourced data, unlike everything else in the file.
- **Calendar** — `shared.date_plan.one_weekend_each` maps each October 2026 weekend to a trip. Show the collision.

## What not to do

- Don't invent data to fill nulls. A missing price is information.
- Don't add trips, stops, or venues. Every entry here was researched and several were verified against live APIs.
- Don't restate the same facts in the JSON and in hard-coded copy — they'll drift.
- Don't build a booking flow. `bookings[]` is a checklist with phone numbers; the user books by phone and on Booking.com.
- Don't present the `scores` block as objective.

## Known gaps

- No lat/lng (the Geocoding API was never enabled).
- Two pottery prices unknown — both need a phone call.
- Algonquin day-use permit and Dorset Lookout Tower fees are estimates.
- Lodging rates are live as of 2026-09-15 and will drift before October.
- Nothing in this file comes from Reddit, YouTube or Instagram — all three block automated access. See `research_notes`.

## Stack

Not specified. Anything static works — Next.js static export, Astro, Vite + React. Pick one and say why in the first response. Ship the index and one trip detail page before building anything else.
