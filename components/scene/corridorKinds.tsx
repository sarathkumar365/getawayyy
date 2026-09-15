import type { JSX } from "react";
import type { SceneItem } from "@/lib/scene/corridor";
import { Tree } from "./elements";
import {
  Block, Dock, Falls, HighwaySign, Lookout, Mural, Storefront, Streetlight, Studio, Tower,
} from "./props";

/**
 * Billboards for the corridor.
 *
 * Each kind draws at a fixed natural size with its base at the origin; the
 * corridor then scales it by the projection. Every one of these is the SAME flat
 * SVG the lateral build used — flat art is exactly what a billboard in a
 * projected scene wants, so none of that work was lost in the change of model.
 */

/** viewBox puts (0,0) at bottom-centre, which is where a thing meets the ground. */
function board(w: number, h: number, inner: JSX.Element): JSX.Element {
  return (
    <svg width={w} height={h} viewBox={`${-w / 2} ${-h} ${w} ${h}`}
      style={{ overflow: "visible", display: "block" }} aria-hidden="true">
      {inner}
    </svg>
  );
}

export type CorridorKind = (item: SceneItem) => JSX.Element;

export const CORRIDOR_KINDS: Record<string, CorridorKind> = {
  pine:    () => board(150, 270, <Tree kind="pine" x={0} h={260} />),
  birch:   () => board(120, 310, <Tree kind="birch" x={0} h={300} />),
  maple:   () => board(170, 290, <Tree kind="maple" x={0} h={280} />),
  cedar:   () => board(130, 250, <Tree kind="cedar" x={0} h={240} />),
  apple:   () => board(150, 190, <Tree kind="apple" x={0} h={180} />),

  block:   (i) => board(220, 440, <Block s={1.3} seed={Math.round(i.z)} />),
  store:   (i) => board(220, 180, <Storefront s={1.25} seed={Math.round(i.z)} />),
  lamp:    () => board(90, 210, <Streetlight s={1.05} />),
  sign:    (i) => board(120, 190, <HighwaySign s={1.1} label={i.label ?? ""} />),
  mural:   (i) => board(170, 220, <Mural s={1.3} seed={Math.round(i.z)} />),
  dock:    () => board(240, 120, <Dock s={1.2} />),
  tower:   () => board(120, 280, <Tower s={1.3} />),
  studio:  () => board(320, 240, <Studio s={1.2} />),
  falls:   () => board(220, 300, <Falls s={1.5} h={180} w={60} />),
  cliff:   () => board(460, 280, <Lookout s={1.2} h={200} w={190} />),

  /** a flat mark on the road; they converge to the vanishing point on their own */
  dash: () => board(70, 14, <rect x={-30} y={-7} width={60} height={7} rx={3.5}
    fill="#E8E2D4" opacity={0.34} />),

  /** verge posts, which do most of the work of showing speed */
  post: () => board(22, 70, <g fill="currentColor">
    <rect x={-3} y={-64} width={6} height={64} opacity={0.75} />
    <rect x={-4} y={-64} width={8} height={9} fill="#E8E2D4" opacity={0.7} />
  </g>),
};
