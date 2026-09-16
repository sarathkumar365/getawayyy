/**
 * Character voices.
 *
 * Not speech — a blip per letter, pitched to whoever is talking, the way a
 * game gives a character a voice without recording one. It is the right answer
 * here for two reasons: real voice acting is not something I can produce, and a
 * text-to-speech voice would sound like a train station rather than like them.
 * Blips read as anime because that is exactly where the convention comes from.
 *
 * A is bright, quick and a little unstable — she is excited about everything.
 * B is low, flat and slower, and barely moves in pitch, because he is being
 * correct at you.
 */

import type { DetailId } from "@/lib/characters/detailed";

type VoiceSpec = {
  base: number;
  /** how far the pitch wanders per letter */
  spread: number;
  wave: OscillatorType;
  ms: number;
  gain: number;
  /** a second, quieter oscillator a fifth up thickens the tone */
  harmonic: number;
};

const VOICES: Record<DetailId, VoiceSpec> = {
  sun: { base: 470, spread: 150, wave: "triangle", ms: 62, gain: 0.05, harmonic: 1.5 },
  curse: { base: 196, spread: 44, wave: "square", ms: 78, gain: 0.032, harmonic: 2 },
};

const KEY = "trip-getaway:sound";

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let enabled = false;
let lastAt = 0;

export function setVoiceEnabled(on: boolean): void {
  enabled = on;
  if (!on && ctx) { void ctx.close(); ctx = null; bus = null; }
}

export function voiceEnabled(): boolean {
  if (enabled) return true;
  try { return window.localStorage.getItem(KEY) === "on"; } catch { return false; }
}

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const C = window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  bus = ctx.createGain();
  bus.gain.value = 1;
  // Rolled off hard: a blip with its top end left in is a beep, and forty of
  // them in a sentence is a smoke alarm.
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 2100;
  soften.Q.value = 0.5;
  bus.connect(soften);
  soften.connect(ctx.destination);
  return ctx;
}

/** Letters that get a sound. Spaces and punctuation are where a voice rests. */
const VOICED = /[a-z0-9가-힣ㄱ-ㅎ]/i;

export function blip(who: DetailId, ch: string): void {
  if (!enabled || !VOICED.test(ch)) return;
  const c = ensure();
  const out = bus;
  if (!c || !out || c.state === "suspended") return;

  // Two letters inside 40ms is a machine-gun, not a voice.
  const now = c.currentTime;
  if (now - lastAt < 0.04) return;
  lastAt = now;

  const v = VOICES[who];
  // Pitch follows the letter, so the same word always sounds the same and a
  // sentence has a shape instead of being random noise.
  const step = (ch.toLowerCase().charCodeAt(0) % 7) / 6 - 0.5;
  const freq = v.base + step * v.spread;
  const dur = v.ms / 1000;

  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(v.gain, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  g.connect(out);

  const o = c.createOscillator();
  o.type = v.wave;
  o.frequency.setValueAtTime(freq, now);
  // a small fall on each blip — flat pitch is what makes this sound like a beep
  o.frequency.exponentialRampToValueAtTime(freq * 0.88, now + dur);
  o.connect(g);

  const h = c.createOscillator();
  h.type = "sine";
  h.frequency.setValueAtTime(freq * v.harmonic, now);
  const hg = c.createGain();
  hg.gain.setValueAtTime(v.gain * 0.3, now);
  hg.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.8);
  h.connect(hg);
  hg.connect(out);

  o.start(now); o.stop(now + dur + 0.02);
  h.start(now); h.stop(now + dur + 0.02);
  o.onended = () => { o.disconnect(); g.disconnect(); h.disconnect(); hg.disconnect(); };
}

/** A small flourish when a whole line lands. Used sparingly. */
export function chirp(who: DetailId): void {
  if (!enabled) return;
  const c = ensure();
  if (!c || !bus || c.state === "suspended") return;
  const v = VOICES[who];
  const now = c.currentTime;
  const o = c.createOscillator();
  o.type = v.wave;
  o.frequency.setValueAtTime(v.base, now);
  o.frequency.exponentialRampToValueAtTime(v.base * 1.32, now + 0.11);
  const g = c.createGain();
  g.gain.setValueAtTime(v.gain * 0.8, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  o.connect(g); g.connect(bus);
  o.start(now); o.stop(now + 0.18);
  o.onended = () => { o.disconnect(); g.disconnect(); };
}

/** Browsers hand back a suspended context until a gesture; call this on one. */
export async function wakeVoice(): Promise<void> {
  const c = ensure();
  if (c && c.state === "suspended") await c.resume();
}
