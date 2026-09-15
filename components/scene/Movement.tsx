"use client";

import { useCallback, useState, type JSX } from "react";
import { Walk, WalkLayer } from "./Walk";
import { KINDS, LAYER_BOX, LAYER_ORDER } from "./kinds";
import { Actor } from "@/components/characters/Actor";
import type { Strip } from "@/lib/scene/strip";
import type { DOutfit } from "@/lib/characters/detailed";

export type MovementProps = {
  strip: Strip;
  /** scroll height, in viewport heights */
  pace?: number;
  outfit?: DOutfit;
  /** movement 6 — they sit. No walking, no parallax of the cast. */
  still?: boolean;
  className?: string;
};

/**
 * One movement of a trip: a strip walked, with the cast on the road.
 *
 * Layers are assembled from the strip's items by the kind registry, so adding a
 * movement means writing positions, not writing a component.
 */
export function Movement({
  strip, pace = 8, outfit = "kit", still = false, className,
}: MovementProps): JSX.Element {
  const [moving, setMoving] = useState(false);
  const onMoving = useCallback((m: boolean) => setMoving(m), []);

  const byLayer = LAYER_ORDER.map((layer) => ({
    layer,
    items: strip.items.filter((i) => KINDS[i.kind]?.layer === layer),
  })).filter((g) => g.items.length > 0);

  return (
    <section className={`movement movement--${strip.terrain ?? "highway"} ${className ?? ""}`}
      data-movement={strip.id} aria-label={strip.title ?? strip.id}>
      <Walk strip={strip} scale={1} pace={pace} onMoving={onMoving}>
        <div className="walk__road" />

        {byLayer.map(({ layer, items }) => {
          const box = LAYER_BOX[layer];
          return (
            <WalkLayer key={layer} layer={layer} width={strip.width} height={box.h}
              baseline={box.baseline}>
              {items.map((item, i) => KINDS[item.kind]?.render(item, i) ?? null)}
            </WalkLayer>
          );
        })}

        <div className="walk__cast">
          <Actor id="curse" outfit={outfit} turn={1} walking={!still && moving}
            arms={still ? "crossed" : null} height={210}
            className="walk__actor walk__actor--b" />
          <Actor id="sun" outfit={outfit} turn={1} walking={!still && moving}
            height={190} className="walk__actor walk__actor--a" />
        </div>

        {strip.title && <p className="walk__title">{strip.title}</p>}
        <div className="walk__clock" data-clock="" />
        <div className="walk__rail"><i data-rail="" style={{ width: "0%" }} /></div>
      </Walk>
    </section>
  );
}
