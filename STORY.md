# The story bible

How each trip becomes something she walks through, rather than a page she reads.

---

## 1. The idea

She scrolls. The characters walk. The sun crosses the sky and sets. That is the
whole mechanic, and it is enough — the trick is that **scrolling and walking are
the same gesture**, so the journey is something she performs rather than watches.

Three rules hold it together:

- **Time is real.** The sun's position comes from the stop's actual clock time in
  `trips.json`. When she reaches Lions Lookout the sun is low because the file
  says 18:00. Nothing about the light is authored.
- **She always knows where she is.** A trip is a horizontal walk with a fixed
  progress rail. No screen is a surprise, and she can leave at any point.
- **Nothing is hidden and nothing is sold.** The cost movement is a full stop in
  the story, not a footnote at the bottom.

---

## 2. The seven movements

Every trip has the same seven-movement shape. Same spine, different flesh — so
by the second trip she knows how to read one, and the differences land instead
of the structure.

| # | movement | sky | who leads | what it does |
|---|---|---|---|---|
| 1 | **Departure** | dusk | A | Toronto behind, the number of kilometres ahead |
| 2 | **First night** | night | B | Arrival, the base town, the quiet |
| 3 | **The morning** | dawn → morning | A | The day opens, the walk begins |
| 4 | **The high point** | midday → golden | A | The one thing this trip is *for* |
| 5 | **The cost** | overcast, colour drains | **B alone** | The honest problem. A has nothing to say |
| 6 | **The making** | soft midday | A and B together | Hands in clay. The emotional centre |
| 7 | **The road home** | golden → dusk | A | The question left open |

**Why movement 6 is the centre.** Every single one of the five trips has a
pottery workshop — Muskoka Bay, Blackbird, Studio Mie Kim, a studio inside the
old town, Hello Pottery Co. That is not a coincidence in the research; it is the
one thing the whole weekend is actually *for*. So it gets the quietest, warmest
screen in every story: no parallax, no birds, the characters stop walking and
sit down. It is the only time in the trip they are still.

**Why movement 5 exists.** A site that only sells is a brochure. The cost
movement is the reason she can trust the other six — and putting it in B's mouth
means the file's worst news is delivered by the character whose entire
personality is being right about things. The colour drains out of the world for
one screen and comes back after.

---

## 3. The scene kit

Five worlds, one set of parts. Everything below is SVG, drawn once, recoloured
per world by the `[data-world]` tokens that already exist.

### 3.1 Depth layers

Six layers, scrolling at different rates. Parallax does the walking.

| layer | speed | contents |
|---|---|---|
| `sky` | 0 (fixed) | gradient, already built in Phase 2 |
| `celestial` | 0.05 | sun or moon on its arc, stars |
| `weather` | 0.1 | cloud banks, rain, mist |
| `far` | 0.25 | ridgeline, city skyline, escarpment |
| `mid` | 0.5 | treeline, rooftops, the lake |
| `near` | 0.85 | individual trees, walls, rocks — things she passes |
| `ground` | 1.0 | the path the characters walk on |

The characters sit between `near` and `ground`. Anything in front of them is a
wipe: a trunk passing across frame at full speed, which is what sells the sense
of moving through a place rather than across a backdrop.

### 3.2 Sun and moon

One element, one arc. Position comes from `--sky-t`, which Phase 2 already
computes from the stop's clock time:

- `x` runs left to right across the full width as the day passes
- `y` is a parabola — highest at midday, below the horizon before sunrise and
  after sunset
- at night the same arc carries the **moon**, and stars fade in with the sky's
  own darkness

October 2026 detail worth using: the trip window sits near a waxing gibbous, so
the moon is a fat three-quarter shape rather than a storybook crescent. Drawing
the crescent would be prettier and wrong.

### 3.3 Birds

**Canada geese, flying south.** October is migration, these are the exact
latitudes, and every one of the five trips is under a flyway. So the birds are
not decoration — they are the same fact as the fall colour.

- a loose V of 5–9 birds, each a two-stroke chevron
- wingbeat on individual offsets so the V never pulses as one unit
- drift across the `far` or `weather` layer, roughly 40 seconds edge to edge
- **always heading south** — screen-right on the north trips, which is the
  direction she is *not* travelling. A small, true piece of melancholy.
- one flock per movement at most. Two is a cartoon.

### 3.4 Trees and the per-world parts

Trees are built from a trunk plus a crown, so one component covers everything by
swapping the crown and the palette.

| world | far | mid | near | signature element |
|---|---|---|---|---|
| **muskoka** | low granite ridge | white pine, birch | birch trunks, granite outcrop, dock posts | **steam train** — a puff that rises and drifts |
| **algonquin** | maple hills, layered | dense sugar maple | maple trunks, spruce bog boardwalk | **fire tower** on the ridge, and a logging alligator |
| **montreal** | city skyline, Mount Royal cross | rooftops, church spires | wrought-iron spiral staircases, market awnings | **the Plateau staircase** — the most Montreal shape there is |
| **quebec-city** | the escarpment and the river | the walls, Château roofline | stone street frontage, lamp posts | **Montmorency Falls**, full height, 83 m |
| **georgian-bay** | escarpment cliff line | orchard rows, bay horizon | apple trees, cedar rail fence | **the suspension bridge**, crossed in real time |

### 3.5 Weather

Only where the data justifies it. Muskoka's October wet-day rate is **48%** —
the highest of the five — so Muskoka's cost movement gets actual rain on the
glass. Quebec's is 35%. The others get cloud at most. Rain is a canvas layer,
not SVG, reusing the pointer-trail renderer.

---

## 4. Character blocking

Rules, not choreography — so they stay consistent across sixty screens.

- **A enters from the left, ahead of her.** He is always further along the path
  than she is. He is what she is following.
- **B is already there.** He never walks on. He is leaning on something at the
  right edge of frame, arms crossed, as though he arrived hours ago. The joke is
  that he keeps appearing on a trip he claims not to care about.
- **They only walk during transitions.** Inside a movement they stop, turn and
  talk. Walking while talking is how you make a cutscene nobody reads.
- **A points at things.** `pointL` / `pointR` fire on the photo reveals.
- **B moves once per trip**, in movement 5, and it lands because he has been
  still for four screens.
- **Movement 6 breaks every rule above.** They sit. No walking, no pointing.
  This is the only screen where they are both simply present.

---

## 5. Animation grammar

Six verbs. Everything on the site is one of these, so nothing feels invented.

| verb | trigger | what happens |
|---|---|---|
| **walk** | scroll between movements | parallax runs, legs cycle, hair trails |
| **arrive** | movement start, 20% into view | characters ease to a stop, overshoot, settle |
| **speak** | after arrive settles | bubble types, mouth squashes |
| **reveal** | photo block enters at 30% | mask wipes up, 600 ms, `--ease-out` |
| **note** | data callout enters | number counts up once, then never again |
| **leave** | movement exit | characters walk off, parallax carries them |

Sequencing is strict: **arrive → speak → reveal**. Overlapping them is what makes
sites feel busy. One thing at a time, and the scroll waits for nothing — if she
scrolls fast, everything snaps to its end state rather than queueing.

---

## 6. How the photos are shown

Three treatments, chosen by what the photo is for.

1. **The plate.** One photo, full width, edge to edge, in movements 4 and 7.
   Wipes up on reveal. No caption over the image — caption sits beneath, in mono.
2. **The strip.** Three to five photos in a horizontal scroller, at the stops
   inside a movement. Tap to enlarge.
3. **The proof.** A single small photo beside a factual claim in movement 5 —
   the closed venue, the hard climb, the parking sign. Photos as evidence.

Google's photos carry their photographer's name under every frame; that is a
condition of using them, not a design choice. The audit found only Muskoka
Heritage Place has none at all — which is a shame, because it is the steam
train, so that one gets the illustrated train instead of a plate.

---

## 7. The map

One per trip, in movement 1, drawn from **real coordinates** — all 31 towns were
resolved in Phase 0 and live in `data/coords.json`.

**What it shows:** Toronto as the origin, the route as a line through the real
stop positions, each night's base as a filled dot, distance and bearing.

**What it does NOT show:** coastlines, lakes or borders. There is no geographic
outline data in this project, and drawing Georgian Bay from memory would be
inventing exactly the kind of thing the rest of the build refuses to invent. So
the map is honest about being a **route diagram, not a chart** — real positions,
real bearings, no fake shoreline.

It draws itself as she arrives: the line traces from Toronto outward over about
1.2 seconds, dots landing as it passes them. On the "show me all five" screen the
same five routes fan out from one Toronto, which is the compass, and the two
north trips visibly overlap — which is the clearest possible way to say *these
two are the same direction, pick one*.

---

## 8. The five stories

Narration is what she reads. **A** and **B** are spoken. *Italics* are scene
direction.

A note on the spine: four of the five fit the seven movements exactly. **Georgian
Bay is one night, not two**, so its shape compresses — it is marked where it
differs rather than padded to match. Forcing it would be the kind of tidiness
that makes a site feel authored rather than true.

---

### 8.1 Muskoka — *the closest one*

**1 · Departure** — 18:00, dusk · 495 km round trip
> Friday, six o'clock. Two hours of highway, and the city stops being a thing
> that is happening to you.

**A** — "Two hours. That's nothing. We'll be there before it's properly dark."
**B** — "It will be properly dark."

*Map draws from Toronto, due north, bearing 0°. Geese cross right, heading south.*

**2 · First night** — 20:00–22:15, night
> Gravenhurst first, for beer in a room that used to be a sawmill town's idea of
> a Friday. Then Bracebridge, where there is a waterfall in the middle of town.

**B** — "You will walk to it at quarter past ten at night, and you will be the
only people there."
**A** — "That's the *good* part."
**B** — "I did not say it was a complaint."

*Stars in. Moon on the arc, waxing gibbous. The falls are the only lit thing.*

**3 · The morning** — 09:30, morning
> Saturday goes north. A pioneer village with a steam train that only runs
> Tuesday to Saturday — which is the entire reason Saturday is the north day.

**A** — "There's a steam train. An actual one. It's called the Portage Flyer."

*The illustrated train crosses the mid layer; its puff rises into the weather
layer and drifts. This stop has no Google photos — the drawing is the plate.*

**4 · The high point** — 15:00–18:00, afternoon → golden
> Arrowhead. Stubb's Falls first, then the Big Bend Lookout. Then Lions Lookout
> at six, because six is when the light goes.

**A** — "Six o'clock. We'll be standing at the top when it happens."

*Sun visibly low on its arc — from the file, not from us. Full-width plate.*

**5 · The cost** — colour drains
**B** — "Forty-eight percent of October days here see rain. That is the highest
of the five."
**B** — "Colour was at ten percent on the fourteenth of September. Peak is
Thanksgiving weekend — which is also the last weekend Muskoka Heritage Place
opens at all."
**B** — "So the weekend with the colour is the weekend the train stops."

*Rain on the glass, canvas layer. A is off-frame. This is the only trip that
gets real rain, because it is the only one whose number earns it.*

**6 · The making** — 12:30 Sunday, soft midday
> Sunday is Gravenhurst. A walking tour, the house where a doctor was born, and
> then two hours at a wheel.

**A** — "You make a thing. They fire it. It turns up three weeks later and
you've forgotten you made it."
**B** — "That is the only part of this weekend he has described accurately."

*Everything stops. No parallax, no birds. They sit.*

**7 · The road home** — 16:00, golden → dusk
> Four o'clock. Four hundred and ninety-five kilometres, there and back, and a
> bowl arriving in three weeks.

---

### 8.2 Algonquin & Haliburton — *the famous one*

**1 · Departure** — 18:00, dusk · 700 km round trip
> You drive past Bracebridge. You keep going.

**A** — "We're driving past the good one to get to the better one."
**B** — "Last week you said the other one was the good one."

*Route overlays Muskoka's in ghost — the same road for the first 180 km, then
past it. This is the north fork, stated visually before it is stated in words.*

**2 · First night** — 21:00, night
> Huntsville. The same Main Street the other trip reaches on Saturday afternoon,
> except you get to it on Friday and it is dark and mostly closed.

**3 · The morning** — 08:00, dawn → morning
> Eight o'clock at the West Gate. Highway 60 runs fifty-six kilometres through
> the park and everything hangs off it.

**A** — "The art centre is at kilometre twenty and admission is *voluntary*."
**B** — "He has been saying that word for a week."

*Kilometre markers tick past on the near layer as she scrolls — the corridor made
literal. Fire tower on the far ridge.*

**4 · The high point** — 10:30, morning
> The Lookout Trail is 2.1 kilometres and ends at a cliff edge over an ocean of
> maple. It is the photograph everyone has seen of Ontario.

**A** — "Two point one kilometres. That's twenty-five minutes."

*Full-width plate. Maple layered four deep in the far layer, each rank a shade
cooler, which is the only honest way to draw distance.*

**5 · The cost**
**B** — "Sugar maple peaks on the twenty-seventh of September. Your window is
October."
**B** — "You are booking the golden encore, not the red show."
**B** — "The park's own colour report names your weekend as one of the busiest of
the year. Trailhead parking fills early, and there is almost no food on the
corridor. Pack Saturday's lunch."
**B** — "And the day-use permit and the tower fee are estimates. Not quotes."

*Colour drains from the maples specifically — the exact thing the trip is for,
losing saturation while he speaks. Estimated numbers carry the provenance dot.*

**6 · The making** — Sunday
> Dorset first: a tower, 4.6 stars from 1,843 people. Then the Sculpture Forest,
> which is art in the actual woods and costs nothing. Then Blackbird.

**A** — "Five point zero. Thirty-four reviews, and not one of them is four."
**B** — "The price is not listed anywhere. You will have to call."

*Cost renders as **Call to confirm**, never as a guess.*

**7 · The road home** — 16:15, golden → dusk

---

### 8.3 Montreal — *the one that feels like abroad*

**1 · Departure** — 18:00, dusk · 1,150 km round trip
> Five hundred and forty-two kilometres. Friday night is not a preference here —
> leave Saturday morning and Saturday starts at two in the afternoon.

**B** — "That is not advice. That is subtraction."

*Bearing 90°, due east. The route line is noticeably longer than the north trips',
and the compass makes that unmissable.*

**2 · First night** — night
> You arrive late into a city that is still entirely awake.

*Skyline on the far layer, Mount Royal cross lit. Windows in the mid layer light
in a slow, irregular scatter — never in rows.*

**3 · The morning** — 09:00, morning
> Marché Jean-Talon at nine. The largest public market in North America, and it
> is a Saturday in autumn, which is the best possible day to be in one.

**A** — "Squash. There will be forty kinds of squash."

*Awnings on the near layer wipe past. Strip of photos.*

**4 · The high point** — 12:00–19:30, midday → evening
> Notre-Dame at noon: blue and gold, and the most photographed church interior in
> the country. Mount Royal at three, for the city from above. Then Saint-Denis —
> a manga café, and Korean food for dinner.

**A** — "Architecture, then a view, then a manga café, then Korean dinner. One
day. All of it."

*The one trip that scores on every interest at once, so the plate is a triptych
rather than a single image.*

**5 · The cost**
**B** — "Old Port parking is thirty-five dollars for three hours. Seventy for the
day."
**B** — "Park at Champ-de-Mars instead. Fifteen to twenty for the same stay."
**B** — "Or leave the car in Toronto. A bus for two costs about what renting and
fuelling one costs, and you get back eleven hours of your life."

*The car is drawn, then greyed out. Proof photos: the parking sign, the rates.*

**6 · The making** — 14:00 Sunday
> Introduction to Wheel Throwing, Studio Mie Kim. One hundred and fifty dollars,
> and the only booking on this trip that has a name attached.

**7 · The road home** — 16:45, golden → dusk
> Five and a half hours. You will be home very late, and it will have been worth
> it.

---

### 8.4 Quebec City — *eight hundred kilometres*

**1 · Departure** — 18:00 · 1,600 km round trip
> Eight hundred kilometres. Each way. This is the far one and it does not pretend
> otherwise.

**A** — "A walled city. An actual wall, still standing, that you can walk on."
**B** — "Eight hundred kilometres."
**A** — "...and a waterfall taller than Niagara."

*The travel cost is `null` in the file, so the map shows the distance and the
cost panel says **Call to confirm** — not a guess dressed as a number.*

**2 · First night** — night
> You arrive somewhere that stopped being Ontario several hundred kilometres ago.

**3 · The morning** — 09:00, morning
> Dufferin Terrace at nine, with the Château behind you and the river below. The
> only walled city north of Mexico, and you can walk it end to end before lunch.

**4 · The high point** — 10:15, morning → midday
> Petit-Champlain and Place Royale. Seventeenth-century stone, and you are
> standing in it rather than looking at a reconstruction of it.

**A** — "Four hundred years. Not gift-shop four hundred years. Actually four
hundred."

*Near layer is stone frontage and lamp posts, wiping past at full speed — the
narrowest street in the whole site, deliberately.*

**5 · The cost** — *the honest problem, full screen*
> This is the one the research argued with itself about.

**B** — "Four ways to do this. All four are laid out here, side by side."
**B** — "Flying is not the extravagant option. Driving sixteen hours across a
weekend is."
**B** — "The flight cost is a range, not a quote. It moves the total by several
hundred dollars, and no one can tell you which end until you look."
**B** — "So: fly, skip the rental, take the combined falls-and-island tour. Then
you never need a car."
**B** — "Also — the city is overwhelmingly French-speaking, and further from
English than Montreal. Neither of you speaks French."
**A** — "...I've got nothing."
**B** — "Write that down."

*The four-way table is the whole screen. The budget stays the range
**$1,150–$1,350** and is never averaged. This is the longest single stop in the
site, and the only screen where A is silent for more than one line.*

**6 · The making** — 16:30 Saturday
> Pottery at half four, then dinner inside the walls. Four operational studios in
> this city; you only need one.

**7 · The road home** — Sunday
> Montmorency first. Eighty-three metres — thirty metres taller than Niagara —
> with a footbridge across the top of it. Then Île d'Orléans: farms and
> three-hundred-year-old houses, fifteen minutes from the old town.

*The last full-width plate in the trip is the falls at full height, and the
viewport is tall enough that she has to scroll to reach the bottom of it. Eighty-
three metres should cost her a gesture.*

---

### 8.5 Beaver Valley & Georgian Bay — *the cheap one that is the best drive*

*One night, not two. The spine compresses: no Friday departure, and the night
sits in the middle instead of near the start.*

**1 · Departure** — 07:30 Saturday, **dawn** · 460 km round trip
> Half past seven on a Saturday morning. The only one of the five that starts
> with a sunrise instead of a sunset.

**A** — "Two hours. We'll be on a cliff by quarter to ten."

*The only dawn departure in the site — and because the sky is computed, it simply
is dawn. Bearing 315°, north-west.*

**2 · The climb** — 09:45, morning
> Old Baldy, from Kimberley. A cliff lookout over the Beaver Valley, and the best
> fall-colour drive in southern Ontario is the thing you drove to get here.

**B** — "Six kilometres. With real elevation. He has been calling it a stroll."
**A** — "It's a *scenic* stroll."

**3 · The falls** — 14:00, afternoon
> Eugenia Falls, then Inglis Falls on Sunday. Neither costs anything.

**4 · The high point** — 15:15, afternoon
> Scenic Caves. A suspension footbridge four hundred and twenty feet long, eighty-
> two feet above the forest floor, and Ontario's longest.

*She crosses it in real time. The bridge is the near layer and the forest floor
is the ground layer, and for the length of that screen the parallax gap between
them is exaggerated — the only place in the site where the depth lies, and it
lies to make eighty-two feet feel like eighty-two feet.*

**5 · The cost**
**B** — "Scenic Caves wants proper shoes and has limited parking. Arrive early or
do not arrive."
**B** — "And Blue Mountain village prices spike hard on colour weekends. Owen
Sound and Meaford do not, and they are twenty minutes away."

*Shortest cost movement of the five — because this trip genuinely has the least
wrong with it, and stretching it to match the others would be dishonest.*

**6 · The making** — 14:00 Sunday
> Hello Pottery Co. The price is not published.

**B** — "Call them."

**7 · The road home** — 16:00, golden → dusk
> Four hundred and sixty kilometres, one night, and almost none of it cost
> anything.

---

## 9. What this changes for Phase 3

The story spine is now the component spec, which is a better brief than the one
in §10 of `PREP.md`:

- `Movement` — the seven-movement container: sky range, parallax set, character
  blocking, one scroll-locked section
- `Scene` — the six parallax layers plus the per-world element set
- `Celestial` — sun/moon arc and stars, from `--sky-t`
- `Flock` — the geese
- `RouteMap` — real coordinates, no invented coastline
- `Plate` / `Strip` / `Proof` — the three photo treatments
- `CostMovement` — the drain, the provenance dots, the four-way table variant
- `MakingScreen` — the still one. No parallax, no birds, characters seated.

`StopCard` — the component §10 called "the hard one: 16 types, 22 optional keys" —
mostly dissolves. Stops are not cards in this design; they are beats inside a
movement. The 16 types map onto which layer set and which photo treatment the
beat uses, not onto sixteen card variants.
