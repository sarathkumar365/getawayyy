"use client";

import { useCallback, useState, type JSX } from "react";
import "../feel/feel.css";
import "../walk/walk.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { Celestial } from "@/components/scene/Celestial";
import { Corridor } from "@/components/scene/Corridor";
import { RearActor } from "@/components/characters/RearActor";
import { MUSKOKA_LEG_1 } from "@/lib/scene/muskoka-legs";

export default function CorridorPage(): JSX.Element {
  const [moving, setMoving] = useState(false);
  const onMoving = useCallback((m: boolean) => setMoving(m), []);

  return (
    <SmoothScroll>
      <Celestial />
      <PointerTrail />
      <div className="sky" aria-hidden="true" />

      <Corridor leg={MUSKOKA_LEG_1} pace={10} onMoving={onMoving}
        className={`corridor--${MUSKOKA_LEG_1.terrain ?? "highway"}`}>
        <div className="corridor__cast" data-cast="">
          <RearActor id="curse" walking={moving} className="rear rear--b" />
          <RearActor id="sun" walking={moving} className="rear rear--a" />
        </div>
      </Corridor>

      <section className="walk__after">
        <p>
          Leg 1, rebuilt as a corridor. The world now comes toward you and passes,
          and the cast walks into it ahead of you.
        </p>
      </section>
    </SmoothScroll>
  );
}
