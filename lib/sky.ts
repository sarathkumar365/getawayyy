/**
 * Scroll-driven sky.
 *
 * Every one of the 76 stops carries a `time` ("09:30"), so the light on screen
 * is computed from the day's real schedule — the 09:30 stop sits in morning
 * light, the 19:00 dinner in dusk. Nothing here is faked or randomised.
 */

export type Phase =
  | "night"
  | "dawn"
  | "morning"
  | "midday"
  | "afternoon"
  | "goldenHour"
  | "dusk";

export type Sky = {
  phase: Phase;
  /** 0–1 position through the whole day, for interpolating between stops. */
  t: number;
  /** Top-to-bottom gradient stops. */
  gradient: [string, string, string];
  /** Colour of direct light — tints the characters and card edges. */
  light: string;
  /** How dark the page furniture should go. */
  scheme: "light" | "dark";
};

/** October in Ontario/Quebec: sunrise ~07:15, sunset ~18:30. */
const SUNRISE = 7.25;
const SUNSET = 18.5;

export function parseTime(time: string | null): number | null {
  if (!time) return null;
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h + min / 60;
}

export function phaseFor(hour: number): Phase {
  if (hour < SUNRISE - 1) return "night";
  if (hour < SUNRISE + 0.75) return "dawn";
  if (hour < 11) return "morning";
  if (hour < 14.5) return "midday";
  if (hour < SUNSET - 2) return "afternoon";
  if (hour < SUNSET + 0.25) return "goldenHour";
  if (hour < SUNSET + 1.5) return "dusk";
  return "night";
}

const PALETTE: Record<Phase, Omit<Sky, "phase" | "t">> = {
  night:       { gradient: ["#0B1220", "#131C2E", "#1C2436"], light: "#7E8CA8", scheme: "dark" },
  dawn:        { gradient: ["#2A3350", "#7E6A82", "#E8A07A"], light: "#F2B995", scheme: "dark" },
  morning:     { gradient: ["#A8C8E8", "#CFE0F0", "#F2F0E6"], light: "#FFF3DC", scheme: "light" },
  midday:      { gradient: ["#7FB2E5", "#BBD8F0", "#F5F3EA"], light: "#FFFDF4", scheme: "light" },
  afternoon:   { gradient: ["#8CB9DE", "#D6DCE0", "#F3EADB"], light: "#FFF0D4", scheme: "light" },
  goldenHour:  { gradient: ["#D98E4A", "#E8B06B", "#F5DCBA"], light: "#FFC67D", scheme: "light" },
  dusk:        { gradient: ["#3B3A5C", "#8A5B72", "#D98963"], light: "#D9866B", scheme: "dark" },
};

export function skyFor(time: string | null, fallback: Phase = "midday"): Sky {
  const hour = parseTime(time);
  const phase = hour === null ? fallback : phaseFor(hour);
  const t = hour === null ? 0.5 : Math.min(1, Math.max(0, (hour - 6) / 15));
  return { phase, t, ...PALETTE[phase] };
}

/** Blend two skies — used while scrolling between two stops. */
export function mixSky(a: Sky, b: Sky, amount: number): Sky {
  const k = Math.min(1, Math.max(0, amount));
  const mix = (x: string, y: string) => mixHex(x, y, k);
  return {
    phase: k < 0.5 ? a.phase : b.phase,
    t: a.t + (b.t - a.t) * k,
    gradient: [
      mix(a.gradient[0], b.gradient[0]),
      mix(a.gradient[1], b.gradient[1]),
      mix(a.gradient[2], b.gradient[2]),
    ],
    light: mix(a.light, b.light),
    scheme: k < 0.5 ? a.scheme : b.scheme,
  };
}

function mixHex(a: string, b: string, k: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i]! - v) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Anchor points for a CONTINUOUS sky.
 *
 * `skyFor` looks a palette up by phase, so the sky changes in seven hard steps —
 * golden hour becomes dusk in a single frame, and every colour derived from it
 * (text, the road, the ground) snaps with it. That is visible as a flicker while
 * scrolling, and it is the real cause rather than any boolean.
 *
 * These are the hours at which each palette is exactly itself. Between them the
 * sky is interpolated, so it changes at the rate the actual light does.
 */
const ANCHORS: readonly { h: number; phase: Phase }[] = [
  { h: 0, phase: "night" },
  { h: 5.9, phase: "night" },
  { h: 7.3, phase: "dawn" },
  { h: 9.2, phase: "morning" },
  { h: 12.6, phase: "midday" },
  { h: 15.4, phase: "afternoon" },
  { h: 17.9, phase: "goldenHour" },
  { h: 19.1, phase: "dusk" },
  { h: 20.6, phase: "night" },
  { h: 24, phase: "night" },
];

const at = (phase: Phase, hour: number): Sky => ({
  phase,
  t: Math.min(1, Math.max(0, (hour - 6) / 15)),
  ...PALETTE[phase],
});

/** The sky at any hour, interpolated rather than stepped. */
export function skyAt(hour: number): Sky {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 0; i < ANCHORS.length - 1; i += 1) {
    const a = ANCHORS[i];
    const b = ANCHORS[i + 1];
    if (!a || !b) continue;
    if (h >= a.h && h <= b.h) {
      const k = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h);
      // smoothstep, so the change eases in and out of each phase
      const e = k * k * (3 - 2 * k);
      const mixed = mixSky(at(a.phase, h), at(b.phase, h), e);
      return { ...mixed, phase: e < 0.5 ? a.phase : b.phase, t: at(a.phase, h).t };
    }
  }
  return at("midday", h);
}

/** Continuous sky from a clock string. */
export function skyAtTime(time: string | null): Sky {
  const hour = parseTime(time);
  return hour === null ? at("midday", 12) : skyAt(hour);
}
