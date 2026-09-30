import type { Script, Authored } from "./kit";
import { QUEBEC_COUNTRY, QUEBEC_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * Quebec City — nine runs between eight stops.
 *
 * Eight hundred kilometres each way, split at Montreal on the way out and
 * swallowed whole on the way back. The script does not pretend the distance
 * away — the first run is the one they argue about.
 */

const RUNS: Record<string, Authored> = {
  "quebec-city-t1": {
    title: "Montreal, for tonight", terrain: "highway", amp: 280, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "Okay, honestly, how far is this one?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "Eight hundred kilometres! Tonight we only go till Montreal.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "So we sleep in Montreal and don't even see Montreal?",
        face: { brow: "furrowed", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Just a bed. We leave at six-thirty sharp.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every small village has one shiny silver steeple!",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Tin. Only roof that survives their winters. Every church on the river has one.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Wait, why are we driving past Quebec City?",
        face: { brow: "furrowed", eye: "half" } },
      { at: 0, voice: "curse", text: "Valley is north of it, na. City can wait till the afternoon.",
        face: { mouth: "smirk" } },
    ],
  },
  "quebec-city-t2": {
    title: "Down from the valley", terrain: "forest", amp: 240, climb: -12,
    beats: [
      { at: 0, voice: "sun", text: "My legs are finished. Totally finished.",
        face: { brow: "worried", eye: "closed", mouth: "sad", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Four hundred and fifty metres up. I did say it's not a small hike.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "You said, and I quote, 'nice walk'.", face: { brow: "flat", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Lunch in Stoneham, then twenty minutes to the walls. Promise.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t3": {
    title: "Up to Rue Saint-Jean", terrain: "town", amp: 100, climb: 14,
    beats: [
      { at: 0, voice: "sun", text: "Up again? Obviously it's up.", face: { brow: "worried", mouth: "grimace", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Korean corn dogs at the top. If they're still open, fingers crossed.",
        face: { mouth: "smirk" } },
      { at: 0, voice: "sun", text: "…Okay, lead the way!", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "quebec-city-t4": {
    title: "Dinner, then the walls", terrain: "town", amp: 130, climb: 6,
    beats: [
      { at: 0, voice: "sun", text: "That was just a snack. I want proper dinner.", face: { brow: "flat", eye: "half" } },
      { at: 0, voice: "curse", text: "Dinner is inside the walls. After that we walk them in the dark.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "These roofs are almost straight up!",
        face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "So the snow slides off by itself. Everything here is built for February.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t5": {
    title: "Night walk, falls tomorrow", terrain: "town", amp: 130, climb: 8,
    beats: [
      { at: 0, voice: "sun", text: "I could stay inside these walls the whole weekend, seriously.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Tomorrow we go outside. There's a waterfall taller than Niagara.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Taller than Niagara? No way.", face: { brow: "furrowed", eye: "wide", mouth: "open" } },
    ],
  },
  "quebec-city-t6": {
    title: "Along the Beaupré coast", terrain: "highway", amp: 240, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "Eighty-three metres! Thirty taller than Niagara. Okay, you were right.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Another one next. Inside a canyon, with bridges hanging over it!",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "How many waterfalls are we doing this weekend exactly?", face: { brow: "raised", eye: "half" } },
    ],
  },
  "quebec-city-t7": {
    title: "Geese time!", terrain: "forest", amp: 220, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "My knees did not enjoy that last bridge.", face: { brow: "worried", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Lunch in Beaupré. Then the one I actually planned this whole trip around.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "…You keep saying that about everything.", face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "curse", text: "Tens of thousands of snow geese! By November they're all gone.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t8": {
    title: "Over to the island", terrain: "highway", amp: 240, climb: -6,
    beats: [
      { at: 0, voice: "sun", text: "I can still hear them honking!", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Island next, over the bridge. Some farmhouses there are from the sixteen hundreds!",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Why are all the fields long thin strips from the road?",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Old seigneurial lots. Everyone wanted river frontage, and nobody redrew them in four hundred years.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t9": {
    title: "The looong drive home", terrain: "highway", amp: 300, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "Eight hours. Please tell me it's not eight hours.",
        face: { brow: "worried", eye: "shadowed", mouth: "sad" } },
      { at: 0, voice: "curse", text: "It's eight hours. That's why Monday is a holiday.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "Then I'm opening the chocolate.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0, voice: "curse", text: "That was for home!", face: { brow: "worried", mouth: "open" } },
      { at: 0, voice: "sun", text: "This car is home now. For eight hours.",
        face: { eye: "half", mouth: "smirk" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "quebec-city-d1-0945": [
    { voice: "curse", text: "Day passes are limited. That's why I booked early.", face: { mouth: "closed" } },
    { voice: "sun", text: "It goes straight up?!", face: { eye: "wide", mouth: "open" } },
  ],
  "quebec-city-d1-1515": [
    { voice: "sun", text: "Oh wow, this is not what I expected at all!", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Château on top, the St Lawrence below. Then the stairs down into the old street.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d1-2045": [
    { voice: "curse", text: "Only walled city north of Mexico, you know.", face: { mouth: "smile" } },
    { voice: "sun", text: "And we're walking all of it, na?", face: { brow: "flat", mouth: "grimace" } },
  ],
  "quebec-city-d2-0900": [
    { voice: "sun", text: "I can feel it through the bridge!", face: { eye: "wide", mouth: "open" } },
    { voice: "curse", text: "Eighty-three metres. Thirty taller than Niagara, and this bridge is right on top of it.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d2-1430": [
    { voice: "sun", text: "Oh my god, there are thousands of them!", face: { eye: "sparkle", mouth: "o", emote: "sparkle" } },
    { voice: "curse", text: "Tens of thousands. By November, all gone.", face: { mouth: "smile" } },
  ],
};

export const QUEBEC: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: QUEBEC_COUNTRY,
  horizon: QUEBEC_HORIZON,
};
