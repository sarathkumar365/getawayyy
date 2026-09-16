import type { Script, Authored } from "./kit";
import { ALGONQUIN_COUNTRY, ALGONQUIN_HORIZON } from "./country";
import type { ArrivalLine } from "../corridor";

/**
 * Algonquin & Haliburton — ten runs between nine stops.
 *
 * The long one: 700 km, eight hours of driving, and Saturday is spent entirely
 * inside the Highway 60 corridor. So the shape of the script is a day that
 * starts too early and keeps producing one more trail.
 */

const RUNS: Record<string, Authored> = {
  "algonquin-haliburton-t1": {
    title: "Up, and up early", terrain: "highway", amp: 340, climb: 9,
    beats: [
      { at: 0, voice: "curse", text: "Two and a half hours tonight, then the gate at eight in the morning.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "Eight? On a Saturday?", face: { brow: "worried", eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "The park says it's one of the busiest weekends of its year. We get there first or we queue.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Fine. But dinner first.", face: { eye: "half", mouth: "smirk" } },
      { at: 0, voice: "sun", text: "The hills have gone completely red.",
        face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Hardwood. That's the whole reason the weekend is this weekend and not the next one.",
        face: { mouth: "smile" } },
    ],
  },
  "algonquin-haliburton-t2": {
    title: "To the lookout", terrain: "forest", amp: 220, climb: 16,
    beats: [
      { at: 0, voice: "sun", text: "That gallery had a whole path for one painter.", face: { mouth: "smile" } },
      { at: 0, voice: "curse", text: "Tom Thomson. This next bit is the photograph everyone means by Algonquin.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "The dark skinny ones look like a different country to the red ones.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "Black spruce. They take the wet ground the maples won't touch.",
        face: { mouth: "smile" } },
    ],
  },
  "algonquin-haliburton-t3": {
    title: "Down to the bog", terrain: "forest", amp: 200, climb: -10,
    beats: [
      { at: 0, voice: "sun", text: "I'm still getting my breath back from that cliff.",
        face: { brow: "worried", eye: "closed", emote: "sweat" } },
      { at: 0, voice: "curse", text: "Good, because this one's a boardwalk. Flat the whole way.",
        face: { mouth: "smirk" } },
      { at: 0, voice: "sun", text: "The forest just stopped. It's all open.",
        face: { eye: "wide", mouth: "open" } },
      { at: 0, voice: "curse", text: "Bog. Nothing grows tall in it. The gold ones are tamarack — the only conifer that turns.",
        face: { mouth: "smile" } },
    ],
  },
  "algonquin-haliburton-t4": {
    title: "Lunch out of a bag", terrain: "forest", amp: 240, climb: 6,
    beats: [
      { at: 0, voice: "sun", text: "Where are we eating?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "Out of the bag. There's almost nothing in the corridor and what there is will be queued out.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "You packed lunch. You actually packed lunch.", face: { eye: "sparkle", mouth: "grin" } },
    ],
  },
  "algonquin-haliburton-t5": {
    title: "The logging museum", terrain: "forest", amp: 210, climb: 8,
    beats: [
      { at: 0, voice: "curse", text: "There's a steam-powered tug in the woods that could haul itself overland.",
        face: { mouth: "smile" } },
      { at: 0, voice: "sun", text: "That is not a real thing.", face: { brow: "raised", eye: "half" } },
    ],
  },
  "algonquin-haliburton-t6": {
    title: "One more trail", terrain: "forest", amp: 230, climb: 18,
    beats: [
      { at: 0, voice: "sun", text: "How many more trails are there?", face: { brow: "worried", mouth: "grimace" } },
      { at: 0, voice: "curse", text: "One. This is the one the whole day was for.", face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "You said that about the last two.", face: { brow: "flat", mouth: "grimace" } },
      { at: 0, voice: "sun", text: "There's another moose sign.",
        face: { brow: "raised", eye: "open" } },
      { at: 0, voice: "curse", text: "On this road they're not decorative.",
        face: { eye: "half", mouth: "smirk" } },
    ],
  },
  "algonquin-haliburton-t7": {
    title: "The night, and south", terrain: "town", amp: 190, climb: 4,
    beats: [
      { at: 0, voice: "sun", text: "I slept like someone hit me.", face: { eye: "closed", mouth: "smile" } },
      { at: 0, voice: "curse", text: "Forty-five minutes south-east and there's a tower above the narrows.",
        face: { mouth: "smile" } },
    ],
  },
  "algonquin-haliburton-t8": {
    title: "Into Haliburton", terrain: "forest", amp: 220, climb: -8,
    beats: [
      { at: 0, voice: "sun", text: "That was the widest view of the whole weekend.", face: { eye: "sparkle", mouth: "grin" } },
      { at: 0, voice: "curse", text: "Sculptures in the woods next. Free, and nobody's ever heard of it.",
        face: { mouth: "smile" } },
    ],
  },
  "algonquin-haliburton-t9": {
    title: "To the studio", terrain: "forest", amp: 200, climb: 6,
    beats: [
      { at: 0, voice: "sun", text: "Is the pottery place booked?", face: { brow: "raised" } },
      { at: 0, voice: "curse", text: "It's a working studio. We have to phone — they don't publish a price.",
        face: { brow: "flat", mouth: "closed" } },
      { at: 0, voice: "sun", text: "So that's a maybe.", face: { eye: "half", mouth: "grimace" } },
    ],
  },
  "algonquin-haliburton-t10": {
    title: "The long way home", terrain: "highway", amp: 360, climb: -6,
    beats: [
      { at: 0, voice: "sun", text: "How long is this one?", face: { brow: "worried" } },
      { at: 0, voice: "curse", text: "Two and three quarter hours. It's the price of going that far in.",
        face: { mouth: "closed" } },
      { at: 0, voice: "sun", text: "Worth it. Don't tell me you told me so.", face: { mouth: "smirk" } },
      { at: 0, voice: "curse", text: "I told you so.", face: { eye: "half", mouth: "smirk" } },
    ],
  },
};

const ARRIVALS: Record<string, readonly ArrivalLine[]> = {
  "algonquin-haliburton-d1-1030": [
    { voice: "sun", text: "Oh. Oh, that's the whole valley.", face: { eye: "wide", mouth: "open", emote: "sparkle" } },
    { voice: "curse", text: "Maple hillside, as far as it goes. This is the week for it.", face: { mouth: "smile" } },
  ],
  "algonquin-haliburton-d1-1145": [
    { voice: "sun", text: "It's completely different down here.", face: { brow: "raised", mouth: "smile" } },
    { voice: "curse", text: "Black spruce bog. Twenty minutes from the maples and another country.", face: { mouth: "closed" } },
  ],
  "algonquin-haliburton-d1-1615": [
    { voice: "sun", text: "Okay. That was worth the complaining.", face: { eye: "sparkle", mouth: "grin" } },
    { voice: "curse", text: "Cliff over Rock Lake, and we walk back along the old railway bed.", face: { mouth: "smile" } },
  ],
  "algonquin-haliburton-d2-1015": [
    { voice: "curse", text: "Lake of Bays, the whole narrows.", face: { mouth: "smile" } },
    { voice: "sun", text: "I can see the weather coming from here.", face: { eye: "wide", mouth: "grin" } },
  ],
  "algonquin-haliburton-d2-1145": [
    { voice: "sun", text: "There's a sculpture in the trees. And another one.", face: { eye: "sparkle", mouth: "grin" } },
  ],
};

export const ALGONQUIN: Script = {
  runs: RUNS,
  arrivals: ARRIVALS,
  scenery: ALGONQUIN_COUNTRY,
  horizon: ALGONQUIN_HORIZON,
};
