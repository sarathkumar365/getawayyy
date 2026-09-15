"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { gsap } from "gsap";
import { DetailedCharacter } from "./DetailedCharacter";
import { createMotion, type Motion } from "@/lib/characters/motion";
import { ARM_POSES, ARMS_CROSSED, IDLE, withArms, type ArmPose, type Pose } from "@/lib/characters/rig";
import { DETAILED, type DBrow, type DEmote, type DetailId, type DEye, type DMouth, type DOutfit } from "@/lib/characters/detailed";

export type Expression = {
  brow?: DBrow;
  eye?: DEye;
  mouth?: DMouth;
  emote?: DEmote;
};

export type ActorProps = {
  id: DetailId;
  outfit?: DOutfit;
  /** where the actor stands, as a percentage of the stage width */
  x?: number;
  turn?: number;
  flip?: boolean;
  walking?: boolean;
  talking?: boolean;
  arms?: ArmPose | "crossed" | null;
  expression?: Expression;
  height?: number;
  className?: string;
};

const restFor = (id: DetailId): Pose => (id === "curse" ? withArms(IDLE, ARMS_CROSSED) : IDLE);

/**
 * A character that moves. React renders the drawing and owns which brow/eye/mouth
 * is on screen; the motion controller owns every joint transform.
 *
 * The two never collide because the `pose` prop handed to DetailedCharacter is a
 * CONSTANT — React therefore never rewrites those transform attributes on a
 * re-render, and the controller keeps ownership of them for the life of the node.
 */
export function Actor({
  id, outfit = "kit", x, turn = 0, flip = false,
  walking = false, talking = false, arms = null,
  expression, height = 320, className,
}: ActorProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<Motion | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = createMotion(svg, {
      turn, flip, reduced,
      headPivotY: DETAILED[id].skeleton.head.pivotY,
      cadence: id === "sun" ? 0.95 : 0.74, // A is springier; B walks like it costs him something
    });
    m.setBase(restFor(id));
    motionRef.current = m;
    setReady(true);
    return () => { m.kill(); motionRef.current = null; };
  }, [id, turn, flip]);

  useEffect(() => { motionRef.current?.walk(walking); }, [walking]);
  useEffect(() => { motionRef.current?.talk(talking); }, [talking]);

  useEffect(() => {
    const m = motionRef.current;
    if (!m) return;
    if (arms === "crossed") m.setBase(withArms(IDLE, ARMS_CROSSED));
    else if (arms) { m.setBase(withArms(IDLE, ARM_POSES[arms])); m.bounce(); }
    else m.setBase(restFor(id));
  }, [arms, id]);

  // walking across the stage
  useEffect(() => {
    const host = hostRef.current;
    if (!host || x === undefined) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tween = gsap.to(host, {
      left: `${x}%`,
      duration: reduced ? 0 : 1.9,
      ease: "power2.inOut",
      overwrite: "auto",
    });
    return () => { tween.kill(); };
  }, [x]);

  return (
    <div
      ref={hostRef}
      className={className}
      data-actor={id}
      style={{
        height,
        position: x === undefined ? "relative" : "absolute",
        bottom: x === undefined ? undefined : 0,
        left: x === undefined ? undefined : `${x}%`,
        transform: x === undefined ? undefined : "translateX(-50%)",
        opacity: ready ? 1 : 0,
        transition: "opacity .35s ease",
        pointerEvents: "none",
      }}
    >
      <DetailedCharacter
        id={id}
        uid={`actor-${id}`}
        pose={IDLE}
        turn={turn}
        flip={flip}
        outfit={outfit}
        brow={expression?.brow ?? "neutral"}
        eye={expression?.eye ?? "open"}
        mouth={expression?.mouth ?? (id === "sun" ? "smile" : "closed")}
        emote={expression?.emote ?? "none"}
        className="actor-svg"
      />
    </div>
  );
}
