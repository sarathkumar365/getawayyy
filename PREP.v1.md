# PREP — "Pick a Trip" journey site

Status: **pre-build.** Nothing coded yet. This file is the requirements instrument.
Written 2026-09-14 after a full read of `HANDOFF.md`, `trips.d.ts` and all 136 KB of `trips.json`.

---

## 0. What changed from the handoff

`HANDOFF.md` describes a **read-only comparison site for two people who already
decided to decide together**. The brief now is different in three ways, and each
one adds real work:

| Handoff said | You now want | Consequence |
|---|---|---|
| Read-only, no backend | She writes notes, picks, reactions — and **you read them back** | Needs a persistence layer. This is the single biggest addition. |
| Comparison tool | A **journey** — a guided, sequential experience | Needs a route/flow design, not just index + detail |
| No theme specified | Minimal + aesthetic, K-drama / anime, **animated characters that talk** | Needs a character rig + dialogue system built before any page |

Everything in the handoff's "Content rules — do not sand these off" section still
applies. The honest/ugly data is the point. A prettier theme must not bury it.

---

## 1. What we actually have

**Three files. No images. No coordinates. No code.**

```
HANDOFF.md    6.7 KB   build instructions
trips.d.ts    7.8 KB   complete TypeScript types, schema 2.0.0
trips.json    136 KB   6 trips, 76 stops, 19 sources
```

### Inventory

| trip | featured | dir | nights | stops | days | lodging | bookings | alts | warnings | budget |
|---|---|---|---|---|---|---|---|---|---|---|
| `muskoka` | ✅ | N 0° | 2 | 15 | 3 | 5 | 4 | 2 | 3 | $980 (trim $400) |
| `algonquin-haliburton` | ✅ | N 15° | 2 | 17 | 3 | 5 | 4 | 4 | 4 | $858 |
| `georgian-bay` | ✅ | NW 315° | 1 | 12 | 2 | 7 | 4 | 2 | 2 | $565 (lean $486 / pottery $550-620) |
| `montreal` | ✅ | E 90° | 2 | 11 | 3 | 6 | 5 | 2 | 3 | $806 (lean $472) |
| `quebec-city` | ✅ | FE 75° | 2 | 10 | 3 | 6 | 4 | 3 | 4 | **$1150-1350 fly** / $1103 drive |
| `kingston-pec` | ❌ superseded | E 90° | 1 | 11 | 2 | — | 5 | 2 | 2 | $486 |

`kingston-pec` is the only trip with **no** `lodging`, **no** `dates`, **no**
`why_this_trip`. Any component that touches those three must handle absence.

### Content volume to render
- 76 stops across 16 `type` values and 37 distinct tags
- 34 stops are free (`cost.amount === 0`), **4 are unknown** (`null`)
- 29 lodging options, 26 booking checklist items, 15 alternatives, 18 warnings
- 8 score axes × 6 trips, 8 weighted traveller interests
- 5 October 2026 weekends assigned, 1 collision, 6 hard deadlines

---

## 2. Data facts the renderer must respect

These are the traps. Pulled from the data, not from the handoff's summary.

1. **`cost.amount: null` ≠ free.** Renders as *"call to confirm"*.
   Four stops: `Blackbird Pottery`, `Hello Pottery Co.`, and Quebec City's two
   travel legs (`Toronto to Quebec City`, `Travel home` — null because the mode
   isn't decided). *Note: the handoff says "only the two pottery stops." It is four.*
   Some have a `cost.estimate` string ("80-150") to show alongside.
2. **`budget.total: null` → use `total_range`.** Only `quebec-city` at trip level.
   Also `georgian-bay`'s `with_pottery` variant. **Render the range; never average it.**
3. **`variant.line_items: null`** happens (muskoka `trimmed`, georgian-bay `lean`).
   The variant then only has a `note` explaining what was cut. The toggle UI must
   degrade to prose, not render an empty table.
4. **`amount` on a line item may be a string** (a range). Don't `toFixed()` blindly.
5. **Optional stop keys are genuinely sparse.** Out of 76 stops:
   `data_source` 11, `reviews` 6, `season` 5, `trail` 4, `phone` 4, `hours` 4,
   `booking` 4, `options` 3, `caveat` 3, `alternatives_nearby` 2, `transit` 2,
   `tips` 2, `note` 2, `status` 2, and **exactly one each** of `correction`,
   `closed_since_v1`, `removed`, `recommended`, `schedule`, `difficulty`,
   `trail_options`, `optional`. The last eight are effectively bespoke — but
   they carry the most important content in the file.
6. **`muskoka` ↔ `algonquin-haliburton`** point at each other via `alternative_to`.
   Same north trip, two versions. Must be visually paired, never listed as two
   unrelated options. `algonquin-haliburton.how_it_differs_from_muskoka[]` (6 bullets)
   is the copy for that comparison.
7. **No lat/lng anywhere.** Every place has `maps_query`. Geocode at build time
   and cache, or feed the query straight into an embed URL. `bearing_deg` exists
   for a compass layout: 0 / 15 / 75 / 90 / 90 / 315.
8. **`sources[]` covers only 4 trips** — montreal 6, georgian-bay 6, kingston-pec 4,
   muskoka 2, shared 1. **Nothing for `algonquin-haliburton` or `quebec-city`.**
   A "sources" section must not render an empty box on those two.
9. `meta.generated` is `2026-09-15`. Today is 2026-09-14. Data is stamped one day
   ahead; harmless, but don't write "researched N days ago" logic off it.

### The five blocks that must survive the redesign
The handoff is emphatic and it's right — this data's value is its honesty.

- `quebec-city.the_honest_problem` — 4-way drive/fly/train/bus table with a
  recommendation ("Fly, and skip the rental entirely"). **Deserves a full screen.**
- `georgian-bay` Old Baldy `correction` — v1.0 had it as a moderate 4.3 km stroll.
  It's **6 km, HARD, 419 m of climbing**. Show the correction text.
- `montreal` `closed_since_v1` — O-Taku Manga Lounge permanently closed. 5
  replacements in `options[]`. **This is the anime stop** — see §5.
- `georgian-bay` `removed` — Georgian Bay Pottery permanently closed → Hello Pottery Co.
- `georgian-bay` Scandinave Spa `alternatives[].reviews.complaints[]` — strict
  no-talking policy that reviewers say kills it for couples. Show praise **and**
  complaints. Also Scenic Caves (4.1★, 837) has 3 complaints.

---

## 3. The theme

**Minimal and aesthetic, with warmth.** The reference points are K-drama title
cards and quiet slice-of-life anime, not shonen action or kawaii overload.
Restraint is the whole point: white space carries it, the characters are the
accent, and **the colour comes from the fact that every one of these trips is an
October fall-colour trip.**

Proposed direction (to confirm):

- **Palette** — warm off-white paper base, deep ink text, a single autumn accent
  (persimmon / maple) and a muted sage or slate second. One accent per trip,
  derived from its character: Muskoka = lake blue-green, Algonquin = maple red,
  Georgian Bay = escarpment stone/gold, Montreal = old-stone grey + basilica blue-gold,
  Quebec = deep slate + copper.
- **Type** — one elegant serif for display (headlines, trip names), one clean
  sans for UI and data. Korean/Japanese-friendly fallback stack so any hangul or
  kana in the character dialogue doesn't fall back to something ugly.
- **Motion** — slow, eased, deliberate. Scroll-driven reveals. Nothing bounces
  unless a character does it.
- **Dark mode** — required (artifacts render in the viewer's theme). Must be
  designed, not derived.

---

## 4. The characters — the biggest pre-build

This is the part that has to exist **before** any trip page is worth building,
because every page's layout has a character slot in it.

### 4.1 Who they are — ⚠️ BLOCKING
- **Character A** — you described "the volleyball anime, orange hair." That reads
  as **Hinata Shōyō from Haikyū!!**. Confirm.
- **Character B** — "a character from something else." **I need the name.**

### 4.2 My recommendation: original mascots, not copies
I'd build two **original characters designed in that style** — an energetic
orange-haired one with A's silhouette and energy, and a second built to match
B once you name them — rather than reproducing the licensed characters.

Three practical reasons, not just the legal one:
1. Downloadable SVGs of those characters are fan-made, wildly inconsistent in
   line weight and style, and won't sit together on one page.
2. They're drawn as **flat single-pose art**. What you're asking for — talking,
   reacting, pointing at a map, getting excited about pottery — needs a
   **rigged** character: separate layered groups for hair, brows, eyes, mouth,
   arms, body, that we can drive independently. That means drawing it ourselves
   regardless of the source.
3. Original characters can wear the site's palette and appear in trip-specific
   outfits (hiking, parka, beret in Quebec). A ripped asset can't.

The recognisability lands through **silhouette, hair colour, energy and the
running gag** — which is what she'll actually react to.

### 4.3 What a character rig needs
```
character.svg
├─ body       base pose + 3-4 alt poses
├─ head       fixed anchor
├─ hair       front / back, own transform origin for bounce
├─ brows      ~5 positions  (neutral raised furrowed worried delighted)
├─ eyes       ~6 states     (open half closed wide sparkle side-glance)
├─ mouth      ~8 shapes     (closed smile grin open o talk-A talk-O sad)
└─ arms       ~6 poses      (rest point-left point-right wave thumbs-up hands-up)
```
Combinatorially that's a big expression vocabulary from ~30 drawn parts.

### 4.4 Animation states to build
`idle` (breathe + blink + hair sway) · `talking` (mouth cycle + head bob) ·
`pointing` · `excited` · `thinking` · `sad/disappointed` · `entering` · `exiting`
· `reacting-to-her-answer`

### 4.5 Dialogue system
A separate pre-build. Needs:
- A **speech bubble component** (tail direction, typewriter reveal, skip-on-click)
- A **script file** keyed by `page × event × trip × her-previous-answer`
- Rules for **who says what**: one character is the enthusiast (pushes the fun
  stuff — pottery, food, the manga cafe), the other is the realist (delivers the
  warnings, the 800 km, the no-talking spa policy). **That split is how the
  honest data gets delivered without the site feeling like a spreadsheet.**
- Estimate: 60–120 lines of dialogue total. Needs to be written, not generated
  at render time.

---

## 5. The anime/Korean thread already in the data

Worth knowing — the data itself rewards the theme, and this should drive her toward
a real choice rather than being decoration:

- **`montreal` scores `korean_anime: 5`** — the only trip that does. It has a
  Koreatown dinner (4 restaurant options), and the manga stop with 5 venue
  options after O-Taku closed: Kaizen Manga Cafe (4.8★, 161), Librairie Planète BD
  (4.8★, 293), Planète Otaku (4.8★, 410), Manga Bistro (4.4★, 3755), Sarah & Tom (4.6★, 413).
- **`quebec-city` scores 3** — Korean street food *inside the old town*
  ("Oh mon kogo", 4.8★, 1054), plus Madang and Chicken & Bap outside the walls.
- **`kingston-pec` scores 1** — one Korean restaurant.
- **`muskoka`, `algonquin-haliburton`, `georgian-bay` all score 0.**

So the honest framing: **the north trips are nature, the east trips are her
interests.** The characters should say that out loud rather than pretend all
five are equal.

---

## 6. Her input layer — ⚠️ needs your decision

"She can write things so I know what she likes" is a **persistence requirement**.
It's the one thing static hosting can't do.

### Recommended: publish as a Claude Artifact with the `db` capability
I checked — `db` is available on your account. It gives:
- A private URL you send her. No signup, no app, nothing to install.
- Her notes, reactions and final pick saved server-side as she goes.
- **You can read every answer back directly** — I can query the store and show
  you exactly what she wrote and what she skipped.
- Multi-file support, so it can be a real built app, not one giant HTML file.

Alternatives if you'd rather not: (a) `localStorage` + a "copy my answers" button
she pastes to you — works offline, but you only get what she remembers to send;
(b) a Google Form at the end — reliable, but kills the journey feel; (c) any
static host + a third-party form service — more setup, another account.

### What to capture — proposed
| Where | What | Type |
|---|---|---|
| Opening | Her name / how she wants to be greeted | text |
| Interests warm-up | Rank or rate the 8 `traveller_interests` axes | 8 sliders |
| Each trip card | Gut reaction | ❤️ / 🤔 / ✖️ |
| Each stop | Quick reaction | ✨ want / 😐 meh / skip |
| Each trip page | Free note — "what do you think?" | textarea |
| The honest blocks | "Does this change your mind?" (Quebec 800 km, Old Baldy hard hike, spa no-talking) | yes/no + note |
| Calendar | Which October weekend works for her | pick |
| Ending | **Final pick + why** | pick + textarea |
| Ending | "Anything you'd add that isn't here?" | textarea |

Her interest ratings can re-weight `shared.traveller_interests` and re-rank the
trips live — the site literally reshuffles based on her answers. That's the moment
worth building the whole thing for.

**Question for you: how surprised should she be?** Should the site openly say
"I'm collecting your answers so I can plan this," or should it read as a personal
gift where the saving is invisible? I'd strongly recommend the first — it's
honest, and "tell me what you actually want" is the warmer message anyway.

---

## 7. Proposed journey structure

Not index + detail. A path, with the comparison tools embedded in it.

```
1  Arrival          dark → dawn. Characters walk on. Name prompt.
                    "Toronto. Five directions. October. Pick one."
2  Warm-up          the 8 interests, as sliders. Characters react to each.
3  The compass      all 5 featured trips on a radial by bearing_deg
                    (0 / 15 / 315 / 90 / 75). The two north trips visibly paired.
                    Ranked live by her warm-up answers, labelled SUBJECTIVE.
4  Trip pages ×5    one per featured trip, each with its own palette + character
                    outfit. Hero → why → dates → day-by-day timeline → budget
                    with variant toggle → lodging → bookings → warnings → alternatives.
                    Reaction + note widgets throughout.
   4b  The north fork    muskoka vs algonquin side-by-side, how_it_differs bullets
   4c  The honest problem   quebec-city, full screen, 4-way table
5  The calendar     October 2026, five weekends, the collision called out,
                    the 6 hard deadlines as a timeline.
6  The ledger       all 6 budgets side by side. Ranges as ranges.
                    kingston-pec surfaces here as the "under $500" footnote.
7  Her pick         choose + why + anything missing. Characters react to her choice.
8  Ending           a closing card. Optionally something only she'd get.
```

Rough page count: **8 unique layouts + 5 trip variants ≈ 13 screens.**

---

## 8. Build order

Nothing here is a page. That's the point of a prep phase.

**Phase 0 — foundations**
1. Confirm stack (see §9) and scaffold
2. Design tokens: colour (light + dark), type scale, spacing, motion, 5 trip palettes
3. Typed data loader off `trips.d.ts` + derived selectors:
   `resolveBudget(variant)`, `formatCost(cost)` (the null/0/estimate logic),
   `matchScore(trip, weights)`, `groupAlternatives()`, `mapsUrl(maps_query)`
4. Persistence wrapper: `save(key, value)` / `load()`, degrades to localStorage
   if `db` returns null

**Phase 1 — the characters**
5. Draw and rig Character A (~30 SVG parts, layered, named groups)
6. Expression + pose controller
7. Idle / talk / react animation loops
8. Speech bubble + typewriter component
9. Draw and rig Character B
10. Write the dialogue script

**Phase 2 — components**
11. `StopCard` — the hard one. 16 types, 22 optional keys, the 8 bespoke ones
12. `BudgetPanel` with variant toggle + null/range handling
13. `LodgingTable`, `BookingChecklist` (sorted by `priority`), `WarningBlock`,
    `ReviewBlock` (praise **and** complaints), `TrailStats`, `SourceBadge`
    (`data_source` vs `estimated` — that distinction is the whole file's value)
14. `ReactionWidget`, `NoteField`, `ScoreRadar`

**Phase 3 — pages**
15. Arrival + warm-up, then the compass
16. **One trip page end to end** (recommend `muskoka` — 15 stops, has every field
    populated except the bespoke ones, so it exercises the common path)
17. Review together, then the other four
18. North fork, honest problem, calendar, ledger, pick, ending

**Phase 4 — ship**
19. Dark mode pass, mobile pass (she will open this on a phone — assume it)
20. Publish, test the link cold, send

---

## 9. Stack

**Recommendation: Vite + React + TypeScript**, built and published as a
multi-file Artifact with `db` enabled.

Why: `trips.d.ts` exists and is complete — TypeScript pays for itself immediately
against 22 optional stop keys. 76 stops of conditional rendering is where JSX earns
its place. Vite gives fast iteration on the character animation, which is the part
that needs the most fiddling. Multi-file publishing keeps the SVG rigs and the
JSON out of the page source.

Known friction, flagged now: an artifact page is wrapped in a `<head>/<body>`
skeleton at publish time, so the Vite build needs a small post-step to hand over
body content + assets rather than a full HTML document. Solvable, but it's the
one integration risk in this plan.

Alternative if you'd rather keep it simple: hand-authored HTML + CSS + vanilla JS
in a few files. No build step, no friction — but 76 conditional stop renders in
template strings will hurt by trip three.

---

## 10. Gaps and constraints

**Carried from the handoff:**
- No lat/lng — Geocoding API was never enabled
- 2 pottery prices unknown, both need a phone call
- Algonquin day-use permit and Dorset tower fees are estimates
- Lodging rates are live as of 2026-09-15 and **will drift before October**
- Nothing from Reddit, YouTube or Instagram — all three block automated access
- `scores` are a **judgement call**, not sourced data. Must be labelled subjective
  everywhere they appear, unlike everything else in the file.

**New, from this read:**
- **Zero images.** No photos of any trip, town, trail or dish. A site promising a
  "good visual experience" has nothing photographic to show. Either it goes
  fully illustrated — which actually suits the minimal/anime direction and is my
  recommendation — or you source photos yourself. **Decision needed (§11).**
- No sources for `algonquin-haliburton` or `quebec-city`
- `kingston-pec` missing `lodging` / `dates` / `why_this_trip`
- Ranges are strings, not numbers — no arithmetic on them anywhere

---

## 11. Open questions — blocking

1. **Character B — who is it?** Name the character. (A = Hinata, Haikyū!!, confirm?)
2. **Original mascots inspired by them, or attempt likenesses?** (§4.2 — I recommend original.)
3. **Her name**, and how the site should greet her.
4. **Persistence: Artifact + `db`?** (§6 — recommended, and it's what makes her
   answers reach you.)
5. **Photos: illustration-only, or will you supply images?** (§10)
6. **Is the data-collection visible or invisible to her?** (§6 — I recommend visible.)

## 12. Open questions — non-blocking, needed before their section

7. Does `kingston-pec` appear at all? (It's `featured: false` and superseded, but
   it's the only sub-$500 east option.) I'd surface it once, in the ledger.
8. Is this **one** trip being chosen, or is `shared.date_plan.one_weekend_each`
   real — all five, one per October weekend? The data supports both and the
   framing changes completely.
9. Language: any Korean or Japanese in the character dialogue, or English only?
10. Is there an inside joke, a shared reference, or a date/anniversary that should
    land in the ending card?
11. Should the site show your own picks/leanings, or stay neutral so hers are clean?
12. Any hard deadline — is there a date you want to send this to her by?

---

## 13. Effort, honestly

| Phase | Scope |
|---|---|
| Foundations + data layer | small |
| **Character rigs + animation + dialogue** | **largest single item — roughly a third of the build** |
| Component library | medium |
| 13 screens | large, but mechanical once components exist |
| Polish, dark mode, mobile, publish | medium |

The characters are the long pole. Answering §11 Q1–Q2 unblocks the most work.
