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

These are written to be **read straight through**. No stage directions in the
flow — those live in a staging note at the end of each one. If it does not read
as a story here, it will not read as a story on the screen either, because this
prose *is* the screen: it is what Anjali actually reads as she scrolls, and the
two voices are what she hears.

---

### 8.1 Muskoka — *the closest one*

You leave at six on Friday and watch the city let go of you in pieces — the last
of the traffic, then the last of the streetlights, then nothing but highway. It
takes two hours.

**A** — "Two hours. That's nothing. We'll be there before it's properly dark."
**B** — "It will be properly dark."

He is right. By the time you reach Gravenhurst it is fully dark and the air has
changed, the way it does when you have left a city without noticing the moment
you did it.

There is beer first, in a room that was a sawmill town's idea of a Friday night
long before it was yours. Then Bracebridge — and this is the part that is in no
brochure. There is a waterfall in the middle of the town. You walk to it at
quarter past ten at night. It is lit, and you are the only two people there.

**B** — "You will be the only people there."
**A** — "That's the *good* part."
**B** — "I did not say it was a complaint."

Saturday goes north. Huntsville has a pioneer village with a steam train called
the Portage Flyer, and the train only runs Tuesday to Saturday — which is the
entire reason Saturday is the day you go north and not Sunday. Lunch on Main
Street afterwards, and then the Group of Seven murals, which are not in a gallery
at all. They are outdoors, on walls, where anyone walking past gets them for
nothing.

By three you are in Arrowhead. Stubb's Falls first, then the Big Bend Lookout,
and you will be tired in the good way rather than the other one. And at six you
are standing at Lions Lookout, because six is when the light goes, and everybody
who knows this place knows to be there when it does.

**A** — "Six o'clock. We'll be standing at the top when it happens."

Sunday is slower, deliberately. Coffee at the wharf. A walking tour of a town
that has not changed much. The house where a doctor was born who became famous
somewhere else entirely. And then two hours at a pottery wheel, which is what
this whole weekend has quietly been for.

**A** — "You make a thing. They fire it. It turns up three weeks later and you've
forgotten you made it."
**B** — "That is the only part of this weekend he has described accurately."

Then a late lunch and home by evening. Four hundred and ninety-five kilometres,
there and back, and a bowl arriving in three weeks.

What it costs you: this is the wettest of the five — forty-eight percent of
October days here see rain. And the colour and the train do not line up. Peak is
around Thanksgiving, which is also the last weekend the pioneer village opens at
all. You will probably get one or the other.

**B** — "So the weekend with the colour is the weekend the train stops."

*Staging — 1 map draws north, bearing 0°, geese crossing south · 2 stars in,
waxing gibbous, the falls the only lit thing · 3 the illustrated steam train
crosses mid-layer, its puff drifting into the weather layer; this stop has no
Google photos, so the drawing is the plate · 4 full-width plate, sun visibly low
from the file · 5 real rain on the glass, canvas layer, A off-frame — the only
trip whose number earns it · 6 everything stops, no parallax, no birds, they sit
· 7 golden into dusk, they walk off right.*

---

### 8.2 Algonquin & Haliburton — *the famous one*

You drive past Bracebridge. You keep going.

**A** — "We're driving past the good one to get to the better one."
**B** — "Last week you said the other one was the good one."

It is the same road as the other northern trip for the first hundred and eighty
kilometres, and then it is not, and that is the whole decision in one sentence.
You get to Huntsville late, to a Main Street that the other trip reaches on
Saturday afternoon — except you arrive on a Friday night when it is dark and
mostly closed, which is a different town entirely.

Saturday starts at eight at the West Gate. Highway 60 runs fifty-six kilometres
through the park and everything hangs off it like beads on a wire. The art centre
is at kilometre twenty and the admission is voluntary.

**A** — "*Voluntary.*"
**B** — "He has been saying that word for a week."

At half ten you walk the Lookout Trail. It is 2.1 kilometres and it ends at a
cliff edge above what is, from up there, an ocean of maple going in every
direction at once. It is the photograph everyone has seen of Ontario, and you
will be standing in the place it was taken from.

Then a boardwalk over a spruce bog, which sounds like nothing and is not. Then
the Logging Museum, where there is a steam-powered amphibious machine called an
alligator that was built to drag timber across lakes, and which is exactly as
strange as that sounds. Then Booth's Rock at quarter past four, and dinner back
in Huntsville.

Sunday comes home the long way. A tower at Dorset first — 4.6 stars from 1,843
people, which is the sort of number that means it is genuinely worth the climb.
Then the Sculpture Forest, which is art standing in actual woods and costs
nothing at all. Then Blackbird, and the wheel.

**A** — "Five point zero. Thirty-four reviews and not one of them is a four."
**B** — "The price is not listed anywhere. You will have to call."

What it costs you: sugar maple peaks on the twenty-seventh of September, and your
window is October. You are booking the golden encore, not the red show. The
park's own colour report names your weekend as one of the busiest of the year, so
trailhead parking fills early. There is almost no food on the corridor — pack
Saturday's lunch. And the permit and tower fees are estimates rather than quotes.

**B** — "Everything I just said is in the file. None of it is me being difficult."

*Staging — 1 route overlays Muskoka's in ghost for 180 km, so the north fork is
shown before it is explained · 3 kilometre markers tick past on the near layer,
fire tower on the far ridge · 4 full-width plate, maple layered four ranks deep,
each cooler than the last · 5 colour drains from the maples specifically, and
estimated numbers carry the provenance dot · 6 the still screen · 7 down through
Dorset at golden hour.*

---

### 8.3 Montreal — *the one that feels like abroad*

Five hundred and forty-two kilometres, and Friday night is not a preference. Leave
on Saturday morning instead and Saturday begins at two in the afternoon, which is
not a weekend, it is a long drive with a meal at the end.

**B** — "That is not advice. That is subtraction."

So you go on Friday, and you arrive late into a city that is still entirely awake,
which is its own kind of welcome.

Saturday begins at Marché Jean-Talon at nine — the largest public market in North
America, on a Saturday, in autumn, which is the best possible combination of those
three things.

**A** — "There will be forty kinds of squash. I've checked."

Then Old Montreal on foot, where the streets are stone and the buildings are
seventeenth to nineteenth century and nobody had to restore them into looking that
way. At noon, Notre-Dame: blue and gold, and the most photographed church interior
in the country, which you will understand about four seconds after walking in.

Lunch at the Old Port. Then at three you go up Mount Royal to the Kondiaronk
Belvedere and look at the whole city at once, which is the moment the trip stops
being a list of places and becomes a city you have been to.

And then the evening is entirely hers: the Plateau, the spiral staircases, a manga
café on Saint-Denis, and Korean food for dinner.

**A** — "Architecture, then a view, then a manga café, then Korean dinner. One
day. All of it."

He is not exaggerating. This is the only one of the five that scores on every
single thing she said she liked, at the same time.

Sunday is breakfast, a last walk, and then the wheel at two — Introduction to
Wheel Throwing, a hundred and fifty dollars, and the only booking on this trip
that comes with a person's name attached to it. Then home, five and a half hours,
arriving very late.

What it costs you: the car becomes a liability the moment you arrive. Old Port
parking is thirty-five dollars for three hours and seventy for the day.

**B** — "Park at Champ-de-Mars instead. Fifteen to twenty for the same stay."
**B** — "Or leave the car in Toronto entirely. A bus for two costs about what
renting and fuelling one costs, and you get back eleven hours of your life."

*Staging — 1 bearing 90°, and the route line is visibly longer than the northern
ones · 2 skyline on the far layer, Mount Royal cross lit, windows lighting in an
irregular scatter, never in rows · 3 market awnings wipe past on the near layer,
photo strip · 4 a triptych plate rather than one image, because this is the only
trip that hits everything at once · 5 the car is drawn and then greyed out; proof
photos are the parking signs · 6 the still screen · 7 dusk, and a long way to go.*

---

### 8.4 Quebec City — *eight hundred kilometres*

Eight hundred kilometres. Each way. This is the far one and it does not pretend
to be anything else.

**A** — "A walled city. An actual wall, still standing, that you can walk on."
**B** — "Eight hundred kilometres."
**A** — "...and a waterfall taller than Niagara."

You arrive somewhere that stopped being Ontario several hundred kilometres ago,
and on Saturday morning at nine you stand on Dufferin Terrace with the Château
behind you and the river a long way below. It is the only walled city north of
Mexico and you can walk the whole of it before lunch.

Then down into Petit-Champlain and Place Royale, where the stone is seventeenth
century and you are standing in it rather than looking at a careful reconstruction
of it.

**A** — "Four hundred years. Not gift-shop four hundred years. Actually four
hundred."

Lunch on Rue Saint-Jean, where — and this genuinely was not planned — there is a
Korean street-food counter inside the old town walls. The afternoon is the
fortifications and the Plains of Abraham. At half four, the wheel. Then dinner
inside the walls, in a city that does dinner properly.

Sunday is the water. Montmorency Falls first: eighty-three metres, which is thirty
metres taller than Niagara, with a footbridge straight across the top of it. Then
Île d'Orléans, fifteen minutes away — farms, cider houses, and houses that have
been standing for three hundred years — and then the long way home.

What it costs you is the whole reason this one is hard, and it deserves saying
properly.

**B** — "There are four ways to do this trip. All four are laid out here, side by
side."
**B** — "Flying is not the extravagant option. Driving sixteen hours across a
weekend is."
**B** — "And the flight cost is a range, not a quote. It moves the total by
several hundred dollars, and nobody can tell you which end until you look."
**B** — "So: fly, skip the rental, take the combined falls-and-island tour. Then
you never need a car at all."
**B** — "Also — the city is overwhelmingly French-speaking, and further from
English than Montreal is. Neither of you speaks French."
**A** — "...I've got nothing."
**B** — "Write that down."

*Staging — 1 the travel cost is null in the file, so the panel says Call to
confirm and never guesses · 4 the narrowest near layer in the site: stone
frontage and lamp posts wiping past at full speed · 5 the four-way table is the
entire screen, the budget stays the range $1,150–$1,350 and is never averaged,
and it is the only screen where A is silent for more than a line · 7 the last
plate is the falls at full height, tall enough that she has to scroll to reach the
bottom — eighty-three metres should cost her a gesture.*

---

### 8.5 Beaver Valley & Georgian Bay — *the cheap one that is the best drive*

This one is a single night, and it starts at half past seven on a Saturday
morning, which makes it the only one of the five that begins with a sunrise
instead of a sunset.

**A** — "Two hours. We'll be standing on a cliff by quarter to ten."

He is right, and the cliff is Old Baldy, above the Beaver Valley, and the drive
you took to get there is the best fall-colour drive in southern Ontario. You did
the scenic part before you arrived without noticing you were doing it.

**B** — "Six kilometres. With real elevation. He has been calling it a stroll."
**A** — "It's a *scenic* stroll."

Lunch in Kimberley or Flesherton, then Eugenia Falls, which costs nothing. And
then at quarter past three, Scenic Caves — where there is a suspension footbridge
four hundred and twenty feet long, hanging eighty-two feet above the forest floor,
and it is the longest in Ontario. You walk across it. That is the whole activity
and it is entirely enough.

The evening is Thornbury, a working harbour town, and dinner somewhere along the
bay.

Sunday is water and the long way round: Inglis Falls at nine, then Irish Mountain
Lookout at eleven, which puts the bay, the orchards and the escarpment into a
single frame. Lunch in Meaford. The wheel at two. Home by evening.

**B** — "The pottery price is not published either. Call them."

Four hundred and sixty kilometres, one night, and almost none of it costs
anything at all.

What it costs you is genuinely the least of the five. Scenic Caves wants proper
shoes and has limited parking, so arrive early or do not arrive. And Blue Mountain
village prices spike hard on colour weekends — Owen Sound and Meaford are twenty
minutes away and do not.

*Staging — this trip is one night, so the seven movements compress and the night
sits in the middle rather than near the start; that is marked rather than padded
· 1 the only dawn departure in the site, and because the sky is computed it simply
is dawn · 4 she crosses the bridge in real time, and for the length of that screen
the parallax gap between the bridge and the forest floor is exaggerated — the only
place in the site where the depth deliberately lies, and it lies to make eighty-two
feet feel like eighty-two feet · 5 the shortest cost movement of the five, because
stretching it to match the others would be dishonest.*


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
