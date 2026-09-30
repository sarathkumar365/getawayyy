"use client";

import type { JSX } from "react";
import {
  Highway, Home, INK, Label, Legend, Node, North, Route, Sheet, Water, WaterLabel,
} from "./sketch";

/**
 * The north trip's map, in the hand-drawn style of the original Muskoka sheet.
 *
 * Towns sit where the Phase-0 coordinates put them relative to each other
 * (Bala, Bracebridge, Huntsville, Dorset). Limberlost and Sandhill Nursery are
 * placed by their addresses east and west of Huntsville, not geocoded, and
 * Algonquin sits at the sheet's east edge: it is further out than drawn. The
 * lakes are the one piece of invented geometry: simplified shorelines, drawn so
 * the sheet reads as a map rather than a diagram.
 */

export const MUSKOKA_NOTE =
  "Bracebridge is right in the middle — Huntsville is 35 minutes up. Saturday " +
  "we go back to Sandhill after dark for the lights. Sunday we're in Algonquin " +
  "by 8:15, come down Highway 35 to the Dorset tower, and head home via Bala.";

export function MuskokaMap(): JSX.Element {
  return (
    <>
      <Sheet w={760} h={660}
        label="Map of the north trip: Bracebridge, north to Huntsville, Limberlost and Sandhill Nursery on Saturday; Algonquin Park, Dorset and Bala on Sunday">
        <Water d="M150 470 L230 452 L300 478 L318 540 L280 600 L206 612 L160 574 Z" />
        <Water d="M110 372 L196 356 L250 384 L236 440 L168 450 L118 428 Z" />
        <Water d="M340 140 L402 128 L426 150 L410 176 L360 180 L336 162 Z" />
        <Water d="M500 262 L590 244 L650 270 L640 320 L580 346 L520 330 L490 298 Z" />
        <WaterLabel x={180} y={560}>Lake Muskoka</WaterLabel>
        <WaterLabel x={140} y={408}>Lake Rosseau</WaterLabel>
        <WaterLabel x={346} y={122} size={10}>Lake Vernon</WaterLabel>
        <WaterLabel x={500} y={330}>Lake of Bays</WaterLabel>

        <Highway points="330,660 363,511 400,340 443,172 460,40"
          label="HWY 11" lx={392} ly={420} rotate={-77} />
        <Highway points="363,511 470,420 560,352 696,285"
          label="HWY 117" lx={470} ly={400} rotate={-38} />
        <Highway points="123,529 200,600 300,660" />
        <Highway points="443,172 616,166 760,124"
          label="HWY 60" lx={640} ly={154} rotate={-16} />
        <Highway points="616,166 696,285" label="35" lx={668} ly={214} rotate={56} />

        <Route ink={INK.in} points="330,640 363,511" />
        <Route ink={INK.day}
          points="363,511 400,340 443,172 576,125 443,172 376,198 443,172 376,198 443,172 400,340 363,511" />
        <Route ink={INK.home}
          points="363,511 400,340 443,172 616,166 740,130 616,166 696,285 560,352 470,420 363,511 123,529 200,600 300,650" />
        <Home x1={330} y1={610} x2={330} y2={648} note="180 km · 2h" />

        <Node x={363} y={511} size="town" />
        <Node x={443} y={172} size="town" />
        <Node x={696} y={285} size="town" />
        <Node x={123} y={529} size="town" />
        <Node x={576} y={125} />
        <Node x={376} y={198} />
        <Node x={740} y={130} size="town" />

        <Label x={378} y={507} kind="town">Bracebridge</Label>
        <Label x={378} y={521}>market · falls at night</Label>
        <Label x={456} y={168} kind="town">Huntsville</Label>
        <Label x={456} y={186}>Hunters Bay · lunch</Label>
        <Label x={456} y={198}>Tall Trees · Lion&apos;s Lookout</Label>
        <Label x={566} y={112} anchor="end">Limberlost · Buck Lake</Label>
        <Label x={362} y={214} anchor="end">Sandhill Nursery</Label>
        <Label x={362} y={226} anchor="end">festival · Forest of Light</Label>
        <Label x={748} y={96} kind="town" anchor="end">Algonquin Park</Label>
        <Label x={748} y={110} anchor="end">Lookout Trail · Spruce Bog</Label>
        <Label x={748} y={122} anchor="end">Sunday, 8:15am</Label>
        <Label x={662} y={258} kind="town" anchor="end">Dorset</Label>
        <Label x={662} y={272} anchor="end">tower · Peek-a-Boo Rock</Label>
        <Label x={110} y={526} kind="town" anchor="end">Bala</Label>
        <Label x={110} y={540} anchor="end">cranberry marsh</Label>
        <Label x={110} y={552} anchor="end">(optional)</Label>

        <North x={40} y={20} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday drive up" },
        { ink: INK.day, label: "Saturday · all Huntsville" },
        { ink: INK.home, label: "Sunday · Algonquin, Dorset, Bala" },
      ]} />
    </>
  );
}
