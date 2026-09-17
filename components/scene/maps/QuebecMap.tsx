"use client";

import type { JSX } from "react";
import {
  AreaLabel, Highway, Home, INK, Label, Land, Legend, Node, North, Park, Route, Sheet, Street,
  Water, WaterLabel,
} from "./sketch";

export const QUEBEC_NOTE =
  "Saturday never leaves the walls — the terrace, the lower town, Rue Saint-Jean " +
  "and the Plains, all on foot. Sunday follows the river east to Montmorency " +
  "Falls and crosses onto Île d'Orléans before the long road home.";

/** The old town is a few hundred metres across; at the scale of the island it is a dot. */
const IX = 356;
const IY = 368;

export function QuebecMap(): JSX.Element {
  return (
    <>
      <Sheet w={640} h={580}
        label="Map of Quebec City: the walled old town with the terrace, Petit-Champlain, Rue Saint-Jean and the Plains of Abraham, then east along the river to Montmorency Falls and Île d'Orléans">
        <Water d="M0 430 L140 360 L230 300 L330 250 L460 190 L640 110 L640 260 L520 300 L380 350 L260 380 L160 420 L0 500 Z" />
        <Land d="M330 268 L360 250 L460 206 L640 132 L640 200 L520 262 L420 300 L350 296 Z" />
        <WaterLabel x={170} y={430} size={14} rotate={-24}>St. Lawrence</WaterLabel>
        <AreaLabel x={560} y={196} rotate={-22} anchor="middle">ÎLE D&apos;ORLÉANS</AreaLabel>
        <polyline points="296,150 304,200 312,252" fill="none" stroke="#8fadb5" strokeWidth="2" />

        <Highway points="0,408 146,340 230,284 310,236 460,172 600,112"
          label="AUT. 40 / 440" lx={372} ly={196} rotate={-24} />
        <Street points="340,244 352,258 420,236 520,212 610,176" />

        <Route ink={INK.in} points="0,408 146,340" />
        <Route ink={INK.home} points="146,340 230,284 310,236 340,244 352,258 470,238 352,258 340,244 310,236 230,284 146,340 60,380" />
        <Home x1={60} y1={380} x2={50} y2={432} />

        <Node x={146} y={340} size="base" ink={INK.day} />
        <Node x={310} y={236} size="town" />
        <Node x={470} y={238} size="town" />

        <Label x={134} y={312} kind="town" anchor="end">Old Quebec</Label>
        <Label x={134} y={325} anchor="end">base · inside the walls</Label>
        <Label x={300} y={220} kind="town" anchor="end">Montmorency Falls</Label>
        <Label x={482} y={256}>orchards · loop road</Label>

        {/* the old town, blown up */}
        <line x1={146} y1={340} x2={IX} y2={IY + 90} stroke="#6d6458" strokeWidth="1" strokeDasharray="3 3" />
        <g transform={`translate(${IX} ${IY})`}>
          <rect x={0} y={0} width={270} height={196} fill="#ebe6dc" stroke="#6d6458" strokeWidth="1.2" />
          <Water d="M190 196 L226 146 L270 100 L270 196 Z" />
          <Park d="M8 144 L96 158 L130 190 L8 190 Z" />
          <AreaLabel x={14} y={184}>PLAINS OF ABRAHAM</AreaLabel>
          <path d="M44 56 L150 32 L204 86 L196 146 L118 166 L36 118 Z" fill="none" stroke="#a8945f"
            strokeWidth="2" strokeDasharray="6 3" />
          <AreaLabel x={30} y={140}>THE WALLS</AreaLabel>
          <polyline points="198,94 214,120 222,146" fill="none" stroke="#8a7f70" strokeWidth="1.2"
            strokeDasharray="1 3" />
          <Street points="62,82 168,66" />

          <Route ink={INK.day} points="186,104 216,160 168,110 112,74 70,168 128,118" />

          <Node x={186} y={104} size="town" />
          <Node x={216} y={160} />
          <Node x={112} y={74} />
          <Node x={70} y={168} />
          <Node x={128} y={118} />

          <Label x={198} y={100}>Château</Label>
          <Label x={198} y={112}>Terrace</Label>
          <Label x={206} y={176} anchor="end">Petit-Champlain</Label>
          <Label x={112} y={62} anchor="middle">Rue Saint-Jean</Label>
          <Label x={140} y={130}>dinner</Label>
          <Label x={10} y={16}>OLD QUEBEC · SATURDAY</Label>
        </g>

        <g>
          <rect x={16} y={500} width={184} height={42} rx={4} fill="#f5f2ec" stroke="#b8b0a2" />
          <Label x={28} y={517}>No studio chosen yet:</Label>
          <circle cx={32} cy={530} r={3.5} fill={INK.day} />
          <Label x={42} y={533}>Pottery, Saturday 16:30</Label>
        </g>

        <North x={600} y={16} />
      </Sheet>
      <Legend items={[
        { ink: INK.in, label: "Friday in" },
        { ink: INK.day, label: "Saturday on foot" },
        { ink: INK.home, label: "Sunday · falls, island, home" },
      ]} />
    </>
  );
}
