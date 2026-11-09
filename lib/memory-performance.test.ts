import { test } from "node:test";
import assert from "node:assert/strict";
import { canvasRatio, erosionFrame, grainStep, MAX_PAINTING_GRAINS, particleQuality } from "./memory-performance";
import { paintingSize } from "./memory";

test("particle work stays bounded for portrait, landscape and square paintings", () => {
  for (const [w, h] of [[900, 1200], [1200, 900], [900, 900]]) {
    const { width, height } = paintingSize(w!, h!);
    const step = grainStep(width, height);
    const count = Math.ceil(width / step) * Math.ceil(height / step);
    assert.ok(count <= MAX_PAINTING_GRAINS);
    assert.ok(count >= 1200, "retain dense dust on devices that can draw it smoothly");
  }
});

test("retina phone and tablet canvases stay within one million backing pixels", () => {
  for (const [w, h, dpr] of [[393, 852, 3], [1024, 1366, 2], [1366, 1024, 2], [1920, 1080, 2]]) {
    const ratio = canvasRatio(w!, h!, dpr!);
    assert.ok(Math.floor(w! * ratio) * Math.floor(h! * ratio) <= 1_000_000);
    assert.ok(ratio <= dpr!);
  }
});

test("sustained slow frames reduce dust work with a fixed lower quality bound", () => {
  let quality = { stride: 1, slowFrames: 0, healthyFrames: 0 };
  for (let frame = 0; frame < 7; frame++) quality = particleQuality(quality, 14, 33);
  assert.equal(quality.stride, 1);
  quality = particleQuality(quality, 14, 33);
  assert.equal(quality.stride, 2);
  for (let frame = 0; frame < 100; frame++) quality = particleQuality(quality, 14, 33);
  assert.equal(quality.stride, 4);
});

test("fast rendering restores dust density without responding to isolated good frames", () => {
  let quality = { stride: 3, slowFrames: 0, healthyFrames: 0 };
  for (let frame = 0; frame < 89; frame++) quality = particleQuality(quality, 3, 16.7);
  assert.equal(quality.stride, 3);
  quality = particleQuality(quality, 3, 16.7);
  assert.equal(quality.stride, 2);
  for (let frame = 0; frame < 200; frame++) quality = particleQuality(quality, 3, 16.7);
  assert.equal(quality.stride, 1);
});

test("intentional 30 Hz playback does not discard dust when rendering is cheap", () => {
  let quality = { stride: 1, slowFrames: 0, healthyFrames: 0 };
  for (let frame = 0; frame < 100; frame++) quality = particleQuality(quality, 3, 33.3);
  assert.equal(quality.stride, 1);
});

test("erosion shares adjacent frames and resets when a painting reappears", () => {
  assert.equal(erosionFrame(200 / 600), erosionFrame(216 / 600));
  assert.notEqual(erosionFrame(200 / 600), erosionFrame(250 / 600));
  assert.equal(erosionFrame(1), 18);
  assert.equal(erosionFrame(0), 0);
});
