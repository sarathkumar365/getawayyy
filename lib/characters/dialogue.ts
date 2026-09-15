/**
 * The script.
 *
 * Every factual claim below comes from `trips.json` or from the Phase 0 weather
 * pass — no invented numbers. That is deliberate: the whole point of the two
 * voices is that the file's bad news arrives in the mouth of a character whose
 * personality is being smugly right, rather than in a warnings box nobody reads.
 *
 * Voices:
 *   A (sun)   sells it. Short, loud, specific, delighted by cheap things.
 *   B (curse) delivers the cost. Dry, declarative, correct every time, and
 *             insufferable about it. Never aimed at Anjali — his contempt is
 *             reserved for bad ideas, long drives, and A.
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
};

const A = (text: string, x: Omit<Line, "who" | "text"> = {}): Line =>
  ({ who: "sun", mouth: "talkA", ...x, text });
const B = (text: string, x: Omit<Line, "who" | "text"> = {}): Line =>
  ({ who: "curse", mouth: "talkA", arms: "crossed", ...x, text });

export const DIALOGUE: Record<string, readonly Line[]> = {
  /* ---------- 1. arrival ---------- */
  arrival: [
    A("Okay. Okay okay okay.", { eye: "sparkle", emote: "sparkle", arms: "handsUp" }),
    A("Anjali — you are going somewhere in October.", { brow: "delighted" }),
    B("She can read.", { eye: "half", mouth: "smirk" }),
    A("Five directions out of Toronto. One weekend. We found all of them.", { arms: "pointL" }),
    B("He found the gift shops. I found the problems.", { brow: "flat" }),
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
    B("Three weeks later. He never includes that part.", { mouth: "smirk" }),
  ],
  "quiz.react.authentic_food": [
    A("Right. This one I have opinions about.", { brow: "delighted", arms: "thumbsUp" }),
    B("He has opinions about a sandwich.", { eye: "half", mouth: "smirk" }),
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
    B("Cheapest one is also the one he keeps calling a stroll.", { mouth: "smirk" }),
  ],

  /* ---------- 3. the reveal ---------- */
  reveal: [
    A("Two. These two came out on top.", { arms: "pointL", eye: "wide" }),
    B("Out of five. The other three did not vanish. Nothing is decided.", { brow: "flat" }),
    A("Want all five? The compass is right there.", { arms: "pointR", mouth: "smile" }),
  ],

  /* ---------- 4. the trip worlds ---------- */
  "trip.muskoka.hero": [
    A("Closest one. Two hours and you are in cottage country.", { mouth: "grin" }),
    A("And there is a steam train.", { eye: "sparkle", emote: "sparkle" }),
  ],
  "trip.muskoka.warning": [
    B("It is also the wetter of the two north options. Forty-eight percent of October days see rain.", { brow: "furrowed" }),
    B("Colour was ten percent on the fourteenth of September. Peak lands around Thanksgiving.", {}),
    B("Which is the last weekend Muskoka Heritage Place opens at all.", { eye: "half", mouth: "smirk" }),
    A("The pottery booking is confirmed, though. That one is real.", { brow: "raised", arms: "thumbsUp" }),
  ],

  "trip.algonquin-haliburton.hero": [
    A("This is the famous one. Maple hills, a sculpture forest, a fire tower.", { eye: "sparkle" }),
    A("Pack lunch. There is almost no food on the Highway 60 corridor.", { arms: "pointL" }),
    B("He is right. It cost me nothing to say that.", { mouth: "smirk" }),
  ],
  "trip.algonquin-haliburton.warning": [
    B("Sugar maple peaks on the twenty-seventh of September. Your window is October.", { brow: "flat" }),
    B("You are booking the golden encore, not the red show.", {}),
    B("And the park's own colour report names your weekend as one of the busiest of the year. Trailhead parking fills early.", { brow: "furrowed" }),
    B("The day-use permit and the tower fee are estimates. Not quotes.", { eye: "half" }),
  ],

  "trip.montreal.hero": [
    A("This is the one that hits everything. Architecture, a pottery class, a real Koreatown.", { mouth: "grin", emote: "sparkle" }),
    B("And a car you will resent inside an hour.", { brow: "flat" }),
  ],
  "trip.montreal.warning": [
    B("Old Port parking is thirty-five dollars for three hours. Seventy for the day.", { brow: "furrowed" }),
    B("Park at Champ-de-Mars instead. Fifteen to twenty for the same stay.", {}),
    A("Or take the bus. For two people it costs about what renting and fuelling a car costs.", { arms: "pointR" }),
    B("Eleven hours of driving, round trip. He is being generous to the car.", { mouth: "smirk" }),
  ],

  "trip.georgian-bay.hero": [
    A("Cliffs, waterfalls, and a suspension bridge.", { eye: "wide", arms: "handsUp" }),
    A("Cheapest of the three to run, and the best colour drive in southern Ontario.", { brow: "delighted" }),
  ],
  "trip.georgian-bay.warning": [
    B("Old Baldy is a six-kilometre climb with real elevation. It is not a stroll.", { brow: "angry", emote: "anger" }),
    B("Scenic Caves wants proper shoes and has limited parking. Arrive early or do not arrive.", { brow: "flat" }),
    B("Blue Mountain village spikes hard on colour weekends. Owen Sound and Meaford do not.", { eye: "half" }),
  ],

  "trip.quebec-city.hero": [
    A("A walled seventeenth-century city. And a waterfall taller than Niagara.", { eye: "sparkle", emote: "sparkle" }),
    B("Eight hundred kilometres. Each way.", { brow: "flat", eye: "shadowed" }),
    A("...taller than Niagara, though.", { brow: "worried", mouth: "o", emote: "sweat" }),
  ],
  "trip.quebec-city.warning": [
    B("Do not attempt this Saturday to Sunday. That is not advice, it is arithmetic.", { brow: "furrowed" }),
    B("The city is overwhelmingly French-speaking, and further from English than Montreal. Neither of you speaks French.", {}),
  ],

  /* ---------- 4b. the north fork ---------- */
  northFork: [
    A("Two versions of the same north trip. Lakes and towns, or forest and art.", { arms: "pointL" }),
    B("You are not choosing between two trips.", { brow: "flat" }),
    B("You are choosing which half of the north you give up.", { eye: "half", mouth: "smirk" }),
  ],

  /* ---------- 4c. the honest problem — B's screen ---------- */
  honestProblem: [
    B("Here is the whole thing. Four ways to do it, side by side.", { brow: "flat", mouth: "talkA" }),
    B("Flying is not the extravagant option. Driving sixteen hours across a weekend is.", {}),
    B("And the flight cost is a range, not a quote. It moves the total by several hundred dollars.", { brow: "furrowed" }),
    B("So: fly, skip the rental, take the combined falls-and-island tour. Then you never need a car.", {}),
    A("...I have got nothing.", { brow: "worried", eye: "side", mouth: "closed", emote: "sweat", arms: "rest" }),
    B("Write that down.", { mouth: "smirk", eye: "half" }),
  ],

  /* ---------- 5. the calendar ---------- */
  calendar: [
    A("Five weekends in October. All of them, right here.", { arms: "pointR" }),
    B("Two of them collide with something. Six of the deadlines are real and dated.", { brow: "flat" }),
    B("Read those before you fall in love with a weekend.", { eye: "half" }),
  ],

  /* ---------- 6. the ledger ---------- */
  ledger: [
    A("Everything, side by side.", { mouth: "smile" }),
    B("The ranges stay ranges. Averaging a range into one number is how a budget becomes a lie.", { brow: "furrowed" }),
    A("There is a fifth one down there, under five hundred dollars.", { eye: "wide", arms: "pointL" }),
    B("It is a footnote. It lost, and the reasons are written down.", { mouth: "smirk" }),
  ],

  /* ---------- 7. her pick ---------- */
  herPick: [
    A("Okay. Which one.", { eye: "wide", mouth: "o", arms: "rest" }),
    B("Take as long as you like. Nobody is waiting.", { brow: "neutral", eye: "open", mouth: "closed" }),
    A("And say why. The why is the part he actually wants.", { brow: "delighted", emote: "blush" }),
  ],

  /* ---------- 8. his pick ---------- */
  "yourPick.match": [
    A("THE SAME ONE. You picked the same one.", { eye: "sparkle", mouth: "grin", emote: "sparkle", arms: "handsUp" }),
    B("...Yes. Fine. That was a good weekend to choose.", { brow: "raised", eye: "side", mouth: "smirk" }),
  ],
  "yourPick.mismatch": [
    A("Different! That is allowed. That is the entire reason he asked.", { brow: "delighted", arms: "thumbsUp" }),
    B("He researched five and chose one. You looked once and chose another.", { brow: "flat" }),
    B("Yours is not the worse method.", { eye: "half", mouth: "smirk" }),
  ],

  /* ---------- 9. ending ---------- */
  ending: [
    A("That is it. That is everything we found.", { mouth: "smile", eye: "closed" }),
    B("Send it back. He wants the notes more than he wants the answer.", { brow: "neutral", mouth: "closed" }),
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
