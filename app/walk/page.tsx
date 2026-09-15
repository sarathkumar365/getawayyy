"use client";

import type { JSX } from "react";
import "../feel/feel.css";
import "./walk.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { Celestial } from "@/components/scene/Celestial";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { Walk, WalkLayer } from "@/components/scene/Walk";
import { Tree } from "@/components/scene/elements";
import { Block, Guardrail, HighwaySign, Lake, RoadDashes, Storefront, Streetlight } from "@/components/scene/props";
import { MUSKOKA_OPENING, RANGES } from "@/lib/scene/muskoka-opening";
import { RouteMap } from "@/components/scene/RouteMap";
import { routeFor } from "@/lib/scene/route";
import { tripById } from "@/lib/data";

const S = MUSKOKA_OPENING;
const pick = (kind: string) => S.items.filter((i) => i.kind === kind);
const TRIP = tripById("muskoka");
const ROUTE = TRIP ? routeFor(TRIP) : null;

export default function WalkPage(): JSX.Element {
  return (
    <SmoothScroll>
      <Celestial />
      <PointerTrail />
      <div className="sky" aria-hidden="true" />

      <Walk strip={S} scale={1} pace={9}>
        <div className="walk__road" />

        <WalkLayer layer="far" width={RANGES.WIDTH} height={200} baseline="15vh">
          {pick("fartree").map((t, i) => (
            <g key={i} transform={`translate(${t.x} 0)`}>
              <Tree kind="pine" x={0} h={90 * (t.s ?? 1)} />
            </g>
          ))}
        </WalkLayer>

        <WalkLayer layer="mid" width={RANGES.WIDTH} height={340} baseline="15vh">
          <g><Lake from={RANGES.HIGHWAY_END} to={RANGES.LAKE_END + 400} depth={52} /></g>
          {pick("block").map((b, i) => (
            <g key={i} transform={`translate(${b.x} 0)`}>
              <Block s={b.s ?? 1} seed={i * 7 + 3} />
            </g>
          ))}
          {pick("pine").map((t, i) => (
            <g key={i} transform={`translate(${t.x} 0)`}>
              <Tree kind="pine" x={0} h={132 * (t.s ?? 1)} />
            </g>
          ))}
        </WalkLayer>

        <WalkLayer layer="near" width={RANGES.WIDTH} height={140} baseline="14vh">
          <Guardrail from={RANGES.THIN_END + 220} to={RANGES.HIGHWAY_END} />
          {pick("store").map((s, i) => (
            <g key={i} transform={`translate(${s.x} 0)`}>
              <Storefront s={0.92} seed={i * 11 + 5} />
            </g>
          ))}
          {pick("lamp").map((l, i) => (
            <g key={i} transform={`translate(${l.x} 0)`}>
              <Streetlight s={0.92} />
            </g>
          ))}
          {pick("sign").map((s, i) => (
            <g key={i} transform={`translate(${s.x} 0)`}>
              <HighwaySign s={s.s ?? 1} label={i === 0 ? "11" : "N"} />
            </g>
          ))}
        </WalkLayer>

        <WalkLayer layer="ground" width={RANGES.WIDTH} height={30} baseline="7vh">
          <RoadDashes from={0} to={RANGES.WIDTH} gap={150} />
        </WalkLayer>

        <div className="walk__clock" data-clock="" />
        <div className="walk__rail"><i data-rail="" style={{ width: "0%" }} /></div>
      </Walk>

      <section className="walk__after">
        <p>
          That is movement 1 of 7, for one of five trips. The scenery and the sentence
          share one axis — the last streetlight passes while the line about it is on screen.
        </p>
        {ROUTE && <RouteMap route={ROUTE} />}
      </section>
    </SmoothScroll>
  );
}
