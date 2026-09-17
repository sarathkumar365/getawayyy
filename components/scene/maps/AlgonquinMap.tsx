"use client";

import type { JSX } from "react";
import {
  AreaLabel, Highway, Home, INK, Label, Legend, Node, North, Park, Route, Sheet, Street,
  Water, WaterLabel,
} from "./sketch";

export const ALGONQUIN_NOTE =
  "Huntsville is the base both nights. Saturday runs east down the Highway 60 " +
  "corridor into the park and back; Sunday drops south through Dorset and " +
  "Haliburton, already on the way home.";

export function AlgonquinMap(): JSX.Element {
  return (
    <>
      <Sheet w={560} h={660}
        label="Map of the Algonquin and Haliburton route: Huntsville, east along Highway 60 into Algonquin Park, then south through Dorset to Haliburton">
        <Park d="M190 20 L540 20 L540 300 L452 300 L400 262 L318 300 L262 330 L190 318 Z" />
        <AreaLabel x={380} y={44} anchor="middle">ALGONQUIN PARK</AreaLabel>

        <Water d="M440 42 L478 34 L500 62 L492 98 L470 128 L448 116 L456 84 L436 66 Z" />
        <WaterLabel x={500} y={112} size={10}>Opeongo Lk</WaterLabel>
        <Water d="M298 142 L310 138 L316 170 L312 208 L300 212 L294 180 Z" />
        <WaterLabel x={234} y={170} size={10}>Canoe Lk</WaterLabel>
        <Water d="M318 214 L330 212 L336 238 L328 266 L316 262 L314 238 Z" />
        <Water d="M392 150 L420 144 L436 156 L426 170 L398 170 Z" />
        <WaterLabel x={436} y={140} size={10}>Lk of Two Rivers</WaterLabel>
        <Water d="M436 206 L452 204 L458 226 L450 250 L436 246 L432 226 Z" />
        <WaterLabel x={462} y={246} size={10}>Rock Lk</WaterLabel>

        <Water d="M92 318 L112 312 L114 336 L94 344 L84 332 Z" />
        <Water d="M116 296 L150 288 L162 300 L140 312 L118 312 Z" />
        <WaterLabel x={126} y={284} size={10}>Peninsula Lk</WaterLabel>
        <Water d="M126 352 L170 340 L214 352 L226 370 L204 386 L200 412 L170 420 L150 400 L118 396 L112 372 Z" />
        <WaterLabel x={132} y={438}>Lake of Bays</WaterLabel>
        <Water d="M286 446 L312 440 L318 462 L296 470 Z" />
        <Water d="M384 486 L402 482 L406 498 L388 502 Z" />
        <Water d="M352 522 L376 512 L400 528 L392 546 L360 552 Z" />
        <WaterLabel x={404} y={560} size={10}>Kashagawigamog Lk</WaterLabel>

        {/* roads */}
        <Highway points="40,650 60,500 79,321 118,302 169,318 210,295 300,250 382,199 409,186 454,167 552,140"
          label="HWY 60" lx={506} ly={170} rotate={-15} />
        <Street points="169,318 228,372 265,430 314,494 300,577 290,620" />
        <Street points="314,494 400,500 412,512 470,520" />
        <Street points="418,182 427,225" />
        <text x={46} y={470} fontFamily="var(--font-mono), monospace" fontSize="10" fill="#7d6c3c"
          transform="rotate(-84 46 470)">HWY 11</text>

        {/* Friday: up from Toronto */}
        <Route ink={INK.in} points="40,650 60,500 79,321" />
        {/* Saturday: the corridor, out and back */}
        <Route ink={INK.day} points="79,321 118,302 169,318 210,295 300,250 382,199 409,186 454,167 418,182 427,225" />
        {/* Sunday: Dorset, Haliburton, home */}
        <Route ink={INK.home} points="79,321 118,302 169,318 228,372 265,430 314,494 400,500 412,512 400,500 314,494 300,577 290,620" />

        <Home x1={290} y1={620} x2={290} y2={654} note="the way home" />

        <Node x={79} y={321} size="base" />
        <Node x={210} y={295} />
        <Node x={300} y={250} />
        <Node x={382} y={199} />
        <Node x={395} y={193} />
        <Node x={409} y={186} size="town" />
        <Node x={454} y={167} />
        <Node x={427} y={225} />
        <Node x={228} y={372} size="town" />
        <Node x={400} y={500} size="town" />
        <Node x={412} y={512} />

        <Label x={20} y={290} kind="town">Huntsville</Label>
        <Label x={20} y={303}>base · 2 nights</Label>
        <Label x={214} y={314}>West Gate</Label>
        <Label x={292} y={268} anchor="end">Art Centre</Label>
        <Label x={362} y={194} anchor="end">Lookout Trail</Label>
        <Label x={384} y={172} anchor="end">Spruce Bog</Label>
        <Label x={400} y={128} kind="town" anchor="middle">Visitor Centre</Label>
        <line x1={404} y1={132} x2={408} y2={178} stroke="#55605b" strokeWidth="0.8" />
        <Label x={462} y={188}>Logging Museum</Label>
        <Label x={436} y={272}>Booth&apos;s Rock</Label>
        <Label x={240} y={376} kind="town">Dorset</Label>
        <Label x={240} y={389}>Lookout Tower</Label>
        <Label x={420} y={492} kind="town">Haliburton</Label>
        <Label x={420} y={478}>Sculpture Forest</Label>
        <Label x={424} y={524}>Blackbird Pottery</Label>

        <North x={520} y={590} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday in" },
        { ink: INK.day, label: "Saturday · Hwy 60" },
        { ink: INK.home, label: "Sunday home" },
      ]} />
    </>
  );
}
