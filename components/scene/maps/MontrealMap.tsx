"use client";

import type { JSX } from "react";
import {
  AreaLabel, Highway, Home, INK, Label, Legend, Node, North, Park, Route, Sheet, Street,
  Land, Water, WaterLabel,
} from "./sketch";

export const MONTREAL_NOTE =
  "Saturday starts at the market up north, walks the old town and the port, " +
  "climbs the mountain for the view and comes down into the Plateau. Sunday is " +
  "the canal, the clay studio, and the road home.";

export function MontrealMap(): JSX.Element {
  return (
    <>
      <Sheet w={640} h={600}
        label="Map of Montreal: Jean-Talon Market in the north, Mount Royal in the middle, Old Montreal and the Old Port on the river, the Plateau, and the Lachine Canal to the south-west">
        <Water d="M250 600 L250 576 L373 506 L471 401 L515 324 L569 226 L603 121 L640 60 L640 600 Z" />
        <WaterLabel x={470} y={520} size={14} rotate={-48}>St. Lawrence River</WaterLabel>
        <Land d="M580 256 L602 240 L620 262 L604 298 L584 290 Z" />
        <AreaLabel x={636} y={318} anchor="end">JEAN-DRAPEAU</AreaLabel>

        <Park d="M266 300 L318 288 L358 314 L352 370 L306 384 L270 358 Z" />
        <AreaLabel x={312} y={400} anchor="middle">MONT ROYAL</AreaLabel>

        <polyline points="160,572 260,528 358,492 420,452 470,408" fill="none" stroke="#b9cdd2" strokeWidth="5"
          strokeLinecap="round" />
        <WaterLabel x={190} y={582} size={10} rotate={-24}>Lachine Canal</WaterLabel>

        {/* streets: Saint-Denis up through the Plateau, Sherbrooke across */}
        <Street points="462,346 400,240 300,40" />
        <Street points="120,430 330,330 560,190" />
        <text x={330} y={120} fontFamily="var(--font-mono), monospace" fontSize="9" fill="#9a8a62"
          transform="rotate(62 330 120)">RUE SAINT-DENIS</text>
        <Highway points="0,572 250,470 420,390 470,370" label="AUT. 20" lx={120} ly={516} rotate={-22} />

        {/* Friday in */}
        <Route ink={INK.in} points="0,572 250,470 466,338" />
        {/* Saturday: market, old town, port, mountain, Plateau */}
        <Route ink={INK.day} points="177,114 300,190 440,300 481,324 466,338 496,317 420,330 314,338 360,280 397,240" />
        {/* Sunday: the canal, then home */}
        <Route ink={INK.home} points="358,492 250,470 64,546" />

        <Home x1={64} y1={546} x2={30} y2={590} anchor="start" />

        <Node x={177} y={114} size="town" />
        <Node x={481} y={324} />
        <Node x={466} y={338} size="town" />
        <Node x={496} y={317} />
        <Node x={314} y={338} size="town" />
        <Node x={397} y={240} size="town" />
        <Node x={358} y={492} size="town" />

        <Label x={190} y={110} kind="town">Marché Jean-Talon</Label>
        <Label x={190} y={124}>Saturday, 9:00</Label>
        <Label x={490} y={356} kind="town">Old Montreal</Label>
        <Label x={490} y={369}>Notre-Dame Basilica</Label>
        <Label x={490} y={382}>Rue Saint-Paul · Old Port</Label>
        <Label x={300} y={330} kind="town" anchor="end">Kondiaronk</Label>
        <Label x={300} y={343} anchor="end">Belvedere</Label>
        <Label x={410} y={236} kind="town">The Plateau</Label>
        <Label x={410} y={249}>Saint-Denis</Label>
        <Label x={372} y={496} kind="town">Lachine Canal</Label>
        <Label x={372} y={509}>Sunday breakfast</Label>

        {/* two stops the plan names without an address, so they are not placed */}
        <g>
          <rect x={20} y={20} width={196} height={58} rx={4} fill="#f5f2ec" stroke="#b8b0a2" />
          <Label x={32} y={40}>No address in the plan yet:</Label>
          <circle cx={36} cy={53} r={3.5} fill={INK.day} />
          <Label x={46} y={56}>Korean dinner, Saturday</Label>
          <circle cx={36} cy={67} r={3.5} fill={INK.home} />
          <Label x={46} y={70}>Studio Mie Kim, Sunday 14:00</Label>
        </g>

        <North x={600} y={20} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday in" },
        { ink: INK.day, label: "Saturday on foot" },
        { ink: INK.home, label: "Sunday home" },
      ]} />
    </>
  );
}
