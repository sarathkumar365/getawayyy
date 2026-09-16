import type { Script, Authored } from "./kit";
import type { ArrivalLine } from "../corridor";

/**
 * Beaver Valley & Georgian Bay — eight runs between seven stops.
 *
 * The one that leaves at half seven in the morning and gets a whole day for
 * it. Escarpment, cliffs, a suspension bridge she has opinions about, and a
 * harbour town at sunset.
 */

const RUNS: Record<string, Authored> = {
  "georgian-bay-t1": {
    title: "Half seven, out the door", terrain: "highway", amp: 330, climb: 8,
    beats: [
      { at: 0, voice: "sun", text: "Half seven. On a Saturday.", face: { brow: "worried", eye: "closed", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Two and a quarter hours, and then the whole day is ours.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "What's first?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "A cliff above a village. It's the photograph of the valley.", face: { mouth: "smile" } },
    ],
  },
  "georgian-bay-t2": {
    title: "Lunch in a village", terrain: "forest", amp: 240, climb: -10,
    beats: [
      { at: 0, voice: "sun", text: "My legs are shaking.", face: { brow: "worried", eye: "closed", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Two and three quarter hours on the escarpment will do that. Lunch is a general store.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "A general store. Perfect.", face: { mouth: "grin" } },
    ],
  },
  "georgian-bay-t3": {
    title: "To the caves", terrain: "forest", amp: 210, climb: 12,
    beats: [
      { at: 0, voice: "curse", text: "Next one has a suspension bridge. Four hundred and twenty feet across.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "How high?", face: { brow: "worried", eye: "wide" } },
      { at: 0, voice: "curse", text: "Eighty-two feet above the forest.", face: { eye: "half", mouth: "smirk" } },
    ],
  },
  "georgian-bay-t4": {
    title: "Down to the bay", terrain: "town", amp: 260, climb: -14,
    beats: [
      { at: 0, voice: "sun", text: "I did cross it. I want that noted.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0, voice: "curse", text: "Noted. Harbour town next, and the sun goes down over the water from the pier.",
        face: { mouth: "smile" } },
    ],
  },
  "georgian-bay-t5": {
    title: "The night", terrain: "town", amp: 180, climb: 3,
    beats: [
      { at: 0, voice: "sun", text: "That pier was the best part of the day.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Waterfall in the morning. Then one lookout, then home the long way.",
        face: { mouth: "closed" } },
    ],
  },
  "georgian-bay-t6": {
    title: "Up to the lookout", terrain: "forest", amp: 220, climb: 14,
    beats: [
      { at: 0, voice: "curse", text: "This one's roadside. You can see it from the car.", face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Say that again, slowly.", face: { brow: "raised", eye: "half", mouth: "smirk" } },
    ],
  },
  "georgian-bay-t7": {
    title: "Into Collingwood", terrain: "town", amp: 200, climb: -6,
    beats: [
      { at: 0, voice: "sun", text: "Bay on one side, orchards on the other. That was one frame.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Lunch on the old main street, and the pottery studio is on the same street.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "So no driving between them.", face: { mouth: "smile" } },
    ],
  },
  "georgian-bay-t8": {
    title: "Home", terrain: "highway", amp: 340, climb: -8,
    beats: [
      { at: 0, voice: "sun", text: "Two hours back and I have clay under my nails.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0, voice: "curse", text: "Closest of the five, as well. It's the one you could do twice.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Then we do it twice.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "georgian-bay-d1-0945": [
    { voice: "sun", text: "Stop. Look down.", face: { eye: "wide", mouth: "open" } },
    { voice: "curse", text: "Old Baldy. Limestone, and the village is straight below.", face: { mouth: "smile" } },
    { voice: "sun", text: "That drop is real, isn't it.", face: { brow: "worried", eye: "wide", emote: "sweat" } },
  ],
  "georgian-bay-d1-1400": [
    { voice: "sun", text: "Thirty metres, straight into the gorge.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "And a two-minute walk from the car, for once.", face: { mouth: "smirk" } },
  ],
  "georgian-bay-d1-1515": [
    { voice: "sun", text: "I'm not looking down. I'm crossing, but I'm not looking down.",
      face: { brow: "worried", eye: "closed", mouth: "grimace", emote: "sweat" } },
    { voice: "curse", text: "Three hundred and sixty degrees, if you ever open your eyes.", face: { mouth: "smirk" } },
  ],
  "georgian-bay-d1-1730": [
    { voice: "curse", text: "Fish ladder, pier, cider. Sun goes down over the bay from here.", face: { mouth: "smile" } },
    { voice: "sun", text: "We're not moving for an hour.", face: { eye: "closed", mouth: "smile" } },
  ],
  "georgian-bay-d2-0900": [
    { voice: "sun", text: "Eighteen metres, over the edge of the escarpment.", face: { eye: "wide", mouth: "grin" } },
  ],
};

export const GEORGIAN_BAY: Script = { runs: RUNS, arrivals: ARRIVALS };
