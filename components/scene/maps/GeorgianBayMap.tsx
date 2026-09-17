"use client";

import type { JSX } from "react";
import {
  AreaLabel, Highway, Home, INK, Label, Legend, Node, North, Route, Sheet, Street,
  Water, WaterLabel,
} from "./sketch";

export const GEORGIAN_BAY_NOTE =
  "Saturday comes up the Beaver Valley to Kimberley, climbs Old Baldy, and ends " +
  "on the shore at Collingwood. Sunday runs the coast west to Owen Sound and " +
  "back, with pottery on Collingwood's main street before home.";

export function GeorgianBayMap(): JSX.Element {
  return (
    <>
      <Sheet w={600} h={560}
        label="Map of the Georgian Bay route: Kimberley and the Beaver Valley, Eugenia Falls, Scenic Caves, Thornbury and Collingwood, then west along the shore to Owen Sound and Meaford">
        <Water d="M0 0 L0 40 L30 90 L60 150 L88 183 L118 150 L165 95 L215 70 L250 95 L262 150 L300 170 L336 190 L390 210 L450 232 L500 236 L550 220 L600 190 L600 0 Z" />
        <WaterLabel x={330} y={80} size={14}>Georgian Bay</WaterLabel>
        <WaterLabel x={500} y={200} size={10}>Nottawasaga Bay</WaterLabel>
        <WaterLabel x={20} y={110} size={10}>Owen Sound</WaterLabel>

        {/* Lake Eugenia and the Beaver River running down the valley to Thornbury */}
        <Water d="M318 360 L342 352 L352 372 L336 388 L316 382 Z" />
        <WaterLabel x={358} y={384} size={10}>Lake Eugenia</WaterLabel>
        <polyline points="316,382 304,350 296,300 316,250 336,200" fill="none" stroke="#8fadb5" strokeWidth="2" />
        <AreaLabel x={270} y={300} rotate={-80}>BEAVER VALLEY</AreaLabel>
        <polyline points="80,270 160,290 240,262 262,330 280,420" fill="none" stroke="#a89878"
          strokeWidth="1.4" strokeDasharray="2 5" />
        <polyline points="360,420 356,320 400,278 470,300" fill="none" stroke="#a89878"
          strokeWidth="1.4" strokeDasharray="2 5" />
        <AreaLabel x={120} y={304}>ESCARPMENT</AreaLabel>
        <AreaLabel x={470} y={360}>BLUE MOUNTAINS</AreaLabel>

        {/* roads */}
        <Highway points="60,210 90,195 180,188 265,167 336,202 390,222 451,244 551,240"
          label="HWY 26" lx={150} ly={180} rotate={-3} />
        <Street points="336,202 300,260 291,321 301,377 286,412 300,560" />
        <Street points="301,377 360,300 411,251" />
        <Street points="451,244 500,330 590,520" />
        <Street points="90,195 95,223 110,320" />

        {/* Saturday in from Toronto, up through Flesherton */}
        <Route ink={INK.in} points="300,550 286,412 301,377 291,321" />
        {/* Saturday: the valley */}
        <Route ink={INK.day} points="291,321 306,328 291,321 301,377 360,300 411,251 336,202 390,222 451,244" />
        {/* Sunday: west along the shore and back, then home */}
        <Route ink={INK.home} points="451,244 390,222 336,202 265,167 180,188 90,195 95,223 90,195 180,188 245,195 265,167 336,202 390,222 451,244 500,330 560,455" />

        <Home x1={560} y1={455} x2={586} y2={510} anchor="end" />

        <Node x={451} y={244} size="base" ink={INK.home} />
        <Node x={291} y={321} size="town" />
        <Node x={306} y={328} />
        <Node x={301} y={377} />
        <Node x={411} y={251} />
        <Node x={336} y={202} size="town" />
        <Node x={90} y={195} size="town" />
        <Node x={95} y={223} />
        <Node x={265} y={167} size="town" />
        <Node x={245} y={195} />

        <Label x={464} y={264} kind="town">Collingwood</Label>
        <Label x={464} y={277}>Hello Pottery · dinner</Label>
        <Label x={280} y={325} kind="town" anchor="end">Kimberley</Label>
        <Label x={316} y={338}>Old Baldy</Label>
        <Label x={290} y={392} anchor="end">Eugenia Falls</Label>
        <Label x={420} y={294} anchor="middle">Scenic Caves</Label>
        <Label x={346} y={218} kind="town">Thornbury</Label>
        <Label x={80} y={188} kind="town" anchor="end">Owen Sound</Label>
        <Label x={104} y={238}>Inglis Falls</Label>
        <Label x={258} y={156} kind="town" anchor="end">Meaford</Label>
        <Label x={228} y={214} anchor="end">Irish Mountain</Label>
        <Label x={228} y={225} anchor="end">Lookout</Label>
        <Label x={310} y={540}>from Toronto</Label>

        <North x={30} y={470} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Saturday in" },
        { ink: INK.day, label: "Saturday · the valley" },
        { ink: INK.home, label: "Sunday · the shore, home" },
      ]} />
    </>
  );
}
