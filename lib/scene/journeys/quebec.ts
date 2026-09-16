import type { Script, Authored } from "./kit";
import { QUEBEC_COUNTRY, QUEBEC_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * Quebec City — seven runs between six stops.
 *
 * The one with the honest problem in it: at 1600 km round trip the driving
 * stops making sense, and the file says so rather than hiding it. The script
 * does not pretend otherwise — it is the first thing they argue about.
 */

const RUNS: Record<string, Authored> = {
  "quebec-city-t1": {
    title: "The one you fly", terrain: "highway", amp: 280, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "How far is this one, really?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "Sixteen hundred kilometres, there and back. Eight or nine hours each way.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "That's not a weekend. That's a commute with a hotel in it.",
        face: { brow: "furrowed", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "Which is why this is the one we fly. Three to four hours, door to door.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every village has one of those silver steeples.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Tin. It's the only roof that survives these winters, and every church on the river has one.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t2": {
    title: "Down the cliff", terrain: "town", amp: 110, climb: -14,
    beats: [
      { at: 0, voice: "sun", text: "That boardwalk with the castle over it — that's the picture, isn't it.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Now we go down. Oldest commercial street on the continent is below us.",
        face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t3": {
    title: "Back up for lunch", terrain: "town", amp: 100, climb: 14,
    beats: [
      { at: 0, voice: "sun", text: "Up. Of course it's up.", face: { brow: "worried", mouth: "grimace", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Korean corn dogs on Rue Saint-Jean. Four point eight stars.",
        face: { mouth: "smirk" } },
      { at: 0, voice: "sun", text: "…Lead on.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "quebec-city-t4": {
    title: "Out to the walls", terrain: "town", amp: 120, climb: 6,
    beats: [
      { at: 0, voice: "curse", text: "Only walled city north of Mexico. We walk the walls, then the battlefield.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "There are still cannons on it.",
        face: { eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "Pointed at a river nobody has come up since seventeen seventy-five.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "How much walking is left in this day?", face: { brow: "worried", eye: "half" } },
    ],
  },
  "quebec-city-t5": {
    title: "To the studio", terrain: "town", amp: 100, climb: -4,
    beats: [
      { at: 0, voice: "sun", text: "Four studios in one city?", face: { brow: "raised", eye: "wide" } },
      { at: 0, voice: "curse", text: "Four that are actually operating. We only need one.", face: { mouth: "smile" } },
    ],
  },
  "quebec-city-t6": {
    title: "The night, and the falls", terrain: "town", amp: 130, climb: 8,
    beats: [
      { at: 0, voice: "sun", text: "I could stay inside these walls all weekend.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "sun", text: "The roofs are almost vertical.",
        face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "So the snow comes off them on its own. Everything here is built for February.",
        face: { mouth: "smile" } },
      { at: 0, voice: "curse", text: "Tomorrow's outside them. There's a waterfall taller than Niagara.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "Taller than — no there isn't.", face: { brow: "furrowed", eye: "wide", mouth: "open" } },
    ],
  },
  "quebec-city-t7": {
    title: "The island, then home", terrain: "highway", amp: 240, climb: -6,
    beats: [
      { at: 0, voice: "sun", text: "Eighty-three metres. Thirty metres taller. You were right.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Island next, over the bridge. Some of those farmhouses are from the sixteen hundreds.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The fields are all long thin strips running back from the road.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Seigneurial lots. Everyone wanted river frontage, and nobody has re-drawn them in four hundred years.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "And then a flight home in the dark.", face: { eye: "closed", mouth: "smile" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "quebec-city-d1-0900": [
    { voice: "sun", text: "Oh, that is not what I expected at all.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Chateau above, the St Lawrence below, and the boardwalk runs the whole cliff.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d1-1015": [
    { voice: "sun", text: "It's all stone. Everything is stone.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "Oldest commercial street in North America. People still live above the shops.",
      face: { mouth: "smile" } },
  ],
  "quebec-city-d1-1400": [
    { voice: "curse", text: "The only walled city north of Mexico.", face: { mouth: "smile" } },
    { voice: "sun", text: "And we're going to walk all of it, aren't we.", face: { brow: "flat", mouth: "grimace" } },
  ],
  "quebec-city-d2-0900": [
    { voice: "sun", text: "You can feel it through the bridge.", face: { eye: "wide", mouth: "open" } },
    { voice: "curse", text: "Eighty-three metres. Thirty taller than Niagara, and the footbridge is right over the lip.",
      face: { mouth: "smile" } },
  ],
};

export const QUEBEC: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: QUEBEC_COUNTRY,
  horizon: QUEBEC_HORIZON,
};
