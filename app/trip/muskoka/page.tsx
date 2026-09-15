"use client";

import type { JSX } from "react";
import "../../feel/feel.css";
import "../../walk/walk.css";
import { SmoothScroll } from "@/components/feel/SmoothScroll";
import { PointerTrail } from "@/components/feel/PointerTrail";
import { Celestial } from "@/components/scene/Celestial";
import { Movement } from "@/components/scene/Movement";
import { RouteMap } from "@/components/scene/RouteMap";
import { routeFor } from "@/lib/scene/route";
import { tripById } from "@/lib/data";
import { MUSKOKA_MOVEMENTS } from "@/lib/scene/muskoka";

const TRIP = tripById("muskoka");
const ROUTE = TRIP ? routeFor(TRIP) : null;

/** Outfits change with the world: parkas once you are properly north. */
const OUTFIT = ["kit", "parka", "parka", "parka", "parka", "kit", "parka"] as const;

export default function MuskokaPage(): JSX.Element {
  return (
    <SmoothScroll>
      <Celestial />
      <PointerTrail />
      <div className="sky" aria-hidden="true" />

      {MUSKOKA_MOVEMENTS.map((strip, i) => (
        <Movement
          key={strip.id}
          strip={strip}
          outfit={OUTFIT[i] ?? "parka"}
          pace={Math.max(5, Math.round(strip.width / 900))}
          // movement 6 is the still one: they sit, nothing parallaxes them
          still={strip.id.includes("making")}
        />
      ))}

      <section className="walk__after">
        <p>
          Muskoka, end to end. Seven movements, 43 written lines, one continuous world — and the sky computed from the real clock time at
          every step of it.
        </p>
        {ROUTE && <RouteMap route={ROUTE} />}
      </section>
    </SmoothScroll>
  );
}
