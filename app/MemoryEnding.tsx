"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clamp, dustDirection, paintingSize, shotPlacement, createMemorySequence, MEMORY_SHOTS, memoryFrame } from "@/lib/memory";
import "@/styles/memory.css";

type Grain = { x: number; y: number; release: number; speed: number; curl: number; radius: number; alpha: number; vx: number; vy: number; color: string };
type Painting = { source: HTMLCanvasElement; layer: HTMLCanvasElement; context: CanvasRenderingContext2D; grains: Grain[] };
const GRAIN_STEP = 5;
const HOLD = 300;
const ERODE = 600;
const DRIFT = 900;

/** Sample the painting once. Dust carries the actual pigment underneath each grain. */
function paintingFrom(image: HTMLImageElement, index: number): Painting {
  const layer = document.createElement("canvas");
  const { width, height } = paintingSize(image.naturalWidth, image.naturalHeight);
  layer.width = width; layer.height = height;
  const context = layer.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable");
  // Bake a warm paper frame and a feathered edge once, including its alpha.
  context.fillStyle = "#d7c5a6";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 8, 8, width - 16, height - 22);
  const data = context.getImageData(0, 0, width, height);
  const pixels = data.data;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const cornerX = Math.max(12 - x, x - (width - 13), 0);
    const cornerY = Math.max(12 - y, y - (height - 13), 0);
    const edge = 12 - Math.hypot(cornerX, cornerY);
    const opacity = clamp(edge / 9);
    pixels[(y * width + x) * 4 + 3] = Math.round(255 * opacity * opacity * (3 - 2 * opacity));
  }
  context.putImageData(data, 0, 0);
  return samplePainting(layer, index);
}

/** Sample the painting pigment for its dust particles. */
function samplePainting(layer: HTMLCanvasElement, index: number): Painting {
  const width = layer.width, height = layer.height;
  const context = layer.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable");
  const pixels = context.getImageData(0, 0, width, height).data;
  const source = document.createElement("canvas");
  source.width = width; source.height = height;
  const sourceContext = source.getContext("2d");
  if (!sourceContext) throw new Error("Canvas is unavailable");
  sourceContext.drawImage(layer, 0, 0);
  const grains: Grain[] = [];
  let seed = 71 + index * 991;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < height; y += GRAIN_STEP) for (let x = 0; x < width; x += GRAIN_STEP) {
    const px = Math.min(width - 1, Math.floor(x + random() * GRAIN_STEP));
    const py = Math.min(height - 1, Math.floor(y + random() * GRAIN_STEP));
    const offset = (py * width + px) * 4;
    const alpha = (pixels[offset + 3] ?? 0) / 255;
    if (alpha === 0) continue;
    const nx = (px / width - .5) * 2;
    const ny = (py / height - .5) * 2;
    const direction = dustDirection(nx, ny, random() * 2 - 1);
    grains.push({ x: px, y: py, alpha, vx: direction.x, vy: direction.y,
      // All edges disintegrate inward, while the freed dust travels outward.
      release: clamp((1 - Math.max(Math.abs(nx), Math.abs(ny))) * .65 + random() * .25),
      speed: 80 + random() * 190, curl: random() * Math.PI * 2,
      radius: .25 + random() * .9,
      color: `rgb(${pixels[offset]} ${pixels[offset + 1]} ${pixels[offset + 2]})`,
    });
  }
  return { source, layer, context, grains };
}

export function MemoryEnding() {
  const preparedPaintings = useRef<Painting[] | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const ambient = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const handwriting = useRef<SVGSVGElement>(null);
  const ink = useRef<SVGPathElement>(null);
  const scribble = useRef<SVGPathElement>(null);
  const [take, setTake] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    const screenEl = screen.current, titleEl = title.current, lineEl = line.current, ambientEl = ambient.current;
    if (!el || !ctx || !screenEl || !titleEl || !lineEl || !ambientEl) { setError(true); return; }
    let cancelled = false, frame = 0;
    let paintings: Painting[] = [];
    const shots = createMemorySequence(Math.floor(Math.random() * 0xffffffff));
    let startedAt = 0;
    let elapsed = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      // The screen itself collapses; its layout size remains the viewport size.
      el.width = el.clientWidth * dpr; el.height = el.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);
    ambientEl.style.opacity = "1";
    screenEl.style.setProperty("--edge-feather", "2%");
    screenEl.style.transform = "none";
    screenEl.style.opacity = "1";
    titleEl.style.opacity = "0";
    if (handwriting.current) handwriting.current.style.opacity = "0";
    lineEl.style.opacity = "0";

    const drawPainting = (
      painting: Painting, age: number, width: number, x: number, y: number,
      angle: number, hold: number, erode: number, drift: number, entrance: number,
    ) => {
      const sourceWidth = painting.source.width, sourceHeight = painting.source.height;
      const scale = width / sourceWidth;
      const height = sourceHeight * scale;
      const eroding = clamp((age - hold) / erode);
      const { context: off, layer, source, grains } = painting;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.scale(1 + Math.min(age, 500) * .000025, 1 + Math.min(age, 500) * .000025);
      if (eroding < 1) {
        off.globalCompositeOperation = "source-over";
        off.clearRect(0, 0, sourceWidth, sourceHeight);
        off.drawImage(source, 0, 0, sourceWidth, sourceHeight);
        if (eroding > 0) {
          off.globalCompositeOperation = "destination-out";
          off.beginPath();
          for (const grain of grains) {
            const eaten = clamp((eroding - grain.release) * 14);
            if (!eaten) continue;
            const r = eaten * (GRAIN_STEP + 1);
            off.moveTo(grain.x + r, grain.y);
            off.arc(grain.x, grain.y, r, 0, Math.PI * 2);
          }
          off.fill();
        }
        ctx.globalAlpha = entrance;
        ctx.drawImage(layer, -width / 2, -height / 2, width, height);
      }
      // Thousands of fine, independent grains accelerate into a curling breeze.
      for (const grain of grains) {
        const life = (age - hold - grain.release * erode) / drift;
        if (life <= 0 || life >= 1) continue;
        const launch = life * life;
        const distance = grain.speed * (life * .35 + launch * 1.7);
        const swirl = (Math.sin(life * 5 + grain.curl) - Math.sin(grain.curl)) * life * 28;
        const driftX = grain.vx * distance - grain.vy * swirl;
        const driftY = grain.vy * distance + grain.vx * swirl;
        const px = (grain.x - sourceWidth / 2) * scale + driftX;
        const py = (grain.y - sourceHeight / 2) * scale + driftY;
        ctx.globalAlpha = grain.alpha * entrance * Math.min(1, life * 22) * Math.pow(1 - life, 1.45);
        ctx.fillStyle = grain.color;
        ctx.beginPath();
        ctx.arc(px, py, grain.radius * Math.min(scale, 1.5) * (1 - life * .5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    const draw = (time: number) => {
      const w = el.clientWidth, h = el.clientHeight;
      ctx.clearRect(0, 0, w, h);
      shots.forEach((shot) => {
        const painting = paintings[MEMORY_SHOTS.findIndex(image => image.src === shot.src)];
        const age = time - shot.start;
        if (!painting || age < 0 || age > HOLD + ERODE + DRIFT) return;
        const { width, x, y } = shotPlacement(shot, w, h,
          painting.source.width / painting.source.height, time);
        const entrance = clamp(age / 140);
        drawPainting(painting, age, width, x, y, shot.angle, HOLD, ERODE, DRIFT,
          entrance * entrance * (3 - 2 * entrance));
      });
      const state = memoryFrame(time);
      if (handwriting.current) handwriting.current.style.opacity = String(state.titleOpacity);
      if (ink.current) ink.current.style.strokeDashoffset = String(1 - state.title);
      if (scribble.current) scribble.current.style.strokeDashoffset = String(1 - state.titleScribble);
      ambientEl.style.opacity = String(state.ambient);
      screenEl.style.setProperty("--edge-feather", `${state.feather}%`);
      screenEl.style.transform = `scale(${state.screenX}, ${state.screenY})`;
      screenEl.style.opacity = String(state.screenOpacity);
      lineEl.style.opacity = String(state.line);
      lineEl.style.transform = `translate(-50%, -50%) scaleX(${state.lineX})`;
    };
    const stopForReducedMotion = () => {
      if (!motion.matches) return;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, el.clientWidth, el.clientHeight);
      titleEl.style.opacity = "1";
      if (handwriting.current) handwriting.current.style.opacity = "0";
      ambientEl.style.opacity = "1";
      screenEl.style.transform = "none"; screenEl.style.opacity = "1";
      lineEl.style.opacity = "0";
      setFinished(true);
    };
    motion.addEventListener("change", stopForReducedMotion);
    const tick = (now: number) => {
      if (cancelled) return;
      elapsed = now - startedAt;
      draw(elapsed);
      if (!memoryFrame(elapsed).done) frame = requestAnimationFrame(tick);
      else setFinished(true);
    };
    // A background tab must not consume the entire film unseen.
    const visibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (paintings.length && !motion.matches && !memoryFrame(elapsed).done) {
        startedAt = performance.now() - elapsed;
        frame = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const play = async () => {
      if (motion.matches) { stopForReducedMotion(); return; }
      try {
        await document.fonts.ready;
        if (cancelled) return;
        paintings = preparedPaintings.current ?? await Promise.all(MEMORY_SHOTS.map(async (shot, i) => {
          const image = new Image(); image.src = shot.src;
          await image.decode();
          return paintingFrom(image, i);
        }));
        preparedPaintings.current = paintings;
      } catch (cause) {
        console.error("Unable to load memory paintings", cause);
        if (!cancelled) { setError(true); titleEl.style.opacity = "1"; setFinished(true); }
        return;
      }
      if (cancelled) return;
      if (motion.matches) { stopForReducedMotion(); return; }
      startedAt = performance.now();
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    void play();
    return () => {
      cancelled = true; cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
      motion.removeEventListener("change", stopForReducedMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [take]);

  return <main className="memory">
    <div ref={ambient} className="memory__ambient" aria-hidden="true" />
    <div ref={screen} className="memory__screen">
      <canvas ref={canvas} className="memory__canvas" role="img" aria-label="Painted memories crumble into fine dust and drift away" />
      <h1 ref={title} className="memory__thanks">the end.</h1>
      <svg ref={handwriting} className="memory__handwriting" viewBox="0 0 350 110" aria-hidden="true">
        <path ref={ink} pathLength="1" className="memory__ink" d="M36 26 Q30 51 27 70 Q25 84 44 72 M17 48 Q33 45 49 46 M61 77 Q68 46 72 22 Q75 13 77 23 Q80 39 62 62 Q81 44 88 51 Q94 57 86 73 Q83 82 100 70 M102 63 Q127 62 122 51 Q118 42 107 55 Q94 75 111 78 Q123 79 133 68 M163 63 Q188 62 183 51 Q179 43 168 55 Q155 76 172 79 Q184 80 195 68 M204 50 L197 78 Q213 45 224 51 Q230 54 223 72 Q220 82 237 72 M270 53 Q258 43 248 55 Q235 74 247 79 Q262 81 272 56 L281 22 Q285 12 286 23 Q286 43 270 67 Q263 84 282 73 M303 77 L304 78" />
        <path ref={scribble} pathLength="1" className="memory__ink memory__scribble" d="M15 67 Q138 34 308 54 Q202 89 26 48 Q174 37 315 73 Q161 87 20 59 Q161 29 311 63 Q170 97 28 73" />
      </svg>
    </div>
    <div ref={line} className="memory__crt-line" aria-hidden="true" />
    {finished && <button className="memory__replay" aria-label="Replay the memories" onClick={() => {
      setFinished(false); setError(false); setTake(t => t + 1);
    }} />}
    {error && <p role="status" className="memory__error">Memories could not load. Tap to retry.</p>}
    <Link className="memory__trips" href="/trips">our trips <span aria-hidden="true">↗</span></Link>
  </main>;
}
