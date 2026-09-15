"use client";

import { useState, type JSX } from "react";
import "./stage.css";
import { Scene } from "@/components/characters/Scene";
import { Actor } from "@/components/characters/Actor";
import { DIALOGUE, LINE_COUNT } from "@/lib/characters/dialogue";
import { RearCharacter } from "@/components/characters/RearCharacter";
import { WALK, WALK_FRAME_NAMES, IDLE } from "@/lib/characters/rig";

const KEYS = Object.keys(DIALOGUE);

export default function StagePage(): JSX.Element {
  const [key, setKey] = useState<string>("arrival");
  const [run, setRun] = useState(0);
  const [walking, setWalking] = useState(true);
  const [where, setWhere] = useState(80);

  return (
    <main className="stage-page">
      <h1>Stage</h1>
      <p className="lede">
        Phase 1 review. {LINE_COUNT} written lines across {KEYS.length} beats. Tap a bubble
        to skip the typing, tap again to advance. Everything below is the detailed rig —
        one ticker driving every joint, with hair on springs so it trails the head instead
        of moving with it.
      </p>

      <div className="picker">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={k === key}
            onClick={() => { setKey(k); setRun((r) => r + 1); }}
          >
            {k}
          </button>
        ))}
      </div>

      <Scene beatKey={key} resetKey={run} onComplete={() => setRun((r) => r + 1)} />

      <h2 style={{ fontSize: "1.05rem", margin: "2.5rem 0 .4rem" }}>Rear view — walking away</h2>
      <p className="lede" style={{ marginBottom: ".8rem" }}>
        The same eight frames, re-projected. From behind, limb rotation is invisible —
        what reads is pelvis sway toward the planted leg, shoulders counter-rotating, and
        the swing leg lifting as it travels away.
      </p>
      <div className="row" style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
        {[{ id: "sun" as const }, { id: "curse" as const }].map((c) =>
          [IDLE, ...WALK].map((pose, i) => (
            <figure key={`${c.id}-${i}`} style={{ width: 96, margin: 0 }}>
              <div style={{ background: "var(--paper-2,#f6f2ea)", border: "1px solid var(--rule,#d8d2c8)", borderRadius: 8, padding: 4 }}>
                <RearCharacter id={c.id} uid={`rear-${c.id}-${i}`} pose={pose} />
              </div>
              <figcaption style={{ fontSize: ".6rem", fontFamily: "ui-monospace,monospace", textAlign: "center", color: "var(--ink-3,#9a958d)", marginTop: ".25rem" }}>
                {i === 0 ? "idle" : WALK_FRAME_NAMES[i - 1]}
              </figcaption>
            </figure>
          )),
        )}
      </div>

      <h2 style={{ fontSize: "1.05rem", margin: "2.5rem 0 .4rem" }}>Walk cycle</h2>
      <p className="lede" style={{ marginBottom: ".8rem" }}>
        Eight poses sampled continuously, not stepped. The walk springs in and out, so
        starting and stopping are eased rather than snapped.
      </p>
      <div className="picker">
        <button type="button" aria-pressed={walking} onClick={() => setWalking((w) => !w)}>
          {walking ? "stop" : "walk"}
        </button>
        <button type="button" aria-pressed={false} onClick={() => setWhere((w) => (w > 50 ? 15 : 85))}>
          cross the stage
        </button>
      </div>
      <div className="lane">
        <Actor id="sun" x={where} turn={1} walking={walking} height={280} />
        <Actor id="curse" x={where > 50 ? where - 22 : where + 22} turn={1} walking={walking} height={300} />
      </div>
    </main>
  );
}
