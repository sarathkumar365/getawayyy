import type { Script, Authored } from "./kit";
import { MUSKOKA_COUNTRY, MUSKOKA_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * North — Huntsville & Dorset. Thirteen runs between twelve stops.
 *
 * They are the couple. There is no narrator: every line is spoken by one of
 * them, and the facts arrive the way facts arrive between two people who are
 * actually in the car. "Two hours, you'll be asleep before Barrie" IS the
 * drive time out of trips.json.
 */

const RUNS: Record<string, Authored> = {
  "muskoka-t1": {
    title: "Out of the city", terrain: "city", amp: 300, climb: 7,
    beats: [
      { at: 0.12, voice: "curse", text: "Right. Six o'clock, Friday. Two hours of this.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "And tonight we do what?",
        face: { brow: "raised", eye: "open" } },
      { at: 0.68, voice: "curse", text: "Nothing. Tonight is getting there. Tomorrow starts at half eight.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The buildings stop after Barrie, don't they.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Stop is the word. One minute it's warehouses, the next it's rock and pine.",
        face: { mouth: "closed" } },
      { at: 0.92, voice: "sun", text: "Wake me up for that bit.",
        face: { eye: "closed", mouth: "smile" } },
    ],
  },
  "muskoka-t2": {
    title: "Saturday, north", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0.12, voice: "sun", text: "I have a bag of butter tarts and it's not even ten.",
        face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.42, voice: "curse", text: "Thirty-five minutes to Huntsville. They'll last.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "They cut the road straight through that rock.",
        face: { eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "Blasted it. The vertical scores are the drill holes — same rock the whole way up.",
        face: { mouth: "smile" } },
      { at: 0.90, voice: "sun", text: "They won't.", face: { mouth: "grin" } },
    ],
  },
  "muskoka-t3": {
    title: "Lunch, then the reserve", terrain: "forest", amp: 240, climb: 14, wet: true,
    beats: [
      { at: 0.06, voice: "sun", text: "A path that floats. On the lake. I didn't believe you.",
        face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.18, voice: "curse", text: "Lunch on Main Street, then east into the reserve.",
        face: { mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "Oh no. It's started raining.", face: { brow: "worried", eye: "wide", mouth: "open" } },
      { at: 0.54, voice: "curse", text: "It'll pass. It always does up here.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every second driveway has a canoe on a rack.",
        face: { brow: "raised", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Nobody up here keeps one indoors. There's a lake at the end of most of them.",
        face: { mouth: "smile" } },
      { at: 0.88, voice: "sun", text: "How far round is this lake?",
        face: { brow: "furrowed", eye: "half" } },
    ],
  },
  "muskoka-t4": {
    title: "Out to Aspdin Road", terrain: "forest", amp: 200, climb: 6,
    beats: [
      { at: 0.16, voice: "sun", text: "My boots are soaked. Worth it.", face: { mouth: "grin" } },
      { at: 0.52, voice: "curse", text: "The nursery next. We'll be back at the same gate tonight.",
        face: { mouth: "smile" } },
      { at: 0.86, voice: "sun", text: "Why twice?", face: { brow: "raised", eye: "open" } },
    ],
  },
  "muskoka-t5": {
    title: "Dinner, early", terrain: "town", amp: 110, climb: 2,
    beats: [
      { at: 0.20, voice: "curse", text: "Because tonight the forest is lit. Dinner first. We're in at five.",
        face: { mouth: "smirk" } },
      { at: 0.60, voice: "sun", text: "Five is afternoon.", face: { brow: "flat", eye: "half" } },
      { at: 0.88, voice: "curse", text: "Five is the only way the sunset fits.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t6": {
    title: "Up the hill", terrain: "town", amp: 120, climb: 16,
    beats: [
      { at: 0.18, voice: "sun", text: "That was the best meal of the year and you rushed me through dessert.",
        face: { brow: "furrowed", mouth: "grimace" } },
      { at: 0.56, voice: "curse", text: "Sun goes at twenty to seven. Five minutes up the hill.",
        face: { mouth: "closed" } },
      { at: 0.90, voice: "sun", text: "…Fine. Walk faster.", face: { eye: "half", mouth: "smirk" } },
    ],
  },
  "muskoka-t7": {
    title: "Into the dark", terrain: "forest", amp: 220, climb: 4,
    beats: [
      { at: 0.14, voice: "sun", text: "I'll say it. It was worth it.", face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.44, voice: "curse", text: "I'll take that.", face: { mouth: "smirk" } },
      { at: 0.76, voice: "sun", text: "Back to the nursery? In the pitch dark?", face: { brow: "raised", eye: "wide" } },
      { at: 0.94, voice: "curse", text: "That's the point of it.", face: { mouth: "smile" } },
    ],
  },
  "muskoka-t8": {
    title: "South, late", terrain: "highway", amp: 320, climb: -4,
    beats: [
      { at: 0.14, voice: "sun", text: "I'm going to be thinking about those trees all week.",
        face: { eye: "closed", mouth: "smile" } },
      { at: 0.46, voice: "curse", text: "One more. On the way. It's free and it's in the middle of Bracebridge.",
        face: { mouth: "smile" } },
      { at: 0.82, voice: "sun", text: "You said that about the hill as well.",
        face: { brow: "flat", mouth: "grimace" } },
    ],
  },
  "muskoka-t9": {
    title: "Lake of Bays, early", terrain: "highway", amp: 300, climb: 10,
    beats: [
      { at: 0.16, voice: "sun", text: "It's still dark-ish. Why is it still dark-ish.",
        face: { brow: "worried", eye: "half", mouth: "sad" } },
      { at: 0.50, voice: "curse", text: "Because by ten the tower car park is full. Everyone had the same idea.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "The white ones have gone completely gold.",
        face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.90, voice: "curse", text: "Golden encore. The reds went last week.", face: { mouth: "smile" } },
    ],
  },
  "muskoka-t10": {
    title: "Down to the rock", terrain: "forest", amp: 120, climb: -8,
    beats: [
      { at: 0.24, voice: "sun", text: "There's a boardwalk right at the bottom.", face: { brow: "raised", eye: "open" } },
      { at: 0.70, voice: "curse", text: "Zero detour. I checked.", face: { mouth: "smirk" } },
    ],
  },
  "muskoka-t11": {
    title: "Back west", terrain: "highway", amp: 280, climb: -4,
    beats: [
      { at: 0.18, voice: "sun", text: "Another waterfall.", face: { brow: "raised", mouth: "smile" } },
      { at: 0.50, voice: "curse", text: "Short one. Edge of Bracebridge. Then cranberries, if you want them.",
        face: { mouth: "smile" } },
      { at: 0.86, voice: "sun", text: "Of course I want the cranberries.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "muskoka-t12": {
    title: "To Bala", terrain: "forest", amp: 200, climb: 2,
    beats: [
      { at: 0.24, voice: "curse", text: "Half an hour west. It's a whole marsh, not a shop.", face: { mouth: "closed" } },
      { at: 0.72, voice: "sun", text: "A red one?", face: { eye: "wide", mouth: "open" } },
    ],
  },
  "muskoka-t13": {
    title: "Home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0.10, voice: "sun", text: "My shoes are still wet from yesterday.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.34, voice: "curse", text: "They'll dry by Toronto. Two hours.", face: { mouth: "smile" } },
      { at: 0.56, voice: "sun", text: "And Monday's a holiday.", face: { brow: "raised" } },
      { at: 0.76, voice: "curse", text: "Home before dark. Into the light this time.", face: { mouth: "smile" } },
      { at: 0.94, voice: "sun", text: "Next year we come back for the forest again.",
        face: { eye: "sparkle", mouth: "grin", emote: "sparkle" } },
    ],
  },
};

/**
 * What they say on ARRIVING somewhere, before the card comes up.
 *
 * Keyed by station id — `${trip}-d${day}-${time without the colon}`. Only the
 * stops worth a reaction have any; standing in front of a place saying nothing
 * is fine, and a line at every one of them would be noise.
 */
const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "muskoka-d1-0830": [
    { voice: "curse", text: "Market first. Coffee, and whatever the farms have left.", face: { mouth: "smile" } },
    { voice: "sun", text: "If it's still open this late in the year.", face: { brow: "raised", eye: "half" } },
  ],
  "muskoka-d1-1030": [
    { voice: "sun", text: "Wait. It's floating.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Out and back. We turn round when you've had enough.", face: { mouth: "smile" } },
  ],
  "muskoka-d1-1700": [
    { voice: "sun", text: "It's a house. In the trees.", face: { eye: "sparkle", mouth: "smile" } },
    { voice: "curse", text: "Only dinner of the weekend. They're closed tomorrow.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-1830": [
    { voice: "sun", text: "…Oh.", face: { eye: "sparkle", mouth: "o", emote: "sparkle" } },
    { voice: "curse", text: "The whole town. And the lake. Right on time.", face: { mouth: "smile" } },
  ],
  "muskoka-d1-1915": [
    { voice: "sun", text: "Wait. Stop — look at that.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "The same trees we walked past this afternoon.", face: { mouth: "smile" } },
    { voice: "sun", text: "You booked this before anything else, didn't you.", face: { eye: "half", mouth: "smirk" } },
    { voice: "curse", text: "It sells out.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-2150": [
    { voice: "sun", text: "The waterfall's lit up. In colours.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "In the middle of the town. And nobody here.", face: { mouth: "smile" } },
  ],
  "muskoka-d2-0830": [
    { voice: "sun", text: "Okay. That was worth getting up for.", face: { mouth: "grin" } },
    { voice: "curse", text: "Lake of Bays, all of it. That's why we came early.", face: { mouth: "smile" } },
  ],
};


export const MUSKOKA: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: MUSKOKA_COUNTRY,
  horizon: MUSKOKA_HORIZON,
};
