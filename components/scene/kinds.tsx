import type { JSX } from "react";
import type { Item, Layer } from "@/lib/scene/strip";
import { SteamTrain, Tree } from "./elements";
import {
  Block, Dock, Falls, Guardrail, HighwaySign, Lake, Lookout, Mural,
  RoadDashes, Storefront, Streetlight, Studio, Tower,
} from "./props";

/**
 * What each item kind is and which depth it lives at.
 *
 * With this, a movement is DATA — a list of {x, kind} — rather than a bespoke
 * page of hand-placed layers. There are thirty-five movements across five trips;
 * hand-coding the scenery for each was never going to survive contact with the
 * second one.
 */
export type KindSpec = {
  layer: Layer;
  render: (item: Item, key: number) => JSX.Element;
};

const at = (item: Item, inner: JSX.Element, key: number): JSX.Element => (
  <g key={key} transform={`translate(${item.x} ${item.y ?? 0})${item.flip ? " scale(-1 1)" : ""}`}>
    {inner}
  </g>
);

export const KINDS: Record<string, KindSpec> = {
  /* --- far --- */
  fartree: { layer: "far", render: (i, k) => at(i, <Tree kind="pine" x={0} h={90 * (i.s ?? 1)} />, k) },
  farhill: { layer: "far", render: (i, k) => at(i, <Lookout s={(i.s ?? 1) * 0.8} h={120} w={260} />, k) },
  tower:   { layer: "far", render: (i, k) => at(i, <Tower s={i.s ?? 1} />, k) },

  /* --- mid --- */
  block:   { layer: "mid", render: (i, k) => at(i, <Block s={i.s ?? 1} seed={Math.round(i.x)} />, k) },
  pine:    { layer: "mid", render: (i, k) => at(i, <Tree kind="pine" x={0} h={132 * (i.s ?? 1)} />, k) },
  birch:   { layer: "mid", render: (i, k) => at(i, <Tree kind="birch" x={0} h={150 * (i.s ?? 1)} />, k) },
  maple:   { layer: "mid", render: (i, k) => at(i, <Tree kind="maple" x={0} h={138 * (i.s ?? 1)} />, k) },
  cliff:   { layer: "mid", render: (i, k) => at(i, <Lookout s={i.s ?? 1} />, k) },
  falls:   { layer: "mid", render: (i, k) => at(i, <Falls s={i.s ?? 1} />, k) },

  /* --- near --- */
  lamp:    { layer: "near", render: (i, k) => at(i, <Streetlight s={(i.s ?? 1) * 0.92} />, k) },
  store:   { layer: "near", render: (i, k) => at(i, <Storefront s={(i.s ?? 1) * 0.92} seed={Math.round(i.x)} />, k) },
  sign:    { layer: "near", render: (i, k) => at(i, <HighwaySign s={i.s ?? 1} label={i.label ?? ""} />, k) },
  mural:   { layer: "near", render: (i, k) => at(i, <Mural s={i.s ?? 1} seed={Math.round(i.x)} />, k) },
  dock:    { layer: "near", render: (i, k) => at(i, <Dock s={i.s ?? 1} />, k) },
  studio:  { layer: "near", render: (i, k) => at(i, <Studio s={i.s ?? 1} />, k) },
  neartree:{ layer: "near", render: (i, k) => at(i, <Tree kind="birch" x={0} h={180 * (i.s ?? 1)} />, k) },
  train:   { layer: "near", render: (i, k) => at(i, <SteamTrain x={0} scale={i.s ?? 1.5} />, k) },

  /* --- spans: kinds that take a from/to rather than a point --- */
  guardrail: { layer: "near", render: (i, k) => <Guardrail key={k} from={i.x} to={i.to ?? i.x + 500} /> },
  lake:      { layer: "mid",  render: (i, k) => <Lake key={k} from={i.x} to={i.to ?? i.x + 800} depth={i.s ? i.s * 52 : 52} /> },
  dashes:    { layer: "ground", render: (i, k) => <RoadDashes key={k} from={i.x} to={i.to ?? i.x + 1000} gap={150} /> },
};

export const LAYER_ORDER: readonly Layer[] = ["far", "mid", "near", "ground"];

/** Height of each layer's SVG box, and where its baseline sits in the viewport. */
export const LAYER_BOX: Record<Layer, { h: number; baseline: string }> = {
  weather: { h: 120, baseline: "60vh" },
  far: { h: 220, baseline: "15vh" },
  mid: { h: 360, baseline: "15vh" },
  near: { h: 240, baseline: "14vh" },
  ground: { h: 40, baseline: "7vh" },
};
