import type { Script, Authored } from "./kit";
import { MUSKOKA_COUNTRY, MUSKOKA_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * North — Huntsville & Dorset. Fourteen runs between thirteen stops.
 *
 * They are the couple. There is no narrator: every line is spoken by one of
 * them, and the facts arrive the way facts arrive between two people who are
 * actually in the car. "Two hours, you'll be asleep before Barrie" IS the
 * drive time out of trips.json.
 */

const RUNS: Record<string, Authored> = {
  "muskoka-t1": {
    title: "Bye bye, city", terrain: "city", amp: 300, climb: 7,
    beats: [
      { at: 0.12, voice: "curse", text: "Okay. Six o'clock, Friday. Two hours of this traffic.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "And tonight's plan is what?",
        face: { brow: "raised", eye: "open" } },
      { at: 0.68, voice: "curse", text: "Nothing! Tonight we just reach. Tomorrow starts at eight-thirty sharp.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The buildings finish after Barrie, na?",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Totally. One minute warehouses, next minute only rock and pine.",
        face: { mouth: "closed" } },
      { at: 0.92, voice: "sun", text: "Wake me up for that part, okay?",
        face: { eye: "closed", mouth: "smile" } },
    ],
  },
  "muskoka-t2": {
    title: "Up north we go", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0.12, voice: "sun", text: "I've already bought butter tarts and it's not even ten!",
        face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.42, voice: "curse", text: "Thirty-five minutes to Huntsville. Let them survive till then at least.",
        face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "Wow, they cut the road straight through the rock!",
        face: { eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "Blasted it. Those lines on the rock are the drill holes. Same rock all the way up.",
        face: { mouth: "smile" } },
      { at: 0.90, voice: "sun", text: "They won't survive.", face: { mouth: "grin" } },
    ],
  },
  "muskoka-t3": {
    title: "Lunch, then the woods", terrain: "forest", amp: 240, climb: 14, wet: true,
    beats: [
      { at: 0.06, voice: "sun", text: "A path floating on the lake! I seriously didn't believe you.",
        face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.18, voice: "curse", text: "Lunch on Main Street first, then east into the reserve.",
        face: { mouth: "closed" } },
      { at: 0.40, voice: "sun", text: "Oh no. It's started raining!", face: { brow: "worried", eye: "wide", mouth: "open" } },
      { at: 0.54, voice: "curse", text: "Relax, it'll pass. Up here it always passes.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Every second house has a canoe on a rack!",
        face: { brow: "raised", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Nobody here keeps one inside. Most driveways end at a lake.",
        face: { mouth: "smile" } },
      { at: 0.88, voice: "sun", text: "How big is this lake? How far around even?",
        face: { brow: "furrowed", eye: "half" } },
    ],
  },
  "muskoka-t4": {
    title: "Off to Aspdin Road", terrain: "forest", amp: 200, climb: 6,
    beats: [
      { at: 0.16, voice: "sun", text: "My shoes are fully soaked. Worth it though!", face: { mouth: "grin" } },
      { at: 0.52, voice: "curse", text: "Nursery next. We'll come back to the same gate tonight also.",
        face: { mouth: "smile" } },
      { at: 0.86, voice: "sun", text: "Twice? Why twice?", face: { brow: "raised", eye: "open" } },
    ],
  },
  "muskoka-t5": {
    title: "Early dinner", terrain: "town", amp: 110, climb: 2,
    beats: [
      { at: 0.20, voice: "curse", text: "Because tonight the whole forest gets lit up! But dinner first. Table's at five.",
        face: { mouth: "smirk" } },
      { at: 0.60, voice: "sun", text: "Five? That's basically evening snacks time.", face: { brow: "flat", eye: "half" } },
      { at: 0.88, voice: "curse", text: "Five is the only way the sunset fits, madam.", face: { mouth: "closed" } },
    ],
  },
  "muskoka-t6": {
    title: "Quick, up the hill", terrain: "town", amp: 120, climb: 16,
    beats: [
      { at: 0.18, voice: "sun", text: "Best meal of the year and you rushed me through dessert!",
        face: { brow: "furrowed", mouth: "grimace" } },
      { at: 0.56, voice: "curse", text: "Sun sets at twenty to seven. Five minutes up the hill, come fast.",
        face: { mouth: "closed" } },
      { at: 0.90, voice: "sun", text: "…Fine. Walk faster then.", face: { eye: "half", mouth: "smirk" } },
    ],
  },
  "muskoka-t7": {
    title: "Into the dark", terrain: "forest", amp: 220, climb: 4,
    beats: [
      { at: 0.14, voice: "sun", text: "Okay, I'll say it. That was so worth it.", face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.44, voice: "curse", text: "I'll take that, thank you.", face: { mouth: "smirk" } },
      { at: 0.76, voice: "sun", text: "Back to the nursery? In full darkness?", face: { brow: "raised", eye: "wide" } },
      { at: 0.94, voice: "curse", text: "That's exactly the point, na.", face: { mouth: "smile" } },
    ],
  },
  "muskoka-t8": {
    title: "Late drive south", terrain: "highway", amp: 320, climb: -4,
    beats: [
      { at: 0.14, voice: "sun", text: "I'm going to be dreaming about those trees the whole week.",
        face: { eye: "closed", mouth: "smile" } },
      { at: 0.46, voice: "curse", text: "One more on the way. Free, and right in the middle of Bracebridge.",
        face: { mouth: "smile" } },
      { at: 0.82, voice: "sun", text: "You said the hill was 'just five minutes' also.",
        face: { brow: "flat", mouth: "grimace" } },
    ],
  },
  "muskoka-t9": {
    title: "Algonquin, before sunrise", terrain: "highway", amp: 320, climb: 10,
    beats: [
      { at: 0.14, voice: "sun", text: "Six forty-five?! We came back at ten-thirty last night!",
        face: { brow: "worried", eye: "half", mouth: "sad" } },
      { at: 0.44, voice: "curse", text: "Algonquin parking fills by nine on Thanksgiving. I've got coffee, relax.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Look, the white ones have gone full gold!",
        face: { eye: "sparkle", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Golden encore. The reds finished last week.", face: { mouth: "smile" } },
      { at: 0.90, voice: "sun", text: "Okay, the mist on the lakes is worth it. Little bit.", face: { eye: "half", mouth: "smile" } },
    ],
  },
  "muskoka-t10": {
    title: "Down the road to the bog", terrain: "forest", amp: 140, climb: -6,
    beats: [
      { at: 0.24, voice: "sun", text: "Where next? My legs are finally awake.", face: { brow: "raised", eye: "open" } },
      { at: 0.70, voice: "curse", text: "Five minutes down the road. A boardwalk through a spruce bog. Easy one.",
        face: { mouth: "smile" } },
    ],
  },
  "muskoka-t11": {
    title: "South to Dorset", terrain: "highway", amp: 300, climb: 4,
    beats: [
      { at: 0.16, voice: "sun", text: "Did you see the gold trees standing in the bog?", face: { eye: "sparkle", mouth: "smile" } },
      { at: 0.46, voice: "curse", text: "Tamarack. Only conifer that turns gold. Now Highway 35, down to the tower.",
        face: { mouth: "smile" } },
      { at: 0.82, voice: "sun", text: "And they'll let us in? It's almost lunchtime.", face: { brow: "raised", eye: "half" } },
      { at: 0.94, voice: "curse", text: "Slot's booked for eleven-thirty. Relax, na.", face: { mouth: "smirk" } },
    ],
  },
  "muskoka-t12": {
    title: "Down to the rock", terrain: "forest", amp: 120, climb: -8,
    beats: [
      { at: 0.24, voice: "sun", text: "There's a boardwalk right at the bottom!", face: { brow: "raised", eye: "open" } },
      { at: 0.70, voice: "curse", text: "Zero detour. Already checked.", face: { mouth: "smirk" } },
    ],
  },
  "muskoka-t13": {
    title: "Cranberry time", terrain: "highway", amp: 280, climb: -4,
    beats: [
      { at: 0.18, voice: "sun", text: "Still cranberries, na? You promised.", face: { brow: "raised", mouth: "smile" } },
      { at: 0.50, voice: "curse", text: "Hour and a bit west, out to Bala. It's a whole marsh, not some shop.",
        face: { mouth: "closed" } },
      { at: 0.86, voice: "sun", text: "A full red marsh?! I'm so ready.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "muskoka-t14": {
    title: "Home sweet home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0.10, voice: "sun", text: "My shoes are still wet from yesterday, by the way.", face: { mouth: "grin", emote: "sparkle" } },
      { at: 0.34, voice: "curse", text: "They'll dry by Toronto. Two hours only.", face: { mouth: "smile" } },
      { at: 0.56, voice: "sun", text: "And Monday is a holiday!", face: { brow: "raised" } },
      { at: 0.76, voice: "curse", text: "Algonquin, a fire tower and a cranberry marsh. All in one Sunday.", face: { mouth: "smile" } },
      { at: 0.94, voice: "sun", text: "Next year we're coming back for that forest. Promise?",
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
    { voice: "curse", text: "Market first! Coffee, and whatever the farms still have.", face: { mouth: "smile" } },
    { voice: "sun", text: "If it's even open this late in the year, na.", face: { brow: "raised", eye: "half" } },
  ],
  "muskoka-d1-1030": [
    { voice: "sun", text: "Wait. It's actually floating!", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Out and back. We turn around whenever you're done.", face: { mouth: "smile" } },
  ],
  "muskoka-d1-1700": [
    { voice: "sun", text: "It's a whole house in the trees! So cute.", face: { eye: "sparkle", mouth: "smile" } },
    { voice: "curse", text: "Our only proper dinner this trip. They're closed tomorrow.", face: { mouth: "closed" } },
  ],
  "muskoka-d1-1830": [
    { voice: "sun", text: "…Oh wow.", face: { eye: "sparkle", mouth: "o", emote: "sparkle" } },
    { voice: "curse", text: "Full town, full lake. Right on time.", face: { mouth: "smile" } },
  ],
  "muskoka-d1-1915": [
    { voice: "sun", text: "Wait. Stop. Look at that!", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Same trees we walked past this afternoon.", face: { mouth: "smile" } },
    { voice: "sun", text: "You booked this before everything else, didn't you?", face: { eye: "half", mouth: "smirk" } },
    { voice: "curse", text: "It sells out, okay?", face: { mouth: "closed" } },
  ],
  "muskoka-d1-2150": [
    { voice: "sun", text: "The waterfall is lit up! In colours!", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "Middle of the town, and nobody around. Perfect.", face: { mouth: "smile" } },
  ],
  "muskoka-d2-0815": [
    { voice: "sun", text: "Okay fine, that was worth waking up for.", face: { mouth: "grin" } },
    { voice: "curse", text: "Kilometres of hills, all gold. And we got parking.", face: { mouth: "smile" } },
  ],
  "muskoka-d2-1130": [
    { voice: "sun", text: "A fire tower! We're going all the way up?", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Full Lake of Bays from the top. That's why I booked it.", face: { mouth: "smile" } },
  ],
};


export const MUSKOKA: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: MUSKOKA_COUNTRY,
  horizon: MUSKOKA_HORIZON,
};
