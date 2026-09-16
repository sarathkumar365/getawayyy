/**
 * The sound of the walk.
 *
 * Generated in the browser rather than shipped as a file. Three reasons, in
 * order: a licensed track is not mine to distribute; a few megabytes of audio
 * on a phone is a real cost for something she may never turn on; and a file
 * loops audibly, where this never repeats and can follow the walk — the filter
 * closes as the light goes, so the night legs sound like night.
 *
 * It is deliberately not a song. Slow pad chords, an occasional note over the
 * top, tape hiss and a little crackle. Nothing with a beat you would tap to.
 */

type Voice = { osc: OscillatorNode[]; gain: GainNode };

/** Root frequencies, in the key the pad sits in. */
const CHORDS: readonly number[][] = [
  // Fmaj9 — warm, unresolved, the one it keeps coming back to
  [174.61, 261.63, 329.63, 440.0],
  // Cmaj7
  [130.81, 196.0, 261.63, 329.63],
  // Dm9
  [146.83, 220.0, 293.66, 349.23],
  // Bbmaj7 — the lift before it settles again
  [116.54, 174.61, 233.08, 293.66],
];

/** Pentatonic over the top, so a random note is never a wrong note. */
const MELODY = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5];

const CHORD_SECONDS = 11;

export type Ambient = {
  start(): Promise<void>;
  stop(): void;
  /** 0 = night, 1 = full daylight. Opens the filter and lifts the melody. */
  setLight(v: number): void;
  readonly playing: boolean;
};

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i += 1) {
    // brown-ish noise: white noise integrated, which sits under music far
    // better than white does — white reads as a broken speaker
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.2;
  }
  return buf;
}

export function createAmbient(): Ambient {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let timer: number | null = null;
  let chordIndex = 0;
  let light = 0.6;
  let playing = false;
  let pad: Voice | null = null;

  const openness = (): number => 420 + light * 1500;

  const buildPad = (c: AudioContext, out: AudioNode): Voice => {
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.connect(out);
    const osc: OscillatorNode[] = [];
    // Four voices, each doubled and detuned. The beating between the pairs is
    // what stops a synth pad sounding like a synth pad.
    for (let i = 0; i < 8; i += 1) {
      const o = c.createOscillator();
      o.type = i % 2 === 0 ? "triangle" : "sine";
      o.detune.value = i % 2 === 0 ? -6 : 7;
      o.connect(gain);
      o.start();
      osc.push(o);
    }
    return { osc, gain };
  };

  /** Move the pad to the next chord, gliding rather than stepping. */
  const voiceChord = (c: AudioContext, v: Voice, chord: readonly number[]): void => {
    const t = c.currentTime;
    chord.forEach((f, i) => {
      const a = v.osc[i * 2];
      const b = v.osc[i * 2 + 1];
      // an octave down on the root keeps it from getting thin
      const target = i === 0 ? f / 2 : f;
      a?.frequency.setTargetAtTime(target, t, 1.6);
      b?.frequency.setTargetAtTime(target, t, 1.9);
    });
    v.gain.gain.setTargetAtTime(0.055, t, 2.4);
  };

  /** One note over the top. Sparse on purpose — silence is most of this. */
  const pluck = (c: AudioContext, out: AudioNode, when: number): void => {
    const note = MELODY[Math.floor(Math.random() * MELODY.length)] ?? 523.25;
    const o = c.createOscillator();
    o.type = "sine";
    // down an octave at night, so the dark legs are not chiming at her
    o.frequency.value = light > 0.45 ? note : note / 2;

    const g = c.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.045 + light * 0.02, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 3.4);

    // a long, quiet echo instead of a reverb — cheaper, and it is the sound
    const delay = c.createDelay(1.2);
    delay.delayTime.value = 0.42;
    const fb = c.createGain();
    fb.gain.value = 0.34;
    const wet = c.createGain();
    wet.gain.value = 0.5;

    o.connect(g);
    g.connect(out);
    g.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(out);

    o.start(when);
    o.stop(when + 3.6);
    o.onended = () => { o.disconnect(); g.disconnect(); delay.disconnect(); fb.disconnect(); wet.disconnect(); };
  };

  const tick = (): void => {
    const c = ctx;
    const f = filter;
    if (!c || !f || !pad) return;

    voiceChord(c, pad, CHORDS[chordIndex % CHORDS.length] ?? CHORDS[0]!);
    chordIndex += 1;

    // Two or three notes across the chord, never on the beat.
    const n = Math.random() < 0.35 ? 1 : Math.random() < 0.7 ? 2 : 3;
    for (let i = 0; i < n; i += 1) {
      pluck(c, f, c.currentTime + 0.6 + Math.random() * (CHORD_SECONDS - 1.6));
    }

    f.frequency.setTargetAtTime(openness(), c.currentTime, 3);
  };

  return {
    get playing() { return playing; },

    async start() {
      if (playing) return;
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return;
      ctx = ctx ?? new C();
      // Browsers hand back a suspended context unless a gesture started it.
      if (ctx.state === "suspended") await ctx.resume();

      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = openness();
      filter.Q.value = 0.6;
      filter.connect(master);

      // tape hiss, always there, never noticed until it stops
      const hiss = ctx.createBufferSource();
      hiss.buffer = noiseBuffer(ctx, 4);
      hiss.loop = true;
      const hissGain = ctx.createGain();
      hissGain.gain.value = 0.014;
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = "bandpass";
      hissFilter.frequency.value = 1400;
      hissFilter.Q.value = 0.4;
      hiss.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(master);
      hiss.start();

      // wow and flutter: the pad drifts very slightly out of tune, the way tape
      // does. This is most of what separates "lo-fi" from "cheap".
      const wow = ctx.createOscillator();
      wow.frequency.value = 0.07;
      const wowAmt = ctx.createGain();
      wowAmt.gain.value = 5.5;
      wow.connect(wowAmt);
      wow.start();

      pad = buildPad(ctx, filter);
      for (const o of pad.osc) wowAmt.connect(o.detune);

      playing = true;
      tick();
      timer = window.setInterval(tick, CHORD_SECONDS * 1000);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 2.5);
    },

    stop() {
      if (!playing || !ctx || !master) return;
      playing = false;
      if (timer !== null) { window.clearInterval(timer); timer = null; }
      const c = ctx;
      master.gain.setTargetAtTime(0, c.currentTime, 0.6);
      // let the fade finish before tearing the graph down
      window.setTimeout(() => { void c.close(); ctx = null; master = null; filter = null; pad = null; }, 1400);
    },

    setLight(v: number) {
      light = Math.min(1, Math.max(0, v));
    },
  };
}
