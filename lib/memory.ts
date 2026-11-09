import { MEMORY_IMAGES } from "./memory-images";

/** Two overlapping memory cycles, followed by one shared handwriting and CRT ending. */
export const MEMORY_CYCLES = 2;
// The last photo starts at 2250 ms; the next cycle follows 50 ms later,
// while that photo is still holding. Keep one continuous stream of frames.
export const MEMORY_CYCLE_DURATION = 2300;
export const ENDING_OFFSET = (MEMORY_CYCLES - 1) * MEMORY_CYCLE_DURATION;
export const MEMORY_DURATION = ENDING_OFFSET + 5000;
/** Seeded randomness makes each replay different and keeps layout tests reproducible. */
export function createMemoryShots(seed: number) {
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const images: string[] = [...MEMORY_IMAGES];
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [images[i], images[j]] = [images[j]!, images[i]!];
  }
  const positions: { x: number; y: number }[] = [];
  return images.map((src, index) => {
    let point = { x: .5, y: .5 }, bestDistance = -1;
    // Pick the most open of several random spots, considering currently visible cards.
    for (let candidate = 0; candidate < 24; candidate++) {
      const next = { x: .1 + random() * .8, y: .16 + random() * .68 };
      const distance = Math.min(1, ...positions.slice(-10).map(p => Math.hypot(next.x - p.x, next.y - p.y)));
      if (distance > bestDistance) { point = next; bestDistance = distance; }
    }
    positions.push(point);
    return { src, ...point, start: index * (2250 / (images.length - 1)),
      angle: (random() - .5) * .18, size: .8 + random() * .2 };
  });
}
export const MEMORY_SHOTS = createMemoryShots(71);

export function createMemorySequence(seed: number) {
  return Array.from({ length: MEMORY_CYCLES }, (_, cycle) =>
    createMemoryShots(seed + cycle * 997).map(shot => ({
      ...shot, start: shot.start + cycle * MEMORY_CYCLE_DURATION,
    })),
  ).flat();
}

export function paintingSize(width: number, height: number) {
  const scale = 224 / Math.max(width, height);
  return { width: Math.round(width * scale) + 16, height: Math.round(height * scale) + 22 };
}

export function shotPlacement(shot: { x: number; y: number; size: number }, viewportWidth: number, viewportHeight: number, aspect: number, time = 0) {
  const mobile = viewportWidth < 600;
  const columns = mobile ? 3 : 5, rows = mobile ? 4 : 3;
  const width = Math.min(viewportWidth / columns * .82, viewportHeight / rows * .91 * aspect, 320) * shot.size;
  // A traveling wave passes through the scattered cards, rather than moving them in lockstep.
  const phase = time / 620 - shot.x * Math.PI * 2;
  const marginX = width * .58 + 8;
  const marginY = width / aspect * .58 + 8;
  return {
    width,
    x: Math.max(marginX, Math.min(viewportWidth - marginX, viewportWidth * shot.x + Math.cos(phase) * 6)),
    y: Math.max(marginY, Math.min(viewportHeight - marginY - 42, viewportHeight * shot.y + Math.sin(phase) * (mobile ? 12 : 22))),
  };
}

/** Radial launch with a little angular scatter; no shared wind direction. */
export function dustDirection(x: number, y: number, scatter: number) {
  const angle = Math.atan2(y, x) + scatter * .7;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export const TITLE_START = ENDING_OFFSET + 3750;
export const TITLE_WRITE = 80;
export const TITLE_HOLD = 40;
export const TITLE_SCRIBBLE = 100;

export function memoryFrame(ms: number) {
  const closingMs = ms - ENDING_OFFSET;
  const collapse = ease((closingMs - 4340) / 350);
  const pinch = ease((closingMs - 4700) / 190);
  return {
    title: clamp((ms - TITLE_START) / TITLE_WRITE),
    titleScribble: clamp((ms - TITLE_START - TITLE_WRITE - TITLE_HOLD) / TITLE_SCRIBBLE),
    titleOpacity: ms < TITLE_START ? 0 : 1 - ease((ms - TITLE_START - TITLE_WRITE - TITLE_HOLD - TITLE_SCRIBBLE) / 80),
    ambient: 1 - ease((closingMs - 4030) / 900),
    feather: 2 + ease((closingMs - 4180) / 500) * 20,
    screenX: 1 - pinch,
    screenY: 1 - collapse * .998,
    screenOpacity: 1 - ease((closingMs - 4340) / 610),
    line: ease((closingMs - 4500) / 190) * (1 - ease((closingMs - 4800) / 150)),
    lineX: 1 - ease((closingMs - 4690) / 200),
    done: ms >= MEMORY_DURATION,
  };
}
