/**
 * Dumps the pose tables, skeleton anchors and dialogue to JSON so a standalone
 * (no-React, no-bundler) build can drive the same rig. Exporting rather than
 * retyping is the point: the demo cannot drift from the real thing.
 */
import { writeFileSync } from "node:fs";
import {
  IDLE, WALK, ARM_POSES, ARMS_CROSSED, WALK_FRAME_NAMES, withArms,
} from "../lib/characters/rig";
import { DETAILED } from "../lib/characters/detailed";
import { DIALOGUE, LINE_COUNT } from "../lib/characters/dialogue";

const out = {
  idle: IDLE,
  walk: WALK,
  walkNames: WALK_FRAME_NAMES,
  armPoses: ARM_POSES,
  armsCrossed: ARMS_CROSSED,
  rest: {
    sun: IDLE,
    curse: withArms(IDLE, ARMS_CROSSED),
  },
  headPivot: {
    sun: DETAILED.sun.skeleton.head.pivotY,
    curse: DETAILED.curse.skeleton.head.pivotY,
  },
  accent: {
    sun: DETAILED.sun.palette.accent,
    curse: DETAILED.curse.palette.accent,
  },
  dialogue: DIALOGUE,
  lineCount: LINE_COUNT,
};

writeFileSync(
  process.argv[2] ?? "data/rig-export.json",
  JSON.stringify(out),
  "utf-8",
);
console.log(
  `exported ${Object.keys(DIALOGUE).length} beats, ${LINE_COUNT} lines, ${WALK.length} walk frames`,
);
