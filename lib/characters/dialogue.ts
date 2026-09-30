/**
 * The script.
 *
 * Every factual claim below comes from `trips.json` or from the Phase 0 weather
 * pass — no invented numbers. That is deliberate: the whole point of the two
 * voices is that the file's bad news arrives in the mouth of a character whose
 * personality is being smugly right, rather than in a warnings box nobody reads.
 *
 * Voices:
 *   A (sun)   excited, thinks it will be fine, and is usually right about that.
 *   B (curse) has read the hours. Dry, teasing, correct every time.
 *
 * Both talk the way a young Indian couple talks in English: casual, warm,
 * "na" and "only" and "also" where they naturally fall — never Hindi
 * sentences, never a caricature.
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
    A("Okay, what is going on? You've been grinning at your phone the whole week.", { brow: "raised", eye: "side", mouth: "smirk" }),
    B("Because we're going on a trip, na. You and me, this October!", { brow: "neutral", mouth: "smile", emote: "blush", arms: "rest" }),
    A("Wait, the camping trip? It's actually happening?!", { eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
    B("Yeah, so... about the camping...", { brow: "worried", eye: "side", mouth: "grimace", emote: "sweat", arms: "rest" }),
    A("Oh no. That's your bad-news face.", { brow: "worried", eye: "open", mouth: "o", arms: "rest" }),
    B("I checked every campsite we talked about. Every single one, I'm telling you.", { brow: "worried", mouth: "talkA", arms: "rest" }),
    B("Nights up there are already going close to freezing.", { brow: "worried", eye: "half", emote: "cold", arms: "hug", shiver: true, scene: "cold" }),
    A("Freezing?! In a tent?!", { brow: "worried", eye: "wide", mouth: "o", emote: "cold", arms: "hug", shiver: true }),
    B("Frost on the tent in the morning. Cold toes the full night.", { brow: "worried", eye: "squint", mouth: "grimace", emote: "cold", arms: "warmHands", shiver: true }),
    A("Stop it, my nose is getting cold just listening.", { brow: "worried", eye: "squint", mouth: "grimace", emote: "cold", arms: "warmHands", shiver: true }),
    B("See? No way I'm letting you shiver the whole weekend.", { brow: "neutral", eye: "open", mouth: "smile", emote: "none", arms: "rest", shiver: false, scene: "warm" }),
    A("...So no camping, then?", { brow: "worried", eye: "half", mouth: "sad", emote: "none", arms: "rest", shiver: false }),
    B("No camping. Something much cosier.", { brow: "raised", mouth: "smile", arms: "thumbsUp" }),
    B("Two trips! Super colourful trees in the day, and something lit up at night on both.", { brow: "delighted", mouth: "talkA", arms: "rest" }),
    A("You planned TWO?", { brow: "raised", eye: "wide", mouth: "o", emote: "blush" }),
    B("Same weekend, so you choose. Come, walk through them with me.", { brow: "neutral", eye: "closed", mouth: "smile", emote: "blush", arms: "rest" }),
    A("Okay okay! Show me the north one first.", { brow: "delighted", eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
  ],

  /* ---------- 2. the quiz ---------- */
  "quiz.intro": [
    A("Just eight questions. Nothing serious, relax.", { brow: "raised" }),
    A("Nobody is watching.", { eye: "closed", mouth: "smile" }),
    B("I am watching.", { eye: "shadowed", brow: "flat", emote: "shadow" }),
  ],
  "quiz.react.nature": [
    A("Trees! So many trees!", { eye: "sparkle", mouth: "grin" }),
    B("Hundreds of kilometres of trees. You'll see every single one.", { eye: "half" }),
  ],
  "quiz.react.pottery": [
    A("There's a proper class. You make something, they fire it, they post it home!", { emote: "sparkle" }),
    B("Three weeks later. She always skips that part.", { mouth: "smirk" }),
  ],
  "quiz.react.authentic_food": [
    A("Now this one I have full opinions about.", { brow: "delighted", arms: "thumbsUp" }),
    B("She has opinions about a sandwich also.", { eye: "half", mouth: "smirk" }),
  ],
  "quiz.react.relaxation": [
    A("Noted. Slow and chill weekend.", { mouth: "smile" }),
    B("Then maybe not the one with the big climb, na.", { brow: "raised" }),
  ],
  "quiz.react.famous": [
    A("Ohh, madam wants the famous one.", { eye: "wide" }),
    B("Famous one is famous for everybody else also. Same weekend.", { brow: "furrowed" }),
  ],
  "quiz.react.photos": [
    A("Then we're doing the fire tower. And the waterfall. And the lookout!", { arms: "pointR" }),
    B("All three are uphill, just saying.", { mouth: "smirk" }),
  ],
  "quiz.react.architecture_history": [
    A("Four hundred years old! Proper old, not gift-shop old.", { eye: "sparkle" }),
    B("That one is eight hundred kilometres away. Remember you said this.", { brow: "flat" }),
  ],
  "quiz.react.korean_anime": [
    A("There's a Korean corn dog place! On the old street!", { mouth: "grin", emote: "sparkle" }),
    B("Okay fine.", { eye: "closed", mouth: "closed" }),
  ],
  "quiz.react.value": [
    A("The cheaper one is also super good, that's the best part!", { brow: "delighted" }),
    B("Cheaper, yes. Easier, no.", { mouth: "smirk" }),
  ],

  /* ---------- 3. the reveal ---------- */
  reveal: [
    A("Two! These two came out on top.", { arms: "pointL", eye: "wide" }),
    B("Nothing is final yet, okay?", { brow: "flat" }),
  ],

  /* ---------- 4. the trip worlds ---------- */
  "trip.muskoka.hero": [
    A("Closest one! Two hours and you're in the trees.", { mouth: "grin" }),
    A("And a full forest lit up at night!", { eye: "sparkle", emote: "sparkle" }),
  ],
  "trip.muskoka.warning": [
    B("Forest of Light is advance tickets only, and it sells out fast.", { brow: "furrowed" }),
    B("By the tenth the reds are going. Golds are coming in.", {}),
    B("And no bed is booked yet. Small detail.", { eye: "half", mouth: "smirk" }),
  ],

  "trip.quebec-city.hero": [
    A("A walled city, a canyon, and thousands and thousands of snow geese!", { eye: "sparkle", emote: "sparkle" }),
    B("Eight hundred kilometres. Each side.", { brow: "flat", eye: "shadowed" }),
    A("...but thousands of geese, na.", { brow: "worried", mouth: "o", emote: "sweat" }),
  ],
  "trip.quebec-city.warning": [
    B("Sunday ends with eight hours in the car. That's why Monday is a holiday.", { brow: "furrowed" }),
    B("Everyone there speaks French. Both of us don't. Adventure only.", {}),
  ],

  /* ---------- 5. the calendar ---------- */
  calendar: [
    A("One weekend. Thanksgiving. And both trips want it!", { arms: "pointR" }),
    B("The deadlines are real, and they have dates.", { brow: "flat" }),
    B("Read those before you fall in love with a weekend.", { eye: "half" }),
  ],

  /* ---------- 6. the ledger ---------- */
  ledger: [
    A("Everything, side by side!", { mouth: "smile" }),
    B("Ranges stay ranges. Averaging them is how a budget starts lying.", { brow: "furrowed" }),
  ],

  /* ---------- 7. her pick ---------- */
  herPick: [
    B("So? Which one?", { brow: "raised", eye: "open", mouth: "talkA" }),
    A("Oho, don't rush me!", { eye: "wide", mouth: "o", arms: "rest" }),
    B("Take your time. But tell me why also. The why is the part I actually want.", { brow: "neutral", mouth: "smile", emote: "blush" }),
  ],

  /* ---------- 8. his pick ---------- */
  "yourPick.match": [
    A("SAME ONE! You picked the same one!", { eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
    B("...Yes, fine. Good choice, I must say.", { brow: "raised", eye: "side", mouth: "smirk" }),
  ],
  "yourPick.mismatch": [
    A("Different! That's totally allowed. That's the whole point of asking.", { brow: "delighted", arms: "thumbsUp" }),
    B("I researched two and chose one. You looked once and chose the other.", { brow: "flat" }),
    B("Yours may not be the worse method.", { eye: "half", mouth: "smirk" }),
  ],

  /* ---------- 9. ending ---------- */
  ending: [
    A("That's the full weekend!", { mouth: "smile", eye: "closed" }),
    B("So tell me which one. And tell me what I missed.", { brow: "neutral", mouth: "closed" }),
    A("보라해.", { eye: "sparkle", mouth: "smile", emote: "sparkle" }),
    B("Don't explain it.", { eye: "half", mouth: "smirk" }),
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
