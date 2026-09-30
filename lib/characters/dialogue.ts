/**
 * The script.
 *
 * Every factual claim below comes from `trips.json` or from the Phase 0 weather
 * pass — no invented numbers. That is deliberate: the whole point of the two
 * voices is that the file's bad news arrives in the mouth of a character whose
 * personality is being smugly right, rather than in a warnings box nobody reads.
 *
 * Voices:
 *   A (sun)   thinks it will be fine, and is usually right about that.
 *   B (curse) has read the hours. Dry, declarative, correct every time.
 *
 * In the walk itself they are the COUPLE, not two narrators describing one —
 * see lib/scene/muskoka-journey.ts. Here, at the two ends of the trip, they
 * turn and talk to her, which is the only place that is allowed.
 */

import type { ArmPose } from "./rig";
import type { DBrow, DEmote, DetailId, DEye, DMouth } from "./detailed";

export type Line = {
  who: DetailId;
  text: string;
  brow?: DBrow;
  eye?: DEye;
  mouth?: DMouth;
  emote?: DEmote;
  arms?: ArmPose | "crossed";
  /** sticky until this speaker's next line */
  shiver?: boolean;
  /** the opening's weather; sticky until another line changes it */
  scene?: "warm" | "cold";
};

const A = (text: string, x: Omit<Line, "who" | "text"> = {}): Line =>
  ({ who: "sun", mouth: "talkA", ...x, text });
const B = (text: string, x: Omit<Line, "who" | "text"> = {}): Line =>
  ({ who: "curse", mouth: "talkA", arms: "crossed", ...x, text });

export const DIALOGUE: Record<string, readonly Line[]> = {
  /* ---------- 1. arrival ----------
     A is her, B is him. She was promised camping; he checked the campsites. */
  arrival: [
    A("You've been smiling at your phone all week.", { brow: "raised", eye: "side", mouth: "smirk" }),
    B("Because we're going away. You and me, in October.", { brow: "neutral", mouth: "smile", emote: "blush", arms: "rest" }),
    A("The camping trip? It's really happening?", { eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
    B("About the camping...", { brow: "worried", eye: "side", mouth: "grimace", emote: "sweat", arms: "rest" }),
    A("That's your bad-news face.", { brow: "worried", eye: "open", mouth: "o", arms: "rest" }),
    B("I looked at every campsite we talked about. Every single one.", { brow: "worried", mouth: "talkA", arms: "rest" }),
    B("The nights up there are already dropping close to freezing.", { brow: "worried", eye: "half", emote: "cold", arms: "hug", shiver: true, scene: "cold" }),
    A("Freezing? In a tent?", { brow: "worried", eye: "wide", mouth: "o", emote: "cold", arms: "hug", shiver: true }),
    B("Frost on the tent by morning. Cold toes all night.", { brow: "worried", eye: "squint", mouth: "grimace", emote: "cold", arms: "warmHands", shiver: true }),
    A("My nose is cold just hearing about it.", { brow: "worried", eye: "squint", mouth: "grimace", emote: "cold", arms: "warmHands", shiver: true }),
    B("And I wasn't going to let you spend our weekend shivering.", { brow: "neutral", eye: "open", mouth: "smile", emote: "none", arms: "rest", shiver: false, scene: "warm" }),
    A("...So no camping?", { brow: "worried", eye: "half", mouth: "sad", emote: "none", arms: "rest", shiver: false }),
    B("No camping. Something warmer.", { brow: "raised", mouth: "smile", arms: "thumbsUp" }),
    B("Two trips. Colourful trees in the day, and something lit up at night on both.", { brow: "delighted", mouth: "talkA", arms: "rest" }),
    A("You planned two?", { brow: "raised", eye: "wide", mouth: "o", emote: "blush" }),
    B("Same weekend, so you pick. Walk through them with me.", { brow: "neutral", eye: "closed", mouth: "smile", emote: "blush", arms: "rest" }),
    A("Okay. Show me the north one first.", { brow: "delighted", eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
  ],

  /* ---------- 2. the quiz ---------- */
  "quiz.intro": [
    A("Eight questions. Nothing here is binding.", { brow: "raised" }),
    A("Nobody is watching.", { eye: "closed", mouth: "smile" }),
    B("I am watching.", { eye: "shadowed", brow: "flat", emote: "shadow" }),
  ],
  "quiz.react.nature": [
    A("Trees! There are so many trees.", { eye: "sparkle", mouth: "grin" }),
    B("There are four hundred kilometres of trees. You will see them all.", { eye: "half" }),
  ],
  "quiz.react.pottery": [
    A("There is a real class. You make a thing, they fire it, they post it to you.", { emote: "sparkle" }),
    B("Three weeks later. She never includes that part.", { mouth: "smirk" }),
  ],
  "quiz.react.authentic_food": [
    A("Right. This one I have opinions about.", { brow: "delighted", arms: "thumbsUp" }),
    B("She has opinions about a sandwich.", { eye: "half", mouth: "smirk" }),
  ],
  "quiz.react.relaxation": [
    A("Noted. Slow weekend.", { mouth: "smile" }),
    B("Then not the one with the six-kilometre climb.", { brow: "raised" }),
  ],
  "quiz.react.famous": [
    A("Ohh, you want the famous one.", { eye: "wide" }),
    B("The famous one is famous on the same weekend as everyone else.", { brow: "furrowed" }),
  ],
  "quiz.react.photos": [
    A("Then we are going to the fire tower. And the cliff. And the bridge.", { arms: "pointR" }),
    B("All three are uphill.", { mouth: "smirk" }),
  ],
  "quiz.react.architecture_history": [
    A("Four hundred years old. Actually four hundred, not gift-shop four hundred.", { eye: "sparkle" }),
    B("That one is eight hundred kilometres away. Remember you said this.", { brow: "flat" }),
  ],
  "quiz.react.korean_anime": [
    A("There is a real Koreatown. And a manga café.", { mouth: "grin", emote: "sparkle" }),
    B("Fine.", { eye: "closed", mouth: "closed" }),
  ],
  "quiz.react.value": [
    A("Cheapest one is genuinely good, that is the best part!", { brow: "delighted" }),
    B("Cheapest one is also the one she keeps calling a stroll.", { mouth: "smirk" }),
  ],

  /* ---------- 3. the reveal ---------- */
  reveal: [
    A("Two. These two came out on top.", { arms: "pointL", eye: "wide" }),
    B("Nothing is decided.", { brow: "flat" }),
      ],

  /* ---------- 4. the trip worlds ---------- */
  "trip.muskoka.hero": [
    A("Closest one. Two hours and you are in the trees.", { mouth: "grin" }),
    A("And a whole forest lit up at night.", { eye: "sparkle", emote: "sparkle" }),
  ],
  "trip.muskoka.warning": [
    B("The Forest of Light is advance tickets only, and it sells out.", { brow: "furrowed" }),
    B("By the tenth the reds are fading. The golds are coming on.", {}),
    B("And there is no bed booked yet.", { eye: "half", mouth: "smirk" }),
  ],




  "trip.quebec-city.hero": [
    A("A walled city, a canyon, and tens of thousands of snow geese.", { eye: "sparkle", emote: "sparkle" }),
    B("Eight hundred kilometres. Each way.", { brow: "flat", eye: "shadowed" }),
    A("...tens of thousands, though.", { brow: "worried", mouth: "o", emote: "sweat" }),
  ],
  "trip.quebec-city.warning": [
    B("Sunday ends with eight hours in the car. Monday is the holiday for a reason.", { brow: "furrowed" }),
    B("The city is overwhelmingly French-speaking. Neither of you speaks French.", {}),
  ],

  /* ---------- 5. the calendar ---------- */
  calendar: [
    A("One weekend. Thanksgiving. Both of them want it.", { arms: "pointR" }),
    B("The deadlines are real and dated.", { brow: "flat" }),
    B("Read those before you fall in love with a weekend.", { eye: "half" }),
  ],

  /* ---------- 6. the ledger ---------- */
  ledger: [
    A("Everything, side by side.", { mouth: "smile" }),
    B("The ranges stay ranges. Averaging a range into one number is how a budget becomes a lie.", { brow: "furrowed" }),
  ],

  /* ---------- 7. her pick ---------- */
  herPick: [
    B("Okay. Which one?", { brow: "raised", eye: "open", mouth: "talkA" }),
    A("Don't rush me.", { eye: "wide", mouth: "o", arms: "rest" }),
    B("Take as long as you like. And tell me why. The why is the part I actually want.", { brow: "neutral", mouth: "smile", emote: "blush" }),
  ],

  /* ---------- 8. his pick ---------- */
  "yourPick.match": [
    A("THE SAME ONE. You picked the same one.", { eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
    B("...Yes. Fine. That was a good weekend to choose.", { brow: "raised", eye: "side", mouth: "smirk" }),
  ],
  "yourPick.mismatch": [
    A("Different! That is allowed. That is the entire reason you asked.", { brow: "delighted", arms: "thumbsUp" }),
    B("I researched two and chose one. You looked once and chose another.", { brow: "flat" }),
    B("Yours is not the worse method.", { eye: "half", mouth: "smirk" }),
  ],

  /* ---------- 9. ending ---------- */
  ending: [
    A("That is the whole weekend.", { mouth: "smile", eye: "closed" }),
    B("Tell me which one. And tell me what I got wrong.", { brow: "neutral", mouth: "closed" }),
    A("보라해.", { eye: "sparkle", mouth: "smile", emote: "sparkle" }),
    B("Do not explain it.", { eye: "half", mouth: "smirk" }),
  ],
};

export function beat(key: string): readonly Line[] {
  return DIALOGUE[key] ?? [];
}

export type TripSlot = "hero" | "warning";

export function tripBeat(tripId: string, slot: TripSlot): readonly Line[] {
  return beat(`trip.${tripId}.${slot}`);
}

/** Total written lines — the §4.5 target was 60–120. */
export const LINE_COUNT: number =
  Object.values(DIALOGUE).reduce((sum, lines) => sum + lines.length, 0);
