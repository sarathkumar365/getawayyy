/** Bound work by surface area, not device names or reported CPU counts. */
export const MAX_PAINTING_GRAINS = 2000;

export function grainStep(width: number, height: number) {
  let step = Math.max(5, Math.ceil(Math.sqrt(width * height / MAX_PAINTING_GRAINS)));
  while (Math.ceil(width / step) * Math.ceil(height / step) > MAX_PAINTING_GRAINS) step++;
  return step;
}

export function canvasRatio(width: number, height: number, deviceRatio: number) {
  // Large iPads must not allocate millions of backing pixels per frame.
  return Math.min(deviceRatio, 1.5, Math.sqrt(1_000_000 / Math.max(1, width * height)));
}

export type ParticleQuality = { stride: number; slowFrames: number; healthyFrames: number };

/** Profile actual drawing cost. Recover more slowly than we shed work to avoid oscillation. */
export function particleQuality(quality: ParticleQuality, drawMs: number, frameGap: number): ParticleQuality {
  // Low Power Mode may intentionally run at 30 Hz: don't remove dust for that alone.
  const slow = drawMs > 10 || (frameGap > 25 && drawMs > 6);
  const healthy = drawMs < 5 && frameGap < 22;
  const slowFrames = slow ? quality.slowFrames + 1 : Math.max(0, quality.slowFrames - 1);
  const healthyFrames = healthy ? quality.healthyFrames + 1 : 0;
  if (slowFrames >= 8) return { stride: Math.min(4, quality.stride + 1), slowFrames: 0, healthyFrames: 0 };
  if (healthyFrames >= 90) return { stride: Math.max(1, quality.stride - 1), slowFrames: 0, healthyFrames: 0 };
  return { stride: quality.stride, slowFrames, healthyFrames };
}

/** Cache erosion for two 60 Hz frames; positions and dust still update every frame. */
export function erosionFrame(progress: number) {
  return Math.floor(Math.max(0, Math.min(1, progress)) * 18);
}
