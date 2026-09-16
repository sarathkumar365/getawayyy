"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LENS, beatAlpha, clockAt, project, sortForPaint } from "@/lib/scene/corridor";
import { makePath, STRAIGHT } from "@/lib/scene/path";
import { skyAtTime } from "@/lib/sky";
import { buildSchedule, cameraAt } from "@/lib/scene/schedule";
import { muskokaArrivals, muskokaPace } from "@/lib/scene/muskoka-journey";
import { hexToRgb, propColour } from "@/lib/scene/palette";
import { scrollToY } from "@/lib/lenis";
import { CORRIDOR_KINDS } from "./corridorKinds";
import { RearActor } from "@/components/characters/RearActor";
import { Flock } from "./Flock";
import { Rain } from "./Rain";
import { StationPanel } from "@/components/station/StationPanel";
import { DetailedCharacter } from "@/components/characters/DetailedCharacter";
import { useAnswers } from "@/lib/answers";
import type { Itinerary } from "@/lib/scene/itinerary";
import type { BeatFace, Leg } from "@/lib/scene/corridor";
import type { Trip } from "@/lib/types";

export type JourneyProps = {
  trip: Trip;
  itinerary: Itinerary;
  legs: Record<string, Leg>;
  depthPerScreen?: number;
};

function luma(hex: string): number {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  const body = m?.[1];
  if (!body) return 0.5;
  const n = Number.parseInt(body, 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const t = v / 255;
    return t <= 0.04045 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0);
}

const mix = (a: readonly number[], b: readonly number[], t: number): string => {
  const v = (i: number): number => Math.round((a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t);
  return `rgb(${v(0)} ${v(1)} ${v(2)})`;
};

const INK_LIGHT = [22, 25, 31] as const;
const INK_DARK = [244, 240, 232] as const;
const DIM_LIGHT = [61, 68, 80] as const;
const DIM_DARK = [198, 199, 206] as const;

/**
 * Fixed, seeded positions — Math.random() here would differ between the server
 * render and the client one and React would replace the whole layer.
 */
const MOTES = Array.from({ length: 18 }, (_, i) => {
  const a = (i * 2654435761) % 1000 / 1000;
  const b = ((i + 7) * 40503) % 1000 / 1000;
  return {
    x: 6 + a * 88,
    y: 14 + b * 72,
    d: 0.25 + ((i * 37) % 100) / 200,
    s: 0.6 + ((i * 53) % 100) / 125,
  };
});

/**
 * The reaction bust.
 *
 * The walk is seen from behind, so a line on its own cannot show that she is
 * fed up and he is enjoying it. Their head rides in the bubble instead, which
 * is the convention this borrows from — and it is the first thing on the site
 * to use the 39 expressions that until now only existed on a review page.
 */
function Bust({ who, face }: { who: "sun" | "curse"; face?: BeatFace }): JSX.Element {
  return (
    <span className="saybubble__face" aria-hidden="true">
      <DetailedCharacter
        id={who}
        uid={`bust-${who}-${face?.eye ?? "o"}-${face?.mouth ?? "s"}-${face?.brow ?? "n"}`}
        crop="head"
        brow={face?.brow ?? "neutral"}
        eye={face?.eye ?? "open"}
        mouth={face?.mouth ?? "smile"}
        emote={face?.emote ?? "none"}
      />
    </span>
  );
}

function bookingPriorities(trip: Trip): Map<string, number> {
  return new Map(trip.bookings.map((b) => [b.name.toLowerCase(), b.priority]));
}

function priorityFor(map: Map<string, number>, name: string): number | undefined {
  const key = name.toLowerCase();
  for (const [b, p] of map) if (key.includes(b) || b.includes(key)) return p;
  return undefined;
}

/**
 * A whole trip, in ONE continuous shot.
 *
 * There is a single sticky stage for the entire journey — one camera moving
 * through one world. Arriving somewhere does not change the view: the camera
 * simply stops, and the station's panel rises over the landscape she is still
 * looking at. Scrolling on lowers it and the walk continues from the same spot.
 *
 * Nothing here re-renders while scrolling. The scroll handler writes transforms
 * directly onto the nodes, which is both cheaper than a React pass and exactly
 * in step with the scroll rather than a frame behind it.
 */
export function Journey({
  trip, itinerary, legs, depthPerScreen,
}: JourneyProps): JSX.Element {
  const spacer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [walking, setWalking] = useState(false);
  const [sitting, setSitting] = useState(false);
  const [nearId, setNearId] = useState<string | null>(null);
  /** Daylight, read off the same clock the sky uses. */
  const [daylight, setDaylight] = useState(0.6);
  /**
   * The wet-day rate of the run she is actually on. Muskoka's October figure
   * from the Phase 0 archive pass — not a dial anyone turned for mood. The
   * overnight runs carry none, because rain you cannot see is just noise.
   */
  const [rain, setRain] = useState(0);

  const { answers, reactToStop, setNote } = useAnswers();
  const bookings = useMemo(() => bookingPriorities(trip), [trip]);

  const schedule = useMemo(
    () => buildSchedule(itinerary, legs, {
      depthPerScreen,
      arrivals: muskokaArrivals(),
      pace: muskokaPace(itinerary, depthPerScreen),
    }),
    [itinerary, legs, depthPerScreen],
  );
  const painted = useMemo(() => sortForPaint(schedule.items), [schedule]);



  /** Scroll position, in page pixels, where a station's hold ends. */
  const endOfStation = useMemo(() => {
    const m: Record<string, number> = {};
    for (const seg of schedule.segs) {
      if (seg.kind === "station") m[seg.station.id] = seg.s1 / schedule.screens;
    }
    return m;
  }, [schedule]);

  /**
   * Closing a panel scrolls PAST the stop rather than hiding the panel.
   *
   * The panel's position is a function of scroll, so hiding it on its own would
   * put the view and the scroll position into disagreement — she would scroll
   * up a little and it would reappear. Closing does exactly what scrolling on
   * by hand does, just in one movement.
   */
  const close = useCallback((stationId: string) => {
    const el = spacer.current;
    const frac = endOfStation[stationId];
    if (!el || frac === undefined) return;
    // getBoundingClientRect + scrollY, NOT offsetTop: the spacer sits inside a
    // positioned wrapper, so offsetTop measured from that wrapper rather than
    // from the page and the button scrolled to the wrong place — usually back
    // to the very beginning, which is why it looked like it did nothing.
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + frac * el.offsetHeight + 8);
  }, [endOfStation]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const spacerEl = spacer.current;
    const stageEl = stage.current;
    if (!spacerEl || !stageEl) return undefined;

    const nodes = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-prop]"));
    const beatEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-beat]"));
    const panelEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-station]"));
    const cast = stageEl.querySelector<HTMLElement>("[data-cast]");
    const motes = stageEl.querySelector<HTMLElement>("[data-motes]");
    const moteEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-mote]"));
    const sayEls = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-say]"));
    const rail = stageEl.querySelector<HTMLElement>("[data-rail]");
    const road = stageEl.querySelector<SVGPathElement>("[data-road]");
    const shoulder = stageEl.querySelector<SVGPathElement>("[data-shoulder]");
    const clockEl = stageEl.querySelector<HTMLElement>("[data-clock]");
    const root = document.documentElement;

    const path = schedule.controls.length > 1
      ? makePath(schedule.controls, schedule.depth)
      : STRAIGHT;

    let w = stageEl.clientWidth;
    let h = stageEl.clientHeight;
    const size = (): void => { w = stageEl.clientWidth; h = stageEl.clientHeight; };
    size();

    let wasWalking = false;
    let wasSitting = false;
    let wasNear: string | null = null;
    let lastBand = -1;
    let lastRain = -1;
    let stopTimer: number | null = null;

    const ribbon = (cam: number, halfW: number): string => {
      const STEPS = 26;
      const left: string[] = [];
      const right: string[] = [];
      for (let i = 0; i <= STEPS; i += 1) {
        const t = (i / STEPS) ** 1.9;
        const d = 8 + t * (LENS.far - 8);
        const zz = cam + d;
        const scale = LENS.focal / (LENS.focal + d);
        const relX = path.bend(zz) - path.bend(cam);
        const relRise = path.rise(zz) - path.rise(cam);
        const y = h * LENS.horizon + h * LENS.ground * scale - relRise * scale;
        left.push(`${(w / 2 + (relX - halfW) * scale).toFixed(1)},${y.toFixed(1)}`);
        right.push(`${(w / 2 + (relX + halfW) * scale).toFixed(1)},${y.toFixed(1)}`);
      }
      return `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
    };

    const apply = (p: number): void => {
      const { z: cam, travelling, rise, sit, near, says } = cameraAt(schedule, p);

      // The sky is resolved BEFORE the props, because the props fade into it.
      const time = clockAt(
        { id: "j", depth: schedule.depth, clock: schedule.clock, items: [], beats: [] },
        cam,
      );
      const sky = skyAtTime(time);
      const skyRgb = hexToRgb(sky.gradient[1] ?? "#8090A0");

      if (road) road.setAttribute("d", ribbon(cam, 250));
      if (shoulder) shoulder.setAttribute("d", ribbon(cam, 340));

      for (const node of nodes) {
        const z = Number(node.dataset.z ?? 0);
        const x = Number(node.dataset.x ?? 0);
        const y = Number(node.dataset.y ?? 0);
        const s = Number(node.dataset.s ?? 1);
        const pr = project({ z, x, y, kind: "", s }, cam, w, h, LENS, path);
        if (!pr.visible || pr.opacity <= 0.004) {
          if (node.style.display !== "none") node.style.display = "none";
          continue;
        }
        if (node.style.display === "none") node.style.display = "";
        // Aerial perspective. Without it every tree reads at the same distance
        // however small it is drawn.
        node.style.color = propColour(node.dataset.kind ?? "", z - cam, LENS.far, skyRgb);
        node.style.transform =
          `translate3d(${pr.left.toFixed(1)}px, ${pr.base.toFixed(1)}px, 0) ` +
          `translate(-50%, -100%) scale(${(pr.scale * s).toFixed(4)})`;
        node.style.opacity = pr.opacity.toFixed(3);
      }

      for (const node of beatEls) {
        const bz = Number(node.dataset.z ?? 0);
        const hold = Number(node.dataset.hold ?? 420);
        const a = beatAlpha({ z: bz, hold, voice: "narrate", text: "" }, cam);
        node.style.opacity = a.toFixed(3);
        if (node.dataset.bubble === undefined) {
          node.style.transform = `translateY(${((1 - a) * 16).toFixed(1)}px)`;
        } else {
          // A bubble pops out from the speaker's head rather than sliding: it
          // overshoots very slightly, which is what makes it read as spoken.
          const pop = a < 0.35 ? a / 0.35 : 1;
          const scale = 0.72 + pop * 0.3 - Math.max(0, pop - 0.86) * 0.14;
          node.style.transform =
            `translate(-50%, ${((1 - a) * 10).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        }
        node.style.pointerEvents = "none";
      }

      // The panels. Each is parked below the fold and slides up over the view
      // it belongs to — the landscape behind it never changes.
      for (const node of panelEls) {
        const id = node.dataset.station ?? "";
        const up = rise[id] ?? 0;
        if (up <= 0.001) {
          if (node.style.visibility !== "hidden") {
            node.style.visibility = "hidden";
            node.style.pointerEvents = "none";
          }
          continue;
        }
        if (node.style.visibility === "hidden") node.style.visibility = "";
        // Centred, lifting the last stretch rather than sliding the full height
        // of the screen — a short travel reads as arriving, a long one reads as
        // a drawer being pulled.
        // Opacity leads the movement, so it fades in and THEN settles the last
        // few pixels — a card that arrives at full strength reads as a popup.
        const eased = up * up * (3 - 2 * up);
        const lift = (1 - eased) * 34;
        const scale = 0.984 + eased * 0.016;
        node.style.transform =
          `translate(-50%, calc(-50% + ${lift.toFixed(1)}px)) scale(${scale.toFixed(4)})`;
        node.style.opacity = Math.min(1, up * 1.35).toFixed(3);
        node.style.pointerEvents = up > 0.6 ? "auto" : "none";
      }

      if (cast) {
        const lead = 170;
        const shift = (path.bend(cam + lead) - path.bend(cam)) * (LENS.focal / (LENS.focal + lead));
        // Seated, they slide toward the edge so the card does not land on top
        // of them — they stay in shot, which is the point of them sitting.
        cast.style.transform =
          `translateX(${(shift - sit * 128).toFixed(1)}px) translateY(${(sit * 26).toFixed(1)}px)`;
        cast.style.opacity = (1 - sit * 0.12).toFixed(3);
      }

      if (near !== wasNear) { wasNear = near; setNearId(near); }

      // Whichever run the camera is inside owns the weather.
      let wet = 0;
      for (const seg of schedule.segs) {
        if (seg.kind !== "travel") continue;
        if (cam >= seg.z0 && cam <= seg.z1) { wet = seg.leg.rain ?? 0; break; }
      }
      if (wet !== lastRain) { lastRain = wet; setRain(wet); }

      const seated = sit > 0.45;
      if (seated !== wasSitting) { wasSitting = seated; setSitting(seated); }

      // Motes drift up and fade out as the card lands, so the arrival has a
      // moment of movement of its own rather than the card simply appearing.
      const anyUp = Math.max(0, ...Object.values(rise));
      if (motes) {
        motes.style.opacity = (Math.sin(Math.min(1, anyUp) * Math.PI) * 0.85).toFixed(3);
        motes.style.display = anyUp <= 0.002 ? "none" : "";
      }
      if (anyUp > 0.002) {
        for (const m of moteEls) {
          const d = Number(m.dataset.md ?? 0.4);
          const sc = Number(m.dataset.ms ?? 1);
          const t2 = Math.min(1, Math.max(0, (anyUp - d * 0.35) / (1 - d * 0.35)));
          m.style.transform =
            `translate3d(0, ${(-t2 * 56 * sc).toFixed(1)}px, 0) scale(${(0.5 + t2 * sc).toFixed(3)})`;
          m.style.opacity = (Math.sin(t2 * Math.PI) * 0.75).toFixed(3);
        }
      }

      // Arrival lines: exactly one can be up, and only at its own stop.
      const sayKey = says ? `${says.station}:${says.index}` : null;
      for (const el of sayEls) {
        const on = el.dataset.say === sayKey;
        const a = on && says ? says.alpha : 0;
        if (a <= 0.002) {
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
            el.style.opacity = "0";
          }
          continue;
        }
        if (el.style.visibility === "hidden") el.style.visibility = "";
        const scale = 0.78 + a * 0.24 - Math.max(0, a - 0.88) * 0.12;
        el.style.opacity = a.toFixed(3);
        el.style.transform =
          `translate(-50%, ${((1 - a) * 10).toFixed(1)}px) scale(${scale.toFixed(3)})`;
      }

      if (rail) rail.style.width = `${(p * 100).toFixed(2)}%`;

      if (clockEl) clockEl.textContent = time;

      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));
      // Geese fly in daylight and rain falls on the legs that earn it. Both are
      // stepped, not continuous, so this is a handful of re-renders across a
      // whole trip rather than one a frame.
      const band = Math.round(sky.t * 4) / 4;
      if (band !== lastBand) { lastBand = band; setDaylight(band); }
      const dark = 1 - Math.min(1, Math.max(0, (luma(sky.gradient[1]) - 0.06) / 0.34));
      root.style.setProperty("--on-sky", mix(INK_LIGHT, INK_DARK, dark));
      root.style.setProperty("--on-sky-2", mix(DIM_LIGHT, DIM_DARK, dark));
      root.style.setProperty("--on-sky-3", mix(INK_LIGHT, INK_DARK, dark));

      // They walk when the camera is moving. Standing at a stop, they stand.
      const moving = travelling && sit < 0.15;
      if (moving !== wasWalking) { wasWalking = moving; setWalking(moving); }
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        if (wasWalking) { wasWalking = false; setWalking(false); }
      }, 160);
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: spacerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
    });

    const onResize = (): void => { size(); apply(st.progress); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (stopTimer !== null) window.clearTimeout(stopTimer);
      st.kill();
    };
  }, [schedule]);

  return (
    <div
      ref={spacer}
      className="journey"
      style={{ height: `${schedule.screens * 100}vh` }}
    >
      <div ref={stage} className="journey__stage">
        <div className="corridor__ground" />
        <svg className="corridor__surface" aria-hidden="true">
          <path data-shoulder="" className="corridor__shoulder" />
          <path data-road="" className="corridor__tarmac" />
        </svg>

        <div className="corridor__world">
          {painted.map((it, i) => (
            <div
              key={`${it.kind}-${i}`}
              data-prop=""
              data-z={it.z}
              data-x={it.x}
              data-y={it.y ?? 0}
              data-s={it.s ?? 1}
              data-kind={it.kind}
              className="prop"
              style={{ opacity: 0 }}
            >
              {CORRIDOR_KINDS[it.kind]?.(it) ?? null}
            </div>
          ))}
        </div>

        {/* Geese, only while there is light to see them by. October at these
            latitudes is migration and all five trips sit under a flyway, so
            this is the same kind of fact as the fall colour. */}
        {daylight > 0.45 && (
          <Flock top={16} duration={46} count={7} direction="right" />
        )}
        {daylight > 0.55 && (
          <Flock top={27} duration={58} delay={19} count={5} direction="right" />
        )}

        {rain > 0 && daylight > 0.2 && <Rain intensity={rain} />}

        <div className="corridor__cast" data-cast="">
          <RearActor id="curse" walking={walking} sitting={sitting} className="rear rear--b" />
          <RearActor id="sun" walking={walking} sitting={sitting} className="rear rear--a" />
        </div>

        {/* Narration is the voice over the scene; it sits clear of the cast. */}
        <div className="corridor__script">
          {schedule.beats.map((b, i) =>
            b.voice !== "narrate" ? null : (
              <p key={i} data-beat="" data-z={b.z} data-hold={b.hold ?? 420}
                className="beat beat--narrate" style={{ opacity: 0 }}>
                {b.text}
              </p>
            ))}
        </div>

        {/* What the two of them actually say, over whichever of them said it. */}
        <div className="saybubbles" aria-hidden="false">
          {schedule.beats.map((b, i) =>
            b.voice === "narrate" ? null : (
              <div key={i} data-beat="" data-bubble="" data-z={b.z} data-hold={b.hold ?? 420}
                className={`saybubble saybubble--${b.voice}`} style={{ opacity: 0 }}>
                <Bust who={b.voice === "sun" ? "sun" : "curse"} face={b.face} />
                <span className="saybubble__body">{b.text}</span>
              </div>
            ))}
        </div>

        {/* Every panel lives in the stage, parked below the fold. None of them
            is a separate screen — they rise over the walk and sink back. */}
        {itinerary.stations.map((s) => (
          <div
            key={s.id}
            data-station={s.id}
            className="journey__panel"
            style={{ visibility: "hidden", opacity: 0 }}
          >
            <div className="journey__card" data-lenis-prevent="">
              <StationPanel
                station={s}
                bookingPriority={priorityFor(bookings, s.stop.name)}
                reaction={answers.stops[s.key]}
                note={answers.notes[s.key]}
                onReact={reactToStop}
                onNote={setNote}
                active={nearId === s.id}
              />
            </div>
            <button
              type="button"
              className="journey__close"
              aria-label={`Close ${s.stop.name} and keep walking`}
              onClick={() => close(s.id)}
            >
              Keep walking
            </button>
          </div>
        ))}

        {/* Dust the card settles into. Decorative only. */}
        <div className="journey__motes" data-motes="" aria-hidden="true">
          {MOTES.map((m, i) => (
            <i key={i} data-mote="" data-mx={m.x} data-my={m.y} data-md={m.d} data-ms={m.s}
              style={{ left: `${m.x}%`, top: `${m.y}%` }} />
          ))}
        </div>

        {/* What they say as they stop, before the card rises. */}
        <div className="saybubbles saybubbles--arrival">
          {schedule.segs.map((seg) =>
            seg.kind !== "station" ? null : seg.lines.map((l, k) => (
              <div key={`${seg.station.id}-${k}`}
                data-say={`${seg.station.id}:${k}`}
                className={`saybubble saybubble--${l.voice}`}
                style={{ opacity: 0, visibility: "hidden" }}>
                <Bust who={l.voice === "sun" ? "sun" : "curse"} face={l.face} />
                <span className="saybubble__body">{l.text}</span>
              </div>
            )),
          )}
        </div>

        <div className="corridor__clock" data-clock="" />
        <div className="corridor__rail"><i data-rail="" style={{ width: "0%" }} /></div>
      </div>
    </div>
  );
}
