import type { Script, Authored } from "./kit";
import { MUSKOKA_COUNTRY, MUSKOKA_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * Muskoka — nine runs between eight stops.
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
      { at: 0.12, voice: "curse", text: "Right. Six o'clock, Friday. A hundred and seventy kilometres of this.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "And we get there when?",
        face: { brow: "raised", eye: "open" } },
      { at: 0.68, voice: "curse", text: "Gravenhurst by eight, if the 400 behaves. Dinner's in an old sawmill — open till eleven.",
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
    title: "The first night", terrain: "town", amp: 180, climb: 3,
    beats: [
      { at: 0.3, voice: "sun", text: "I can hear it from the room.", face: { eye: "closed", mouth: "smile" } },
      { at: 0.74, voice: "curse", text: "Four streets away, and it does that all night.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t3": {
    title: "Saturday, north", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0.12, voice: "sun", text: "That train was older than I thought it would be.",
        face: { brow: "raised", mouth: "smile" } },
      { at: 0.42, voice: "curse", text: "Today was the last day it runs this year. One day later and we'd have missed it.",
        face: { brow: "flat", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "They cut the road straight through that rock.",
        face: { eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "Blasted it. The vertical scores are the drill holes — same rock the whole way to Huntsville.",
        face: { mouth: "smile" } },
      { at: 0.70, voice: "sun", text: "You planned that.", face: { eye: "half", mouth: "smirk" } },
      { at: 0.92, voice: "curse", text: "Lunch is standing up on the main street. The afternoon's tight.",
        face: { mouth: "closed" } },
    ],
  },
  "muskoka-t4": {
    title: "Into the trees", terrain: "forest", amp: 220, climb: 12,
    beats: [
      { at: 0.16, voice: "sun", text: "Okay, the paintings on the buildings were good. I'll give you that one.",
        face: { mouth: "grin" } },
      { at: 0.52, voice: "curse", text: "Fifteen minutes and the town just stops.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every second driveway has a canoe on a rack.",
        face: { brow: "raised", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Nobody up here keeps one indoors. There's a lake at the end of most of them.",
        face: { mouth: "smile" } },
      { at: 0.86, voice: "sun", text: "How far is the waterfall from the car?",
        face: { brow: "furrowed", eye: "half" } },
    ],
  },
  "muskoka-t5": {
    title: "The climb, in the rain", terrain: "forest", amp: 240, climb: 20, wet: true,
    beats: [
      { at: 0.08, voice: "sun", text: "Oh no. It's started raining.", face: { brow: "worried", eye: "wide", mouth: "open" } },
      { at: 0.28, voice: "curse", text: "It'll pass. It always does up here.", face: { mouth: "closed" } },
      { at: 0.48, voice: "sun", text: "How much more of this? My legs are done.",
        face: { brow: "worried", eye: "closed", mouth: "sad", emote: "sweat" } },
      { at: 0.68, voice: "curse", text: "Ten minutes. Then you'll see why I did this to you.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0.86, voice: "sun", text: "It had better be incredible.", face: { brow: "flat", eye: "half", mouth: "grimace" } },
      { at: 0.97, voice: "curse", text: "Sun goes down at six. Come on.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t6": {
    title: "The slow morning", terrain: "town", amp: 190, climb: 4,
    beats: [
      { at: 0.16, voice: "sun", text: "Nobody made us leave last night. We sat there for two hours.",
        face: { mouth: "smile" } },
      { at: 0.50, voice: "curse", text: "Coffee on the wharf before anything opens. Today's the slow one.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The white ones have gone completely gold.",
        face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.84, voice: "sun", text: "Define slow.", face: { brow: "raised", eye: "half" } },
    ],
  },
  "muskoka-t7": {
    title: "Two streets", terrain: "town", amp: 90, climb: 2,
    beats: [
      { at: 0.18, voice: "sun", text: "You said two streets.", face: { brow: "flat", eye: "half" } },
      { at: 0.54, voice: "curse", text: "It is two streets.", face: { mouth: "closed" } },
      { at: 0.88, voice: "sun", text: "You said that about the hill as well.",
        face: { brow: "flat", mouth: "grimace" } },
    ],
  },
  "muskoka-t8": {
    title: "The one he built it around", terrain: "forest", amp: 200, climb: 8,
    beats: [
      { at: 0.14, voice: "sun", text: "Where are we going? There's nothing out here.",
        face: { brow: "raised", eye: "open" } },
      { at: 0.44, voice: "curse", text: "North Muldrew Lake Road. Then a driveway with no sign on it.",
        face: { mouth: "closed" } },
      { at: 0.72, voice: "sun", text: "…You booked something.", face: { eye: "wide", mouth: "open" } },
      { at: 0.93, voice: "curse", text: "Two hours at a wheel. I booked it before the room.",
        face: { mouth: "smile" } },
    ],
  },
  "muskoka-t9": {
    title: "Home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0.10, voice: "sun", text: "My hands are still grey.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.34, voice: "curse", text: "They fire it and post it to you. Three weeks.", face: { mouth: "smile" } },
      { at: 0.56, voice: "sun", text: "Two hours back?", face: { brow: "raised" } },
      { at: 0.76, voice: "curse", text: "Home by quarter to six. Into the light this time.", face: { mouth: "smile" } },
      { at: 0.94, voice: "sun", text: "Do the next one. The one with the lake you can swim in.",
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
  "muskoka-d0-2215": [
    { voice: "sun", text: "Wait. Stop — look at that.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Bracebridge Falls. It's in the middle of the town.", face: { mouth: "smile" } },
    { voice: "sun", text: "It's lit up. At half ten at night.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "And there's nobody here. That's why it's on the list.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-0930": [
    { voice: "curse", text: "Pioneer village, and the steam train runs today.", face: { mouth: "smile" } },
    { voice: "sun", text: "An actual steam train?", face: { eye: "wide", emote: "sparkle" } },
  ],
  "muskoka-d1-1500": [
    { voice: "sun", text: "Okay. That was worth the walk in.", face: { mouth: "grin" } },
    { voice: "curse", text: "Stubb's Falls. The lookout's further up.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-1800": [
    { voice: "sun", text: "…Fine. It was worth it.", face: { eye: "sparkle", mouth: "smile" } },
    { voice: "curse", text: "I'll take that.", face: { mouth: "smirk" } },
  ],
  "muskoka-d2-1230": [
    { voice: "sun", text: "There's clay on everything already.", face: { mouth: "grin", emote: "sparkle" } },
    { voice: "curse", text: "Two hours. Nobody's counting.", face: { mouth: "smile" } },
  ],
  "muskoka-d2-1130": [
    { voice: "curse", text: "He was born in this house.", face: { mouth: "closed" } },
  ],
};


export const MUSKOKA: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: MUSKOKA_COUNTRY,
  horizon: MUSKOKA_HORIZON,
};
