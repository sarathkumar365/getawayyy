import { item, scatter, thinOut, type Strip } from "./strip";

/**
 * Muskoka, movement 1 — leaving Toronto.
 *
 * The sequence the prose describes, laid out as real distance:
 *   0–1500   city: blocks shoulder to shoulder, a streetlight every 130
 *   1500–3600 the thinning: gaps grow from 150 to 900, blocks give out first
 *   ~3500    THE LAST STREETLIGHT
 *   3600–6200 highway: guardrail, dashes, a sign, dark trees, nothing else
 *   6200–7200 the lake arrives, and the first pines
 *   7200–8400 Gravenhurst: low warm frontages
 *
 * Items sit roughly half a viewport RIGHT of the beat they belong to, because a
 * thing is at the centre of the screen after the strip has travelled past it.
 * The last streetlight is at 3500 and its line peaks at 2950 for exactly that
 * reason.
 */

const CITY_END = 1500;
const THIN_END = 3200;   // the last streetlight lands just under this
const HIGHWAY_END = 6200;
const LAKE_END = 7200;
const WIDTH = 8400;

export const MUSKOKA_OPENING: Strip = {
  id: "muskoka-opening",
  width: WIDTH,
  clock: [
    { x: 0, time: "18:00" },
    { x: 3600, time: "19:05" },
    { x: 6200, time: "19:55" },
    { x: WIDTH, time: "20:30" },
  ],
  items: [
    // --- city blocks, dense then gone ---
    ...scatter(60, CITY_END, 120, 40, 11).map((x, i) => item(x, "block", { s: 1, y: 0, flip: i % 2 === 0 })),
    ...thinOut(CITY_END, 2900, 190, 620).map((x) => item(x, "block", { s: 0.86 })),

    // --- streetlights: the thing the sentence is about ---
    ...scatter(40, CITY_END, 130, 18, 5).map((x) => item(x, "lamp")),
    ...thinOut(CITY_END, THIN_END, 150, 820).map((x) => item(x, "lamp")),

    // --- highway furniture ---
    item(4150, "sign", { s: 1 }),
    item(5580, "sign", { s: 0.92 }),

    // --- far treeline, arriving as the city leaves ---
    ...scatter(2600, WIDTH, 260, 120, 23).map((x) => item(x, "fartree", { s: 0.8 })),

    // --- pines once you are properly out ---
    ...scatter(5900, WIDTH, 210, 90, 31).map((x) => item(x, "pine", { s: 1 })),

    // --- the town at the end ---
    ...scatter(LAKE_END + 80, WIDTH - 60, 250, 60, 17).map((x) => item(x, "store")),
    ...scatter(LAKE_END + 140, WIDTH - 60, 320, 40, 19).map((x) => item(x, "lamp")),
  ],
  beats: [
    { x: 240, voice: "narrate", text: "You leave at six on Friday", hold: 560 },
    { x: 1250, voice: "narrate", text: "and watch the city let go of you in pieces —", hold: 560 },
    { x: 2050, voice: "narrate", text: "the last of the traffic,", hold: 500 },
    { x: 2950, voice: "narrate", text: "then the last of the streetlights,", hold: 520 },
    { x: 3950, voice: "narrate", text: "then nothing but highway.", hold: 560 },
    { x: 4850, voice: "narrate", text: "It takes two hours.", hold: 540 },
    { x: 5650, voice: "sun", text: "Two hours. That's nothing. We'll be there before it's properly dark.", hold: 560 },
    { x: 6350, voice: "curse", text: "It will be properly dark.", hold: 520 },
    {
      x: 7450, voice: "narrate", hold: 780,
      text: "He is right. By the time you reach Gravenhurst it is fully dark and the air has changed, the way it does when you have left a city without noticing the moment you did it.",
    },
  ],
};

export const RANGES = { CITY_END, THIN_END, HIGHWAY_END, LAKE_END, WIDTH };
