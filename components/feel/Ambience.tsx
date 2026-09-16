"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import "@/styles/ambience.css";
import { createAmbient, type Ambient } from "@/lib/audio/ambient";
import { setVoiceEnabled } from "@/lib/audio/voice";

const KEY = "trip-getaway:sound";

/**
 * The sound toggle.
 *
 * Off until she asks. Browsers block audio that starts without a gesture, and
 * quite right — a page that makes noise the moment it opens is a page you close.
 * The choice is remembered, so it only has to be made once; on a later visit it
 * still waits for her first tap, because the rule is about the gesture, not the
 * preference.
 */
export function Ambience(): JSX.Element {
  const engine = useRef<Ambient | null>(null);
  const [on, setOn] = useState(false);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    engine.current = createAmbient();
    try { setWanted(window.localStorage.getItem(KEY) === "on"); } catch { /* private mode */ }
    return () => { engine.current?.stop(); engine.current = null; };
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    // One switch for everything audible — music and voices together. Two
    // controls for "sound" is one more than anyone wants.
    setVoiceEnabled(next);
    if (next) await engine.current?.start();
    else engine.current?.stop();
    setOn(next);
    try { window.localStorage.setItem(KEY, next ? "on" : "off"); } catch { /* ignore */ }
  }, []);

  /**
   * If she had it on last time, start at her first touch of the page rather
   * than making her find the button again.
   */
  useEffect(() => {
    if (!wanted || on) return undefined;
    const go = (): void => { void toggle(true); };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", go, opts);
    window.addEventListener("keydown", go, opts);
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [wanted, on, toggle]);

  /** Follow the walk's own clock: the filter closes as the light goes. */
  useEffect(() => {
    if (!on) return undefined;
    const read = (): void => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--sky-t");
      const v = Number.parseFloat(raw);
      if (Number.isFinite(v)) engine.current?.setLight(v);
    };
    read();
    const id = window.setInterval(read, 2500);
    return () => window.clearInterval(id);
  }, [on]);

  // Stop making noise at a tab she is not looking at.
  useEffect(() => {
    if (!on) return undefined;
    const vis = (): void => {
      if (document.hidden) engine.current?.stop();
      else void engine.current?.start();
    };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [on]);

  return (
    <button
      type="button"
      className={`ambience ${on ? "is-on" : ""}`}
      onClick={() => void toggle(!on)}
      aria-pressed={on}
      aria-label={on ? "Turn the sound off" : "Turn the sound on"}
      title={on ? "Sound on" : "Sound off"}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 9.5 h3.5 L12 5.5 v13 L7.5 14.5 H4 Z" strokeLinejoin="round" />
        {on ? (
          <>
            <path d="M15.5 9.5 a4 4 0 0 1 0 5" strokeLinecap="round" />
            <path d="M18 7 a7.5 7.5 0 0 1 0 10" strokeLinecap="round" />
          </>
        ) : (
          <path d="M16 9.5 L20.5 14.5 M20.5 9.5 L16 14.5" strokeLinecap="round" />
        )}
      </svg>
      <span className="ambience__label">{on ? "Sound" : "Silent"}</span>
    </button>
  );
}
