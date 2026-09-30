"use client";

import type { JSX } from "react";
import {
  AreaLabel, Highway, Home, INK, Label, Land, Legend, Node, North, Park, Route, Sheet, Street,
  Water, WaterLabel,
} from "./sketch";

export const QUEBEC_NOTE =
  "Friday we only go till Montreal. Saturday we zoom past Quebec City up into " +
  "the Jacques-Cartier valley, then come back down and walk the old town till " +
  "late. Sunday we follow the river east to the geese at Cap Tourmente, hop " +
  "onto Île d'Orléans, and then the long drive home.";

/** The old town is a few hundred metres across; at the scale of the river it is a dot. */
const IX = 350;
const IY = 320;

export function QuebecMap(): JSX.Element {
  return (
    <>
      <Sheet w={640} h={520}
        label="Map of the Quebec trip: Montreal on Friday, the Jacques-Cartier valley and Old Quebec on Saturday, then east along the river to Montmorency Falls, Canyon Sainte-Anne, Cap Tourmente and Île d'Orléans on Sunday">
        <Water d="M60 500 L200 392 L330 272 L400 245 L520 215 L640 170 L640 240 L520 300 L400 320 L330 300 L210 410 L90 520 Z" />
        <Land d="M395 258 L470 240 L530 238 L510 262 L440 285 L400 282 Z" />
        <WaterLabel x={196} y={430} size={14} rotate={-40}>St. Lawrence</WaterLabel>
        <Park d="M236 52 L320 44 L340 86 L318 124 L252 122 L230 88 Z" />
        <AreaLabel x={230} y={36}>PARC NATIONAL DE LA JACQUES-CARTIER</AreaLabel>

        <Highway points="60,480 200,370 330,250 380,222 470,175 560,130 640,100"
          label="AUT. 40 / 138" lx={170} ly={362} rotate={-38} />
        <Highway points="330,250 300,170 285,50" label="175" lx={270} ly={150} rotate={-75} />

        <Route ink={INK.in} points="24,504 70,478" />
        <Route ink={INK.day} points="70,478 200,370 330,250 300,170 282,88 300,170 330,250" />
        <Route ink={INK.home}
          points="330,250 380,222 470,175 470,140 470,175 560,130 575,110 560,130 470,175 440,190 455,262 330,250 200,370 70,478 24,504" />
        <Home x1={70} y1={478} x2={20} y2={506} note="540 km · 5h30 to Montreal" />

        <Node x={70} y={478} size="town" ink={INK.in} />
        <Node x={330} y={250} size="town" />
        <Node x={300} y={170} />
        <Node x={282} y={88} />
        <Node x={380} y={222} />
        <Node x={470} y={140} />
        <Node x={575} y={110} />
        <Node x={455} y={262} />

        <Label x={84} y={474} kind="town">Montreal</Label>
        <Label x={84} y={488}>Alt Hotel · sleep only</Label>
        <Label x={318} y={256} kind="town" anchor="end">Old Quebec</Label>
        <Label x={290} y={174} anchor="end">Stoneham · lunch</Label>
        <Label x={272} y={92} anchor="end">Les Loups</Label>
        <Label x={384} y={242}>Montmorency</Label>
        <Label x={470} y={128} anchor="middle">Canyon Ste-Anne</Label>
        <Label x={575} y={96} anchor="middle">Cap Tourmente · geese</Label>
        <Label x={500} y={186}>Beaupré · lunch</Label>
        <Label x={468} y={280}>Île d&apos;Orléans</Label>

        {/* the old town, blown up */}
        <line x1={330} y1={250} x2={IX} y2={IY} stroke="#6d6458" strokeWidth="1" strokeDasharray="3 3" />
        <g transform={`translate(${IX} ${IY})`}>
          <rect x={0} y={0} width={270} height={196} fill="#ebe6dc" stroke="#6d6458" strokeWidth="1.2" />
          <Water d="M190 196 L226 146 L270 100 L270 196 Z" />
          <path d="M44 56 L150 32 L204 86 L196 146 L118 166 L36 118 Z" fill="none" stroke="#a8945f"
            strokeWidth="2" strokeDasharray="6 3" />
          <AreaLabel x={30} y={140}>THE WALLS</AreaLabel>
          <polyline points="198,94 214,120 222,146" fill="none" stroke="#8a7f70" strokeWidth="1.2"
            strokeDasharray="1 3" />
          <Street points="62,82 168,66" />

          <Route ink={INK.day} points="186,104 216,160 186,104 112,74 128,118 44,56 36,118 118,166" />

          <Node x={186} y={104} size="town" />
          <Node x={216} y={160} />
          <Node x={112} y={74} />
          <Node x={128} y={118} />

          <Label x={198} y={100}>Château</Label>
          <Label x={198} y={112}>Terrace</Label>
          <Label x={206} y={176} anchor="end">Petit-Champlain</Label>
          <Label x={112} y={62} anchor="middle">Rue Saint-Jean · kogo</Label>
          <Label x={140} y={130}>dinner</Label>
          <Label x={10} y={16}>OLD QUEBEC · SATURDAY NIGHT</Label>
        </g>

        <North x={30} y={16} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday · just till Montreal" },
        { ink: INK.day, label: "Saturday · valley, then the walls" },
        { ink: INK.home, label: "Sunday · river, geese, island, home" },
      ]} />
    </>
  );
}
