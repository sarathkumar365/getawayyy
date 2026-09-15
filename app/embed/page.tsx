import type { JSX } from "react";
import { DetailedCharacter } from "@/components/characters/DetailedCharacter";
import { IDLE } from "@/lib/characters/rig";

/**
 * Extraction target. Renders both characters with every expression variant
 * present in the markup, so a standalone (no-React) build can drive them.
 * Not part of the journey — this exists to be scraped at build time.
 */
export default function Embed(): JSX.Element {
  return (
    <div id="embed">
      <div id="rig-sun">
        <DetailedCharacter id="sun" uid="a" pose={IDLE} turn={0.5} variants />
      </div>
      <div id="rig-curse">
        <DetailedCharacter id="curse" uid="b" pose={IDLE} turn={0.5} variants />
      </div>
    </div>
  );
}
