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
    title: "As far as Montreal", terrain: "highway", amp: 280, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "How far is this one, really?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "Eight hundred kilometres. Tonight we only do Montreal.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "And sleep in Montreal and not see Montreal.",
        face: { brow: "furrowed", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "A bed and nothing else. We're out at half six.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every village has one of those silver steeples.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Tin. It's the only roof that survives these winters, and every church on the river has one.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Why are we going past Quebec City?",
        face: { brow: "furrowed", eye: "half" } },
      { at: 0, voice: "curse", text: "Because the valley is north of it. The city can wait till the afternoon.",
        face: { mouth: "smirk" } },
    ],
  },
  "quebec-city-t2": {
    title: "Down out of the valley", terrain: "forest", amp: 240, climb: -12,
    beats: [
      { at: 0, voice: "sun", text: "My legs are done. Completely done.",
        face: { brow: "worried", eye: "closed", mouth: "sad", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Four hundred and fifty metres. I did say it wasn't a small one.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "You said it was a walk.", face: { brow: "flat", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Lunch in Stoneham. Then twenty minutes to the walls.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t3": {
    title: "Up to Rue Saint-Jean", terrain: "town", amp: 100, climb: 14,
    beats: [
      { at: 0, voice: "sun", text: "Up. Of course it's up.", face: { brow: "worried", mouth: "grimace", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Korean corn dogs at the top. If they're still open.",
        face: { mouth: "smirk" } },
      { at: 0, voice: "sun", text: "…Lead on.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "quebec-city-t4": {
    title: "Dinner, then the walls", terrain: "town", amp: 130, climb: 6,
    beats: [
      { at: 0, voice: "sun", text: "That was a snack. I want dinner.", face: { brow: "flat", eye: "half" } },
      { at: 0, voice: "curse", text: "Dinner's inside the walls. Then we walk them in the dark.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The roofs are almost vertical.",
        face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "So the snow comes off them on its own. Everything here is built for February.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t5": {
    title: "The night, and the falls", terrain: "town", amp: 130, climb: 8,
    beats: [
      { at: 0, voice: "sun", text: "I could stay inside these walls all weekend.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Tomorrow's outside them. There's a waterfall taller than Niagara.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Taller than — no there isn't.", face: { brow: "furrowed", eye: "wide", mouth: "open" } },
    ],
  },
  "quebec-city-t6": {
    title: "Along the Beaupré coast", terrain: "highway", amp: 240, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "Eighty-three metres. Thirty metres taller. You were right.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Another one next. In a canyon, with bridges over it.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "How many waterfalls is this weekend?", face: { brow: "raised", eye: "half" } },
    ],
  },
  "quebec-city-t7": {
    title: "To the geese", terrain: "forest", amp: 220, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "My knees felt that last bridge.", face: { brow: "worried", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Lunch in Beaupré. Then the one I actually built this around.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "…You keep saying that.", face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "curse", text: "Tens of thousands of snow geese. They're gone by November.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t8": {
    title: "Over to the island", terrain: "highway", amp: 240, climb: -6,
    beats: [
      { at: 0, voice: "sun", text: "I can still hear them.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Island next, over the bridge. Some of those farmhouses are from the sixteen hundreds.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The fields are all long thin strips running back from the road.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Seigneurial lots. Everyone wanted river frontage, and nobody has re-drawn them in four hundred years.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t9": {
    title: "The long way home", terrain: "highway", amp: 300, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "Eight hours. Tell me it's not eight hours.",
        face: { brow: "worried", eye: "shadowed", mouth: "sad" } },
      { at: 0, voice: "curse", text: "It's eight hours. Monday's a holiday for a reason.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "I'm eating the chocolate.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0, voice: "curse", text: "That was for home.", face: { brow: "worried", mouth: "open" } },
      { at: 0, voice: "sun", text: "This is home. This car, for eight hours.",
        face: { eye: "half", mouth: "smirk" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "quebec-city-d1-0945": [
    { voice: "curse", text: "Day passes are capped. That's why we booked it.", face: { mouth: "closed" } },
    { voice: "sun", text: "It goes straight up.", face: { eye: "wide", mouth: "open" } },
  ],
  "quebec-city-d1-1515": [
    { voice: "sun", text: "Oh, that is not what I expected at all.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Château above, the St Lawrence below. Then the stairs down into the old street.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d1-2045": [
    { voice: "curse", text: "The only walled city north of Mexico.", face: { mouth: "smile" } },
    { voice: "sun", text: "And we're going to walk all of it, aren't we.", face: { brow: "flat", mouth: "grimace" } },
  ],
  "quebec-city-d2-0900": [
    { voice: "sun", text: "You can feel it through the bridge.", face: { eye: "wide", mouth: "open" } },
    { voice: "curse", text: "Eighty-three metres. Thirty taller than Niagara, and the footbridge is right over the lip.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d2-1430": [
    { voice: "sun", text: "Oh. Oh, there are thousands of them.", face: { eye: "sparkle", mouth: "o", emote: "sparkle" } },
    { voice: "curse", text: "Tens of thousands. By November they're gone.", face: { mouth: "smile" } },
  ],
};

export const QUEBEC: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: QUEBEC_COUNTRY,
  horizon: QUEBEC_HORIZON,
};
