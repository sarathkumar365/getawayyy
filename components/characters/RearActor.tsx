"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { RearCharacter } from "./RearCharacter";
import { createRearMotion, type RearMotion } from "@/lib/characters/rearMotion";
import type { DetailId } from "@/lib/characters/detailed";

export type RearActorProps = {
  id: DetailId;
  walking?: boolean;
  /** folded down on the ground, looking up — what they do at a stop */
  sitting?: boolean;
  className?: string;
};

/** A rear-view figure that walks while she scrolls. */
export function RearActor({ id, walking = false, sitting = false, className }: RearActorProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const motion = useRef<RearMotion | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const svg = host.current?.querySelector("svg");
    if (!svg) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = createRearMotion(svg, {
      id, reduced,
      cadence: id === "sun" ? 0.95 : 0.74,
    });
    motion.current = m;
    setReady(true);
    return () => { m.kill(); motion.current = null; };
  }, [id]);

  useEffect(() => { motion.current?.walk(walking); }, [walking]);
  useEffect(() => { motion.current?.sit(sitting); }, [sitting]);

  return (
    <div ref={host} className={className}
      style={{ opacity: ready ? 1 : 0, transition: "opacity .35s ease" }}>
      <RearCharacter id={id} uid={`rear-actor-${id}`} />
    </div>
  );
}
