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
 * placed by their addresses east and west of Huntsville, not geocoded. The
 * lakes are the one piece of invented geometry: simplified shorelines, drawn so
 * the sheet reads as a map rather than a diagram.
 */

export const MUSKOKA_NOTE =
  "Bracebridge is right in the middle — Huntsville is 35 minutes up, Dorset " +
  "50 minutes east. Saturday we go back to Sandhill after dark for the lights, " +
  "and Sunday we swing back through Bracebridge and head home via Bala.";

export function MuskokaMap(): JSX.Element {
  return (
    <>
      <Sheet w={760} h={660}
        label="Map of the north trip: Bracebridge, north to Huntsville, Limberlost and Sandhill Nursery on Saturday, east to Dorset and back through Bala on Sunday">
        <Water d="M150 470 L230 452 L300 478 L318 540 L280 600 L206 612 L160 574 Z" />
        <Water d="M110 372 L196 356 L250 384 L236 440 L168 450 L118 428 Z" />
        <Water d="M340 140 L402 128 L426 150 L410 176 L360 180 L336 162 Z" />
        <Water d="M604 176 L660 168 L682 184 L666 204 L614 206 Z" />
        <Water d="M500 262 L590 244 L650 270 L640 320 L580 346 L520 330 L490 298 Z" />
        <WaterLabel x={180} y={560}>Lake Muskoka</WaterLabel>
        <WaterLabel x={140} y={408}>Lake Rosseau</WaterLabel>
        <WaterLabel x={346} y={122} size={10}>Lake Vernon</WaterLabel>
        <WaterLabel x={612} y={222} size={10}>Peninsula Lk</WaterLabel>
        <WaterLabel x={500} y={330}>Lake of Bays</WaterLabel>

        <Highway points="330,660 363,511 400,340 443,172 460,40"
          label="HWY 11" lx={392} ly={420} rotate={-77} />
        <Highway points="363,511 470,420 560,352 696,285"
          label="HWY 117" lx={470} ly={400} rotate={-38} />
        <Highway points="123,529 200,600 300,660" />

        <Route ink={INK.in} points="330,640 363,511" />
        <Route ink={INK.day}
          points="363,511 400,340 443,172 576,125 443,172 376,198 443,172 376,198 443,172 400,340 363,511" />
        <Route ink={INK.home}
          points="363,511 470,420 560,352 696,285 560,352 470,420 363,511 123,529 200,600 300,650" />
        <Home x1={330} y1={610} x2={330} y2={648} note="180 km · 2h" />

        <Node x={363} y={511} size="town" />
        <Node x={443} y={172} size="town" />
        <Node x={696} y={285} size="town" />
        <Node x={123} y={529} size="town" />
        <Node x={576} y={125} />
        <Node x={376} y={198} />

        <Label x={378} y={507} kind="town">Bracebridge</Label>
        <Label x={378} y={521}>market · falls at night</Label>
        <Label x={378} y={533}>Wilson&apos;s Falls</Label>
        <Label x={456} y={168} kind="town">Huntsville</Label>
        <Label x={456} y={186}>Hunters Bay · lunch</Label>
        <Label x={456} y={198}>Tall Trees · Lion&apos;s Lookout</Label>
        <Label x={590} y={121}>Limberlost · Buck Lake</Label>
        <Label x={362} y={214} anchor="end">Sandhill Nursery</Label>
        <Label x={362} y={226} anchor="end">festival · Forest of Light</Label>
        <Label x={684} y={264} kind="town" anchor="end">Dorset</Label>
        <Label x={684} y={248} anchor="end">tower · Peek-a-Boo Rock</Label>
        <Label x={110} y={526} kind="town" anchor="end">Bala</Label>
        <Label x={110} y={540} anchor="end">cranberry marsh</Label>
        <Label x={110} y={552} anchor="end">(optional)</Label>

        <North x={720} y={20} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday drive up" },
        { ink: INK.day, label: "Saturday · all Huntsville" },
        { ink: INK.home, label: "Sunday · Dorset, then home" },
      ]} />
    </>
  );
}
