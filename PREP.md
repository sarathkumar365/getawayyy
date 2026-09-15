# PREP v3 — "Pick a Trip" journey site

Status: **requirements locked except §11.** Ready to scaffold.
Updated 2026-09-14. History in `PREP.v1.md`.

---

## 1. Decisions locked

| # | Decision |
|---|---|
| 1 | **Own host + serverless proxy.** Live APIs are in scope. |
| 2 | Feedback returns via **share-back link**, with copy-to-clipboard as fallback. |
| 3 | Characters: **original mascots**, layered SVG rig driven by **GSAP**. |
| 4 | Quiz surfaces the **top 2**, with "show me all five" always available. |
| 5 | **You supply the primary photos.** An API fetches more on demand. |
| 6 | **Live reviews** shown, on top of the 23 already in the data. |
| 7 | **iPad-first.** Phone and laptop must work. |
| 8 | **Per-trip visual worlds**, drawn from each trip's geography. |
| 9 | **Scroll drives time of day** — sunrise → noon → dusk. Weather included. |
| 10 | **Pointer trail** — soft fading trail under finger/Pencil. |
| 11 | English copy; **Korean/Japanese typography as decoration**, large and aesthetic. |
| 12 | **Neutral throughout.** Your pick revealed only *after* she picks. |
| 13 | **BTS-flavoured easter eggs** — purple motif, no faces, no lyrics (§9). |
| 14 | Data collection is **visible** to her. The JSON never is. |
| 15 | `kingston-pec` data gaps — deferred, not blocking. |
| 16 | She is **Anjali**. Characters are **Hinata** (Haikyū!!) and **Sukuna** (Jujutsu Kaisen), as originals. |

One note on "no backend": you'll have no server to run, patch or pay for idle —
just four small serverless functions that exist to keep API keys off the client.
That's the lightest possible version of what live data requires.

---

## 2. Stack

**Next.js (App Router) on Vercel.**

The hosting decision changed the right answer here. Next.js gives, in one box,
the three things this build now needs:

- **API routes** — `/api/photos`, `/api/reviews`, `/api/weather`. Keys stay server-side.
- **`next/image`** — automatic AVIF/WebP, responsive sizes, lazy loading. This was
  my biggest listed risk in v2 and it now solves itself. Given you're supplying
  photos for ~30 stops, it matters a lot.
- **Static generation** — the 5 trip pages prerender from `trips.json` at build time.
  Fast first paint on iPad, which is where the whole thing is judged.

TypeScript throughout, against the existing `trips.d.ts`. 76 stops with 22 optional
keys — 8 of which appear exactly once — is precisely where the compiler pays for itself.

### Animation libraries

| Library | Role | Notes |
|---|---|---|
| **GSAP 3 + ScrollTrigger** | the spine | Scroll choreography, character timelines, sky transitions. All plugins free as of v3.13. |
| **Lenis** | smooth scroll | ~3 KB. **This is what makes it feel expensive on iPad.** GSAP reads its scroll value. |
| **Motion** (ex-Framer Motion) | React-level | Component enter/exit, layout transitions, springs. |
| Canvas + Pointer Events | the trail | Pencil pressure and tilt come free from the Pointer Events API. ~80 lines, hand-rolled. |
| **lz-string** | share-back link | Compresses her answers before base64 → keeps the returned URL sane. |

Ruled out: Three.js (wrong register, and it would cook the iPad's battery),
After-Effects-dependent pipelines, anything CDN-only.

---

## 3. The API layer

Four routes. Keys live in Vercel env vars and never reach the browser.

| Route | Source | Key? | Purpose |
|---|---|---|---|
| `/api/photos` | **Google Places Photos** | yes | "Show me more" — real photos of the actual place, not stock |
| `/api/reviews` | **Google Places Details** | yes | Live rating + recent review text per stop |
| `/api/weather` | **Open-Meteo** | **no** | Free and keyless. Climate endpoint gives typical October conditions per region |
| `/api/geocode` | **Open-Meteo Geocoding** | **no** | Build-time only — see below |

### Geocoding solves the file's biggest gap
`trips.json` has **no lat/lng anywhere** — only `maps_query` strings. Open-Meteo's
geocoding API is free and keyless, so we resolve all 76 `maps_query` values **once
at build time** and cache the result to `data/coords.json`. That single step unlocks
weather per region, maps, and the distance/bearing visuals. No runtime cost, no key,
no rate-limit exposure.

### Caching and honesty
Every API response is cached at the edge (photos 7 days, reviews 24 h, weather 6 h).
Three reasons: iPad battery, cost, and the fact that Google's terms restrict how
long review content may be stored. Attribution renders with any Google-sourced
photo or review.

### The reviews already in the file
Live reviews are an *addition*, not a replacement. `trips.json` already carries
**23 rated places** (Google Places, TripAdvisor, AllTrails) and **29 lodging options**
with Booking.com scores — plus the qualitative gold: Scenic Caves' 2 praise and 3
complaint lines, Scandinave Spa's 4 complaints. Those are curated and they carry
the honest content. Live data sits alongside them as "as of today", clearly labelled.

### You'll need
A Google Cloud project with **Places API (New)** enabled and billing attached.
The handoff notes the Geocoding API was never enabled on it — so the project may
already exist. Both photo and review routes use the same key.

---

## 4. Characters

### 4.1 The cast — locked

Both are **original mascots** in the style of Anjali's two favourites. Recognition
lands through silhouette, colour and energy, not likeness.

| | **A — the Sunshine** | **B — the Curse** |
|---|---|---|
| inspired by | Hinata Shōyō, *Haikyū!!* | Ryōmen Sukuna, *Jujutsu Kaisen* |
| hair | bright tangerine, spiky, gravity-optional | crimson-pink, swept back, sharper spikes |
| markings | none | **black line-stripes across cheeks and forearms** |
| build | small, springy, always mid-motion | taller, still, arms crossed by default |
| accent colour | `#FF7A2F` tangerine | `#C1121F` crimson + ink black |
| default pose | bouncing on the balls of his feet | leaning on the edge of the frame, unimpressed |
| moves like | overshoots, then corrects | almost never moves, so it lands when he does |

**The design gift here:** Sukuna's markings are minimal black line work. That is
exactly the vocabulary this site already uses — so B doesn't fight the minimal
aesthetic, he *is* it. And tangerine against crimson-and-ink is a palette that
works before we even start.

### 4.2 Their job, and the joke

They walk her through it. Enter a screen, cross it, stop, turn, speak, point at a
photo, react to her quiz answers, lead her onward, be waiting at the top of the
next section.

The dialogue split now writes itself:

- **A sells the trip.** Pottery, the manga café, Koreatown, the steam train, the
  waterfall. Runs ahead. Gets excited about things that cost $14.
- **B delivers the bad news.** The 800 km each way. Old Baldy being a hard 6 km
  climb, not a stroll. The spa that enforces silence so you can't actually talk to
  each other. The two venues that closed. He is *correct every time*, and he is
  insufferable about it.

**That is how the honest data gets delivered without reading like a spreadsheet** —
the file's worst news arrives in the mouth of a character whose entire personality
is being smugly right.

Tone guard: B is arrogant and deadpan, never actually cruel, and never aimed at
Anjali — his contempt is reserved for bad ideas, long drives, and A. The running
gag is that he keeps showing up on a trip he claims not to care about.

Two beats worth building toward:
- On the **Quebec City** screen, B gets `the_honest_problem` — the full four-way
  table — and the recommendation "fly, and skip the rental." It is the one screen
  where he is unambiguously the useful one, and A has nothing to say.
- On **her final pick**, B drops the act for exactly one line.

### 4.3 Technique — SVG rig + GSAP (locked)
~30 separately-drawn parts, each its own SVG group with its own transform origin,
driven by GSAP timelines. Claude Design produces the character sheets; we slice
and rig them.

Where the effort goes, so it's smooth rather than stiff:
- **Overlapping action** — hair and clothing lag the body by 2–4 frames. This is
  the single biggest difference between "puppet" and "animated".
- **Eased everything** — custom cubic-beziers per body part, never linear.
- **Anticipation** — a small counter-move before every large move.
- **Blink and breath on independent, non-synchronised loops**, so idle never reads as a GIF.
- **Walk cycle**: 8 poses with hip rotation and vertical bob, not just leg swing.

Honest note, since you asked for anime-realistic: this lands as *very good motion
graphics*. Walk cycles are where the SVG-rig approach shows its seams. If the
walking specifically disappoints on a real iPad, the upgrade path is Rive for the
characters only — everything else stays identical. Worth judging at the end of
Phase 1 rather than deciding now.

### 4.4 Rig spec
```
character.svg
├─ legs       8-pose walk cycle + idle stance
├─ body       torso + 3-4 alt poses, breathing anchor
├─ head       fixed anchor, own bob
├─ hair       front + back layers, independent sway origin (lag 2-4 frames)
├─ brows      5 positions   neutral raised furrowed worried delighted
├─ eyes       6 states      open half closed wide sparkle side-glance
├─ mouth      8 shapes      closed smile grin open o talk-A talk-O sad
└─ arms       6 poses       rest point-L point-R wave thumbs-up hands-up
```
Per-trip outfits: parka (north), rain shell (escarpment), beret and scarf (Quebec),
tote and camera (Montreal).

### 4.5 Dialogue
60–120 written lines in a script file keyed by `screen × event × trip`.
Speech bubble with typewriter reveal and skip-on-tap. Written by hand — the voice
has to stay consistent across 13 screens.

### 4.6 Character sheet brief — ready for Claude Design

One sheet per character, on a transparent/paper ground, **flat vector, no
gradients, no rendering** — every part must survive being cut apart and re-rigged.

Required on each sheet:
1. **Front neutral**, full body, arms at rest — the master reference
2. **3/4 turn**, full body — used for walking and for pointing off-screen
3. **Walk poses ×8** — contact, down, passing, up, and the four mirrored
4. **Expression grid** — 5 brows × 6 eyes × 8 mouths, drawn as separable parts,
   not as 240 finished faces
5. **Arm poses ×6** — rest, point-L, point-R, wave, thumbs-up, hands-up
6. **Outfit variants ×4** — parka (north), rain shell (escarpment), beret + scarf
   (Quebec), tote + camera (Montreal)

Hard constraints for riggability:
- Every part on its **own named layer**, named to match §4.4
- **Hair front and hair back as separate layers** — they lag the head independently
- Consistent line weight across both characters, or they won't sit on one page
- Flat fills only; shadow as a single flat shape if at all
- No part may be drawn *joined* to another — shoulders, neck and hips need overlap,
  so the joints don't tear when rotated

Style target: clean minimal anime, closer to a modern title card than to a cel
from the show. Simplified faces. Confident single-weight outline. The whole point
is that they sit inside a restrained, aesthetic layout without shouting.

### 4.7 Two designs, both built — 15 Sep 2026

Claude Design could not be driven from this session: `DesignSync` needs a one-time
`/design-login` from an interactive terminal. Rather than stall, both sheets were
authored directly as layered SVG — which turned out to be the better route anyway,
because Claude Design returns flat art that still needs slicing, and what Phase 1
actually needs is a rig.

| | **Design 1 — mascot** | **Design 2 — detailed** |
|---|---|---|
| height | 5.5 heads | ~6.4 (A) / 6.9 (B) heads |
| head | ellipse + jaw | constructed skull: cranium, cheekbone, tapered chin |
| eyes | 6 states, flat | 8 states, 7 layers each — sclera, two-tone iris, pupil, ring, 2 speculars, tapered lash line, lower lid |
| brows | 5, stroked | 7, tapered filled shapes |
| mouths | 8 | 10 (adds smirk, grimace) |
| emotes | — | 6: blush, sweat, anger, sparkle, shadow |
| hair | one silhouette path | crown + individual tapered strands + sheen band + back mass |
| clothing | flat block colour | tailored: A in volleyball kit w/ V-neck trim, knee pads, court shoes; B in crossed kimono over an obi, wide sleeves, bare marked forearms |
| files | `lib/characters/rig.ts`, `hair.ts`, `components/characters/Character.tsx` | `lib/characters/detailed.ts`, `components/characters/DetailedCharacter.tsx` |

**They share the skeleton.** `Pose`, `WALK`, `ARM_POSES`, `ARMS_CROSSED` and `IDLE` are
pure joint angles and live in `rig.ts`; both renderers consume them. So the choice
between designs is reversible at any point, and can even be made per screen.

Both are original. Drawn in the register of Anjali's two favourites, carrying their
colour and energy — not likenesses, and the outfits are constructed rather than copied.

**Generated, not hand-drawn.** Hair is built from spike tables (`{a, len, w, skew}`) and
strand tables, not fixed bezier data, so silhouette is tunable by a few numbers. That
mattered: the first pass had the fringe hanging straight over both characters' eyes, and
fixing it was an edit to seven numbers rather than a redraw.

Four bugs worth remembering, all invisible in code and obvious on screen:
- Closing the hair crown as its own shape filled straight **across the face** — SVG has no
  notion that the skull is "inside" it. Hair has to be one path, fringe included.
- Sleeve and torso in the same fill turned a swinging arm into a **stripe across the chest**.
  Separation has to come from value; and the direction depends on the garment, since
  darkening a near-black top does nothing. B lost his arms entirely that way.
- Crossed arms need the two elbows at **opposite signs**. Folding both "forward" throws the
  forearms out sideways.
- There are only ~11 units of forehead between hairline and brow, so fringe length has to
  go to locks **outside** the eyes, not down the middle.

Still open in Phase 1: expressions wired to a controller, the idle/talk/react loops, hair
lag, the dialogue script, and the iPad walk judgement (the Rive decision point).

### 4.8 Design 2 chosen · the motion system — 15 Sep 2026

**Design 2 (detailed) is the pick.** Design 1 stays in the tree; it costs nothing to keep
and both consume the same poses, so it remains available per screen if the detailed rig
ever fights a busy photograph.

**How React and the animation share the rig.** They cannot both own a `transform`. The
split: React owns the outer *placement* transforms and which expression variant is on
screen; the motion controller owns every *joint* transform, written as a plain
`transform="rotate(a cx cy)"` attribute from each part's `data-origin`. This works because
the `pose` prop handed to the renderer is a **constant** — React diffs against its own
previous value, sees no change, and never writes those attributes again. Where both needed
a handle, the drawing gained an inner group: `blink-l` / `blink-r` inside the placed eye,
`mouth-anim` inside the placed mouth.

**One ticker, not many tweens.** Separate tweens per part drift out of phase and cost more
than recomputing the whole rig. Everything — walk phase, breath, blink, hair springs, talk
— is composed in a single tick.

- **Idle** runs on three sines with deliberately unrelated periods (4.1s / 5.7s / 7.3s), so
  they never line up and the loop never reads as a loop.
- **Hair** rides second-order springs, one per layer with different stiffness. Measured on
  a real head turn: strands 3.15°, hair-front 2.60°, hair-back 2.11°, head only 0.86° —
  and hair-back was still arriving after the head had already turned back. That trailing is
  the overlapping action §4.3 called for, and it is the difference between puppet and
  animation.
- **Walk** samples the eight frames continuously and springs in and out, so starting and
  stopping are eased rather than snapped. Verified hip sweep −21.8° to +25.4°.
- **Blink** fires on a random 2.1–6.4s interval with the two eyes offset by tens of
  milliseconds, so they never shut in unison.
- **Talk** squashes the mouth group from the typewriter's own state, so the mouth stops the
  instant the words do — no timer to fall out of sync.

**The standalone build.** `scripts/export-rig.ts` dumps the pose tables and the script to
JSON; `scripts/build-stage-artifact.mjs` combines that with SVG scraped from `/embed` and a
vanilla port of the controller. The demo therefore *cannot drift* from the real rig — it
shares the data. The `variants` prop renders all 39 expression groups as hidden siblings so
a build with no React can switch expressions by toggling `display`.

**Deferred to the real device:** whether the walk is good enough. Nothing measured here
answers that.

---

## 5. The five visual worlds

| Trip | World | Palette | Signature motion |
|---|---|---|---|
| `muskoka` N | lakes, docks, cottage country, steam train | lake blue-green, dock cedar, warm lamp | water shimmer, drifting steam |
| `algonquin-haliburton` N | deep maple forest, open highway, sculpture in woods | maple red → burnt orange, pine shadow | falling leaves, long road perspective |
| `georgian-bay` NW | limestone cliffs, waterfalls, orchards, big sky | escarpment stone, apple gold, cold grey | falling water, wind across grass |
| `montreal` E | old stone, spiral staircases, market colour, neon | grey stone, basilica blue-gold, market red | city lights rising at dusk |
| `quebec-city` FE | walled city, cold light, the big falls | deep slate, copper roof, cold blue | mist off Montmorency, narrow-street depth |

Time of day is **computed from the day's own timeline** — all 76 stops carry a
`time`, so the 09:30 stop sits in morning light and the 19:00 dinner in dusk. The
sky is driven by real content, not faked. Weather overlays come from `/api/weather`
on the geocoded region.

---

## 6. Her feedback — the share-back link

The site is for **Anjali**, and addresses her by name from screen 1.

**In her browser:** every answer lives in `localStorage` as she goes. Nothing is
lost if she closes the tab.

**Coming back to you:** the final screen encodes her answers with `lz-string`,
base64s them into a URL fragment, and offers *"send this back to him"*. You open
the link and the site **replays her version** — her picks, her reactions, her
notes, rendered in the same design. A copy-to-clipboard summary sits beside it for
when she'd rather just paste into WhatsApp.

Two details that matter: the payload goes in the URL **fragment** (`#...`), so it
never reaches the server or any log; and if her notes run long enough to blow past
a safe URL length, the button falls back to copy automatically rather than
producing a broken link.

### What gets captured
| Where | What |
|---|---|
| Opening quiz | 6–8 questions → weights the 8 `traveller_interests` axes |
| Each trip | gut reaction ❤️ / 🤔 / ✖️ |
| Each stop | ✨ want / 😐 meh |
| Each trip page | free note |
| The honest blocks | "does this change your mind?" — Quebec's 800 km, Old Baldy's hard hike, the spa's no-talking rule |
| Calendar | which October weekend suits her |
| Final screen | her pick, why, and anything she'd add that isn't here |

---

## 7. Journey structure

```
1  Arrival           dark → dawn. Characters walk on. Her name.
                     "Toronto. Five directions. One October."
2  The quiz          6-8 questions. Characters react to each answer.
3  The reveal        TOP 2 surfaced, ranked by her answers and labelled
                     SUBJECTIVE. "Show me all five" opens the compass —
                     radial by bearing_deg (0 / 15 / 315 / 90 / 75),
                     with the two north trips visibly paired.
4  Trip worlds x5    own palette, own sky, own outfits. Hero -> why ->
                     dates -> day-by-day timeline with photos -> budget
                     with variant toggle -> lodging -> bookings ->
                     warnings -> alternatives. Reactions + notes throughout.
   4b  The north fork      muskoka vs algonquin, how_it_differs bullets
   4c  The honest problem  quebec-city, full screen, the 4-way table
5  The calendar      October 2026, five weekends, the collision,
                     the 6 hard deadlines
6  The ledger        all budgets side by side. Ranges stay ranges.
                     kingston-pec appears once, as the sub-$500 footnote.
7  Her pick          choose + why + what's missing
8  Your pick         revealed only now. Characters react to match or mismatch.
9  Ending            closing card. Share-back and copy live here.
```

**13 screens: 8 unique + 5 trip variants.**

---

## 8. Data rules — binding

1. `cost.amount: null` → **"call to confirm"**, never `$0`. Four stops: Blackbird
   Pottery, Hello Pottery Co., and Quebec's two travel legs.
2. `budget.total: null` → render `total_range`. **Never average a range.**
3. `variant.line_items: null` (muskoka `trimmed`, georgian-bay `lean`) → render the
   `note` prose, not an empty table.
4. Line-item `amount` may be a **string**. No blind arithmetic.
5. `muskoka` ↔ `algonquin-haliburton` are one trip in two versions. Always paired.
6. `sources[]` is empty for `algonquin-haliburton` and `quebec-city` — don't render
   an empty box.
7. `scores` are **a judgement call**, not sourced data. Labelled subjective everywhere.
8. The five honest blocks stay prominent: Quebec's `the_honest_problem`, Old Baldy's
   `correction`, O-Taku's `closed_since_v1`, Georgian Bay Pottery's `removed`, and
   the Scandinave / Scenic Caves `complaints[]`.
9. `estimated: true` vs `data_source` — surface the difference. It's the point of the file.
10. Live API data is labelled "as of today"; file data is labelled with its
    `checked` date. Never blend them silently.

### Found while building Phase 0

11. **`traveller_interests` does NOT share keys with `scores`.** The handoff says
    it does. Two are renames (`famous`→`famous_landmark`, `photos`→`photo_spots`),
    and two are orphans: **`authentic_food` is weighted `high` but has no score
    axis at all**, and `value` has a score but no declared interest. Handled
    explicitly in `lib/match.ts`; the quiz must fold food in by hand rather than
    pretend the axis exists.
12. **Canada reuses town names, badly.** An unfiltered geocode puts Haliburton in
    Nova Scotia, Kimberley in British Columbia and Whitney in New Brunswick — all
    wrong by 1,000+ km. The resolver filters on province. Worth remembering for
    any future lookup.
13. Open-Meteo carries no record of Kimberley ON or Île d'Orléans. Rather than
    hand-entering coordinates, those resolve a nearby settlement (Eugenia ~8 km,
    Québec ~15 km) and are flagged `approx: true`. **No coordinate in
    `data/coords.json` is invented** — every one came from Open-Meteo.
14. Typical October, from five years of archive: **Muskoka 13.8°/7.1° with a 48%
    wet-day rate; Quebec 13.7°/5.3° at 35%.** The north is the rainier bet, which
    matches the file's own note about Muskoka's weather.

---

## 9. Easter eggs

- **Purple as the secret accent.** 보라해 — running under the whole palette,
  surfacing on her final pick.
- **Seven of something** on the ending card.
- A purple heart on long-press.
- Hangul/kana as large decorative type in section headers — aesthetic, not translation.
- The pointer trail glows purple on the last screen only.

Not doing: real members' faces, or actual lyrics. Both belong to other people —
and a 보라해 tucked where only she'd catch it lands better than a likeness would.

---

## 10. Build order

**Phase 0 — foundations** ✅ **DONE**
1. ✅ Scaffold — Next.js 15.5 + React 19 + TS strict + GSAP + Lenis + Motion, on **bun**
   (no Node on this machine; bun 1.3.14 runs Next fine). Build and typecheck both clean.
2. ✅ Geocode — `scripts/geocode.ts` → `data/coords.json`. **31/31 towns resolved, 0 unresolved.**
3. ✅ Design tokens — `styles/tokens.css`. Light + dark + **6 trip worlds**, motion curves, type scale.
4. ✅ Data layer — `lib/data.ts`, `lib/money.ts`, `lib/match.ts`, `lib/sky.ts`.
5. ✅ `lib/answers.ts` — localStorage + lz-string share-back encode/decode.
6. ✅ API routes — `/api/photos`, `/api/photo`, `/api/reviews`, `/api/weather`.
   Verified live: weather returns real archive data; photo/review routes degrade
   cleanly to `available:false` with no key present.

*Not yet done in Phase 0: the Vercel deploy (needs your account).*

**Phase 1 — characters** *(the long pole)*
7. ✅ Character sheets for A and B — front, 3/4, 8 walk poses, expression grid, arm poses,
   outfits. **Two designs, both built** (§4.7). `app/sheets`.
8. ✅ Rigged — no slicing step. The sheet renders from the rig, so approving a drawing and
   having it move are the same thing.
9. ✅ Expression + pose controller; idle / talk / react loops — `lib/characters/motion.ts`,
   `components/characters/Actor.tsx`
10. ✅ Walk cycle + entrance/exit choreography
11. ✅ Speech bubble + typewriter, skip-on-tap — `components/characters/SpeechBubble.tsx`
12. ✅ Dialogue script — **86 lines across 30 beats**, `lib/characters/dialogue.ts`
13. ⏳ **Judge the walk on a real iPad.** Rive decision point. Standalone build shipped
    for exactly this — see §4.8.

**Phase 2 — the feel**
14. Lenis + ScrollTrigger scaffolding; the scroll-driven sky
15. Pointer trail on canvas
16. Image pipeline: your photos → `next/image` → gallery with "show me more"

**Phase 3 — components**
17. `StopCard` — the hard one: 16 types, 22 optional keys
18. `BudgetPanel` w/ variants · `LodgingTable` · `BookingChecklist` (by `priority`)
    · `WarningBlock` · `ReviewBlock` (praise **and** complaints) · `TrailStats`
    · `SourceBadge` · `PhotoGallery`
19. `ReactionWidget` · `NoteField` · `QuizStep` · `ScoreRadar`

**Phase 4 — screens**
20. Arrival + quiz + the top-2 reveal
21. **One trip world end to end** — `muskoka`. Review together before the rest.
22. The other four worlds
23. North fork · honest problem · calendar · ledger · her pick · your pick · ending

**Phase 5 — ship**
24. iPad pass (primary), then phone, then laptop
25. Dark mode, `prefers-reduced-motion`, perf budget
26. Deploy; open the link cold on an iPad; send

---

## 11. What I need from you

| # | Item | Status | Blocks |
|---|---|---|---|
| 1 | Character B | ✅ Sukuna, *Jujutsu Kaisen* | — |
| 2 | Her name | ✅ **Anjali** | — |
| 3 | `GOOGLE_PLACES_API_KEY` in `.env.local` | 🔜 you're adding it | Phase 0.6 — photos + live reviews only |
| 4 | **Photos** — 3–6 per stop for the ~30 anchor stops, not all 76 | ⚠️ outstanding | Phase 2 |
| 5 | **Your own pick** — trip + a line on why | 🔜 last | Screen 8 — genuinely last |

Nothing blocks the start. Phases 0 and 1 — scaffold, geocoding, data layer, API
routes, and both character rigs — can all be built before any of the above lands.
Missing keys degrade gracefully: the site falls back to the 23 ratings already in
`trips.json` and the photos you supply.

---

## 12. Open risks

- **Character quality is the make-or-break.** Everything else here is achievable
  with certainty. §4.3 is what decides whether it feels premium.
- **iPad thermals.** Canvas trail + GSAP + a scrolling sky is real load. Needs a
  perf budget and a `prefers-reduced-motion` path.
- **Google Places billing.** Photos are billed per request. Edge caching keeps it
  to pennies, but it's a live account with a card attached.
- **Google's review terms** restrict how long review text may be stored. We cache
  24 h and attribute. Not a problem, but not ignorable either.
- Lodging rates are live as of 2026-09-15 and **will drift before October**.
- `kingston-pec` has no `lodging`, `dates` or `why_this_trip`.
- No forecast exists for October 2026 dates. `/api/weather` serves **typical
  October conditions** per region, honestly labelled as such.
