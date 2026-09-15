"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LENS, beatAlpha, clockAt, project, sortForPaint } from "@/lib/scene/corridor";
import { makePath, STRAIGHT } from "@/lib/scene/path";
import { skyAtTime } from "@/lib/sky";
import { buildSchedule, cameraAt } from "@/lib/scene/schedule";
import { hexToRgb, propColour } from "@/lib/scene/palette";
import { scrollToY } from "@/lib/lenis";
import { CORRIDOR_KINDS } from "./corridorKinds";
import { RearActor } from "@/components/characters/RearActor";
import { StationPanel } from "@/components/station/StationPanel";
import { useAnswers } from "@/lib/answers";
import type { Itinerary } from "@/lib/scene/itinerary";
import type { Leg } from "@/lib/scene/corridor";
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

  const { answers, reactToStop, setNote } = useAnswers();
  const bookings = useMemo(() => bookingPriorities(trip), [trip]);

  const schedule = useMemo(
    () => buildSchedule(itinerary, legs, { depthPerScreen }),
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
    scrollToY(el.offsetTop + frac * el.offsetHeight + 8);
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
      const { z: cam, travelling, rise } = cameraAt(schedule, p);

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
        node.style.transform = `translateY(${((1 - a) * 16).toFixed(1)}px)`;
        node.style.pointerEvents = a > 0.5 ? "auto" : "none";
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
        const lift = (1 - up) * 46;
        const scale = 0.972 + up * 0.028;
        node.style.transform =
          `translate(-50%, calc(-50% + ${lift.toFixed(1)}px)) scale(${scale.toFixed(4)})`;
        node.style.opacity = up.toFixed(3);
        node.style.pointerEvents = up > 0.9 ? "auto" : "none";
      }

      if (cast) {
        const lead = 170;
        const shift = (path.bend(cam + lead) - path.bend(cam)) * (LENS.focal / (LENS.focal + lead));
        // The cast stands aside as a panel comes up, so they are never behind it.
        const anyUp = Math.max(0, ...Object.values(rise));
        cast.style.transform =
          `translateX(${shift.toFixed(1)}px) translateY(${(anyUp * 12).toFixed(1)}px)`;
        cast.style.opacity = (1 - anyUp * 0.45).toFixed(3);
      }

      if (rail) rail.style.width = `${(p * 100).toFixed(2)}%`;

      if (clockEl) clockEl.textContent = time;

      root.style.setProperty("--sky-1", sky.gradient[0]);
      root.style.setProperty("--sky-2", sky.gradient[1]);
      root.style.setProperty("--sky-3", sky.gradient[2]);
      root.style.setProperty("--sky-light", sky.light);
      root.style.setProperty("--sky-t", sky.t.toFixed(3));
      const dark = 1 - Math.min(1, Math.max(0, (luma(sky.gradient[1]) - 0.06) / 0.34));
      root.style.setProperty("--on-sky", mix(INK_LIGHT, INK_DARK, dark));
      root.style.setProperty("--on-sky-2", mix(DIM_LIGHT, DIM_DARK, dark));
      root.style.setProperty("--on-sky-3", mix(INK_LIGHT, INK_DARK, dark));

      // They walk when the camera is moving. Standing at a stop, they stand.
      const moving = travelling;
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

        <div className="corridor__cast" data-cast="">
          <RearActor id="curse" walking={walking} className="rear rear--b" />
          <RearActor id="sun" walking={walking} className="rear rear--a" />
        </div>

        <div className="corridor__script">
          {schedule.beats.map((b, i) => (
            <p key={i} data-beat="" data-z={b.z} data-hold={b.hold ?? 420}
              className={`beat beat--${b.voice}`} style={{ opacity: 0 }}>
              {b.voice !== "narrate" && (
                <span className="beat__who">{b.voice === "sun" ? "A" : "B"}</span>
              )}
              <span className="beat__t">{b.text}</span>
            </p>
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
            data-lenis-prevent=""
          >
            <button
              type="button"
              className="journey__close"
              aria-label={`Close ${s.stop.name} and keep walking`}
              onClick={() => close(s.id)}
            >
              Keep walking
            </button>
            <StationPanel
              station={s}
              bookingPriority={priorityFor(bookings, s.stop.name)}
              reaction={answers.stops[s.key]}
              note={answers.notes[s.key]}
              onReact={reactToStop}
              onNote={setNote}
            />
          </div>
        ))}

        <div className="corridor__clock" data-clock="" />
        <div className="corridor__rail"><i data-rail="" style={{ width: "0%" }} /></div>
      </div>
    </div>
  );
}
