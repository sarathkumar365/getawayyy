import type { Script, Authored } from "./kit";
import type { ArrivalLine } from "../corridor";

/**
 * Montreal — eight runs between seven stops.
 *
 * The only one where the driving is the price rather than the point: five and
 * a half hours each way, done on the Friday night, to buy a whole Saturday on
 * foot. So the runs between stops are short — most of them are a walk across a
 * few blocks, not a drive.
 */

const RUNS: Record<string, Authored> = {
  "montreal-t1": {
    title: "Five and a half hours east", terrain: "highway", amp: 300, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "This is the longest drive of the five, isn't it.", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "Five and a half hours. We get in around midnight.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Why are we doing that to ourselves?", face: { brow: "worried", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Because it buys a whole Saturday, and Saturday is all on foot.",
        face: { mouth: "smile" } },
    ],
  },
  "montreal-t2": {
    title: "Down to the old town", terrain: "town", amp: 120, climb: 2,
    beats: [
      { at: 0, voice: "sun", text: "I have eaten so much already.", face: { eye: "closed", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Largest public market in North America. That's what it's for.",
        face: { mouth: "smile" } },
    ],
  },
  "montreal-t3": {
    title: "Two streets over", terrain: "town", amp: 90, climb: 1,
    beats: [
      { at: 0, voice: "sun", text: "These cobbles are going to finish my ankles.",
        face: { brow: "worried", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "It's two streets. And the next room is the one you've seen in photographs.",
        face: { mouth: "smile" } },
    ],
  },
  "montreal-t4": {
    title: "Up the mountain", terrain: "town", amp: 160, climb: 22,
    beats: [
      { at: 0, voice: "sun", text: "Okay, that ceiling was worth thirty-two dollars.", face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Next is the skyline. Thirty steep minutes up from Peel Street, or we drive to the lot.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "We drive to the lot.", face: { brow: "flat", eye: "half", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "We drive to the lot.", face: { mouth: "smirk" } },
    ],
  },
  "montreal-t5": {
    title: "Into the Plateau", terrain: "town", amp: 140, climb: -12,
    beats: [
      { at: 0, voice: "sun", text: "That was the whole city in one photograph.", face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Spiral staircases next. On the outside of the buildings.", face: { mouth: "smile" } },
    ],
  },
  "montreal-t6": {
    title: "Round the corner", terrain: "town", amp: 90, climb: 0,
    beats: [
      { at: 0, voice: "sun", text: "Please tell me dinner is close.", face: { brow: "worried", eye: "closed", emote: "sweat" } },
      { at: 0, voice: "curse", text: "It's Korean, and it's round the corner.", face: { mouth: "smile" } },
    ],
  },
  "montreal-t7": {
    title: "Sunday, slowly", terrain: "town", amp: 150, climb: 3,
    beats: [
      { at: 0, voice: "sun", text: "Nothing before two o'clock. Nothing.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Bakeries, then the canal path. The studio's the only fixed thing today.",
        face: { mouth: "smile" } },
    ],
  },
  "montreal-t8": {
    title: "Five and a half hours back", terrain: "highway", amp: 320, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "Home at quarter past ten.", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "That's the deal with this one. The distance is the whole cost.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "I'd pay it again.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "montreal-d1-0900": [
    { voice: "sun", text: "It smells incredible in here.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "Breakfast is whatever you point at.", face: { mouth: "smile" } },
  ],
  "montreal-d1-1200": [
    { voice: "sun", text: "…Okay. Okay, that's blue.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Deep blue, gold stars. Most photographed room in the city.", face: { mouth: "smile" } },
  ],
  "montreal-d1-1500": [
    { voice: "sun", text: "There it all is.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "Kondiaronk. The postcard, from the postcard's spot.", face: { mouth: "smirk" } },
  ],
  "montreal-d1-1930": [
    { voice: "sun", text: "This is the bit I've been waiting for all day.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "I know. That's why it's in.", face: { mouth: "smile" } },
  ],
  "montreal-d2-1400": [
    { voice: "curse", text: "It's a class for people who have never touched clay. Everything's included.",
      face: { mouth: "smile" } },
    { voice: "sun", text: "Which is both of us.", face: { mouth: "grin" } },
  ],
};

export const MONTREAL: Script = { runs: RUNS, arrivals: ARRIVALS };
