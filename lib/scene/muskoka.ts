import { item, scatter, thinOut, type Strip } from "./strip";
import { MUSKOKA_OPENING } from "./muskoka-opening";

/**
 * Muskoka, all seven movements.
 *
 * Every factual claim in a B line comes from trips.json or the Phase 0 weather
 * pass. The prose is the same as STORY.md §8.1 — this is that story laid out as
 * distance, which is the only form the site can actually play.
 */

/* ---------------- 2 · first night ---------------- */
const W2 = 6200;
const NIGHT: Strip = {
  id: "muskoka-2-night",
  title: "2 · First night",
  terrain: "town",
  width: W2,
  clock: [
    { x: 0, time: "20:00" },
    { x: 3000, time: "21:20" },
    { x: W2, time: "22:15" },
  ],
  items: [
    ...scatter(120, 2200, 300, 70, 41).map((x) => item(x, "store")),
    ...scatter(200, 2400, 380, 40, 43).map((x) => item(x, "lamp")),
    ...scatter(1900, 3400, 340, 120, 47).map((x) => item(x, "pine", { s: 0.9 })),
    item(2600, "dashes", { to: W2 }),
    ...scatter(3200, W2, 250, 110, 53).map((x) => item(x, "pine")),
    ...scatter(3400, W2, 460, 140, 59).map((x) => item(x, "fartree", { s: 0.9 })),
    item(4200, "lake", { to: 5200, s: 0.9 }),
    item(4500, "dock", { s: 1 }),
    // the falls are the last thing, lit, with nobody else there
    item(5450, "falls", { s: 1.15 }),
    item(5150, "lamp", { s: 0.9 }),
    item(5750, "lamp", { s: 0.9 }),
  ],
  beats: [
    { x: 300, voice: "narrate", text: "There is beer first, in a room that was a sawmill town's idea of a Friday night long before it was yours.", hold: 640 },
    { x: 1500, voice: "narrate", text: "Then Bracebridge — and this is the part that is in no brochure.", hold: 560 },
    { x: 2600, voice: "narrate", text: "There is a waterfall in the middle of the town.", hold: 540 },
    { x: 3600, voice: "narrate", text: "You walk to it at quarter past ten at night. It is lit.", hold: 560 },
    { x: 4500, voice: "curse", text: "You will be the only people there.", hold: 520 },
    { x: 5100, voice: "sun", text: "That's the good part.", hold: 480 },
    { x: 5700, voice: "curse", text: "I did not say it was a complaint.", hold: 540 },
  ],
};

/* ---------------- 3 · the morning ---------------- */
const W3 = 6600;
const MORNING: Strip = {
  id: "muskoka-3-morning",
  title: "3 · The morning",
  terrain: "town",
  width: W3,
  clock: [
    { x: 0, time: "09:30" },
    { x: 3200, time: "12:30" },
    { x: W3, time: "13:45" },
  ],
  items: [
    item(0, "dashes", { to: 1400 }),
    ...scatter(200, 1500, 420, 90, 61).map((x) => item(x, "pine", { s: 0.85 })),
    // the pioneer village, and the train that decides which day is the north day
    item(1750, "store", { s: 1.1 }),
    item(2150, "train", { s: 1.7 }),
    item(2600, "store", { s: 1.05 }),
    ...scatter(1600, 2900, 330, 60, 67).map((x) => item(x, "lamp", { s: 0.85 })),
    // Main Street, then the murals — outdoors, on walls, free
    ...scatter(3300, 4600, 280, 60, 71).map((x) => item(x, "store")),
    ...scatter(3500, 4600, 360, 50, 73).map((x) => item(x, "lamp", { s: 0.85 })),
    ...scatter(4900, W3, 330, 90, 79).map((x) => item(x, "mural")),
    ...scatter(300, W3, 520, 180, 83).map((x) => item(x, "fartree", { s: 0.85 })),
  ],
  beats: [
    { x: 260, voice: "narrate", text: "Saturday goes north.", hold: 520 },
    { x: 1250, voice: "narrate", text: "Huntsville has a pioneer village with a steam train called the Portage Flyer,", hold: 620 },
    { x: 2200, voice: "narrate", text: "and the train only runs Tuesday to Saturday — which is the entire reason Saturday is the day you go north and not Sunday.", hold: 760 },
    { x: 3400, voice: "sun", text: "There's a steam train. An actual one.", hold: 520 },
    { x: 4250, voice: "narrate", text: "Lunch on Main Street afterwards,", hold: 520 },
    { x: 5250, voice: "narrate", text: "and then the Group of Seven murals, which are not in a gallery at all.", hold: 620 },
    { x: 6150, voice: "narrate", text: "They are outdoors, on walls, where anyone walking past gets them for nothing.", hold: 680 },
  ],
};

/* ---------------- 4 · the high point ---------------- */
const W4 = 7600;
const HIGH: Strip = {
  id: "muskoka-4-high",
  title: "4 · The high point",
  terrain: "forest",
  width: W4,
  clock: [
    { x: 0, time: "15:00" },
    { x: 4200, time: "16:40" },
    { x: W4, time: "18:00" },
  ],
  items: [
    ...scatter(100, W4, 190, 90, 89).map((x) => item(x, "pine")),
    ...scatter(300, W4, 260, 120, 97).map((x) => item(x, "maple", { s: 0.95 })),
    ...scatter(200, W4, 520, 200, 101).map((x) => item(x, "fartree", { s: 0.9 })),
    ...scatter(600, 3000, 900, 200, 103).map((x) => item(x, "neartree", { s: 0.9 })),
    item(1650, "falls", { s: 1.25 }),          // Stubb's Falls
    item(4100, "cliff", { s: 1 }),             // Big Bend Lookout
    item(6900, "farhill", { s: 1.1 }),
    item(6600, "cliff", { s: 1.15 }),          // Lions Lookout, at six
  ],
  beats: [
    { x: 300, voice: "narrate", text: "By three you are in Arrowhead.", hold: 520 },
    { x: 1500, voice: "narrate", text: "Stubb's Falls first,", hold: 480 },
    { x: 2600, voice: "narrate", text: "then the Big Bend Lookout, and you will be tired in the good way rather than the other one.", hold: 700 },
    { x: 4400, voice: "narrate", text: "And at six you are standing at Lions Lookout,", hold: 580 },
    { x: 5500, voice: "narrate", text: "because six is when the light goes, and everybody who knows this place knows to be there when it does.", hold: 760 },
    { x: 6800, voice: "sun", text: "Six o'clock. We'll be standing at the top when it happens.", hold: 600 },
  ],
};

/* ---------------- 5 · the cost ---------------- */
const W5 = 5600;
const COST: Strip = {
  id: "muskoka-5-cost",
  title: "5 · What it costs",
  terrain: "highway",
  width: W5,
  clock: [
    { x: 0, time: "11:00" },
    { x: W5, time: "12:00" },
  ],
  items: [
    item(0, "dashes", { to: W5 }),
    item(200, "guardrail", { to: W5 - 200 }),
    // deliberately sparse: the world empties out while he talks
    ...scatter(300, W5, 620, 200, 107).map((x) => item(x, "pine", { s: 0.8 })),
    ...scatter(500, W5, 900, 260, 109).map((x) => item(x, "fartree", { s: 0.75 })),
  ],
  beats: [
    { x: 400, voice: "curse", text: "Forty-eight percent of October days here see rain. That is the highest of the five.", hold: 700 },
    { x: 1500, voice: "curse", text: "Colour was at ten percent on the fourteenth of September.", hold: 620 },
    { x: 2500, voice: "curse", text: "Peak is Thanksgiving weekend — which is also the last weekend Muskoka Heritage Place opens at all.", hold: 780 },
    { x: 3700, voice: "curse", text: "So the weekend with the colour is the weekend the train stops.", hold: 700 },
    { x: 4800, voice: "sun", text: "The pottery booking is confirmed, though. That one is real.", hold: 640 },
  ],
};

/* ---------------- 6 · the making ---------------- */
const W6 = 3600;
const MAKING: Strip = {
  id: "muskoka-6-making",
  title: "6 · The making",
  terrain: "indoor",
  width: W6,
  clock: [
    { x: 0, time: "12:30" },
    { x: W6, time: "14:30" },
  ],
  items: [
    item(1750, "studio", { s: 1.25 }),
    ...scatter(200, 1200, 420, 60, 113).map((x) => item(x, "store", { s: 0.85 })),
    ...scatter(2500, W6, 440, 70, 127).map((x) => item(x, "store", { s: 0.85 })),
  ],
  beats: [
    { x: 260, voice: "narrate", text: "Sunday is slower, deliberately.", hold: 520 },
    { x: 900, voice: "narrate", text: "Coffee at the wharf. A walking tour of a town that has not changed much. The house where a doctor was born who became famous somewhere else entirely.", hold: 820 },
    { x: 1900, voice: "narrate", text: "And then two hours at a pottery wheel, which is what this whole weekend has quietly been for.", hold: 760 },
    { x: 2700, voice: "sun", text: "You make a thing. They fire it. It turns up three weeks later and you've forgotten you made it.", hold: 720 },
    { x: 3400, voice: "curse", text: "That is the only part of this weekend he has described accurately.", hold: 680 },
  ],
};

/* ---------------- 7 · the road home ---------------- */
const W7 = 6400;
const HOME: Strip = {
  id: "muskoka-7-home",
  title: "7 · The road home",
  terrain: "highway",
  width: W7,
  clock: [
    { x: 0, time: "16:00" },
    { x: 3600, time: "17:40" },
    { x: W7, time: "18:40" },
  ],
  items: [
    item(0, "dashes", { to: W7 }),
    item(200, "guardrail", { to: 4200 }),
    ...scatter(200, 4000, 240, 110, 131).map((x) => item(x, "pine")),
    ...scatter(300, 4200, 520, 180, 137).map((x) => item(x, "fartree", { s: 0.85 })),
    item(1500, "sign", { label: "11" }),
    item(3300, "sign", { s: 0.92, label: "S" }),
    // the city comes back the way it left: gaps closing instead of opening
    ...thinOut(4200, W7, 720, 140).map((x) => item(x, "lamp")),
    ...thinOut(4600, W7, 700, 150).map((x) => item(x, "block", { s: 0.86 })),
  ],
  beats: [
    { x: 300, voice: "narrate", text: "Then a late lunch and home by evening.", hold: 560 },
    { x: 1600, voice: "narrate", text: "Four hundred and ninety-five kilometres, there and back,", hold: 620 },
    { x: 2900, voice: "narrate", text: "and a bowl arriving in three weeks.", hold: 600 },
    { x: 4400, voice: "narrate", text: "The streetlights come back one at a time, in the order they left.", hold: 680 },
    { x: 5900, voice: "narrate", text: "That was the closest one.", hold: 640 },
  ],
};

export const MUSKOKA_MOVEMENTS: readonly Strip[] = [
  { ...MUSKOKA_OPENING, title: "1 · Departure", terrain: "city" },
  NIGHT, MORNING, HIGH, COST, MAKING, HOME,
];
