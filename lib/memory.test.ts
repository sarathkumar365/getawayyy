import { test } from "node:test";
import assert from "node:assert/strict";
import { ENDING_OFFSET, MEMORY_CYCLE_DURATION, createMemorySequence, createMemoryShots, dustDirection, memoryFrame, MEMORY_DURATION, MEMORY_SHOTS, paintingSize, shotPlacement } from "./memory";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const closingFrame = (ms: number) => memoryFrame(ms + ENDING_OFFSET);

test("photos play before the closing sentence and CRT shutdown", () => {
  for (const shot of createMemorySequence(71)) {
    const state = memoryFrame(shot.start);
    assert.equal(state.title, 0);
    assert.equal(state.screenX, 1);
    assert.equal(state.screenY, 1);
  }
  assert.equal(closingFrame(4000).title, 1);
  assert.equal(closingFrame(4000).screenY, 1);
});

test("all fifty paintings appear once and every asset exists", () => {
  assert.equal(MEMORY_SHOTS.length, 50);
  assert.equal(new Set(MEMORY_SHOTS.map(shot => shot.src)).size, 50);
  for (const shot of MEMORY_SHOTS) {
    assert.ok(shot.src.endsWith(".webp"));
    assert.ok(existsSync(join(process.cwd(), "public", shot.src)));
  }
  assert.equal(readdirSync(join(process.cwd(), "public/memories")).length, 50);
});

test("portrait and landscape paintings keep their proportions inside the paper", () => {
  for (const [width, height] of [[1050, 1400], [1400, 1050], [1400, 1400]]) {
    const size = paintingSize(width!, height!);
    assert.ok(Math.abs((size.width - 16) / (size.height - 22) - width! / height!) < .01);
  }
});

test("random frames cover desktop and mobile without clipping during the wave", () => {
  for (const [w, h] of [[1440, 900], [390, 844], [844, 390]]) {
    const cells = new Set<string>();
    MEMORY_SHOTS.forEach((shot) => {
      for (const aspect of [.58, 1.33]) {
        const p = shotPlacement(shot, w!, h!, aspect, 1200);
        assert.ok(p.x - p.width / 2 > 0 && p.x + p.width / 2 < w!);
        assert.ok(p.y - p.width / aspect / 2 > 0 && p.y + p.width / aspect / 2 < h!);
        cells.add(`${Math.floor(p.x / w! * 3)},${Math.floor(p.y / h! * 3)}`);
      }
    });
    assert.equal(cells.size, 9, "all nine viewport regions receive paintings");
  }
});

test("CRT collapses vertically into a line before contracting horizontally", () => {
  const line = closingFrame(4690);
  assert.ok(line.screenY < .003);
  assert.equal(line.screenX, 1);
  assert.equal(line.line, 1);
  const pinch = closingFrame(4800);
  assert.ok(pinch.screenX > 0 && pinch.screenX < 1);
});

test("at the end of the sequence the screen and luminous line are completely gone", () => {
  for (const time of [MEMORY_DURATION, MEMORY_DURATION + 1000]) {
    const state = memoryFrame(time);
    assert.equal(state.screenOpacity, 0);
    assert.equal(state.ambient, 0);
    assert.equal(state.line, 0);
    assert.equal(state.done, true);
  }
});


test("dust escapes from every edge instead of sharing one wind direction", () => {
  for (const scatter of [-1, 0, 1]) {
    assert.ok(dustDirection(-1, 0, scatter).x < 0);
    assert.ok(dustDirection(1, 0, scatter).x > 0);
    assert.ok(dustDirection(0, -1, scatter).y < 0);
    assert.ok(dustDirection(0, 1, scatter).y > 0);
  }
});


test("the complete handwriting signoff lasts only 300 milliseconds", () => {
  assert.equal(closingFrame(3749).titleOpacity, 0);
  const writing = closingFrame(3790);
  assert.ok(writing.title > 0 && writing.title < 1);
  assert.equal(writing.titleScribble, 0);
  for (const time of [3830, 3850, 3870]) {
    assert.equal(closingFrame(time).title, 1);
    assert.equal(closingFrame(time).titleScribble, 0);
    assert.equal(closingFrame(time).titleOpacity, 1);
  }
  const crossing = closingFrame(3920);
  assert.ok(crossing.titleScribble > 0 && crossing.titleScribble < 1);
  assert.equal(closingFrame(3970).titleScribble, 1);
  assert.ok(closingFrame(4010).titleOpacity < 1);
  assert.ok(closingFrame(4049).titleOpacity > 0);
  assert.equal(closingFrame(4050).titleOpacity, 0);
});

test("the background dims continuously before and throughout the CRT collapse", () => {
  assert.equal(closingFrame(4000).ambient, 1);
  assert.ok(closingFrame(4340).ambient < 1);
  assert.ok(closingFrame(4690).ambient > 0);
  for (let ms = 4030; ms < 5000; ms += 16) {
    const before = closingFrame(ms), after = closingFrame(ms + 16);
    assert.ok(after.ambient <= before.ambient);
    assert.ok(before.ambient - after.ambient < .04);
    assert.ok(after.screenOpacity <= before.screenOpacity);
    assert.ok(before.screenOpacity - after.screenOpacity < .04);
  }
});


test("replays shuffle every painting and scatter positions reproducibly", () => {
  const first = createMemoryShots(1), second = createMemoryShots(2);
  assert.deepEqual(first, createMemoryShots(1));
  assert.notDeepEqual(first.map(s => s.src), second.map(s => s.src));
  assert.deepEqual(first.map(s => s.src).sort(), second.map(s => s.src).sort());
  assert.equal(new Set(first.map(s => s.x)).size, 50);
  const shot = first[5]!;
  const before = shotPlacement(shot, 1440, 900, 1, 0);
  const after = shotPlacement(shot, 1440, 900, 1, 500);
  assert.notEqual(before.y, after.y);
  assert.ok(Math.abs(before.y - after.y) < 44);
});


test("two complete cycles use different orders before a single signoff", () => {
  const sequence = createMemorySequence(123);
  assert.equal(sequence.length, 100);
  const expected = MEMORY_SHOTS.map(s => s.src).sort();
  for (let cycle = 0; cycle < 2; cycle++) {
    const shots = sequence.slice(cycle * 50, (cycle + 1) * 50);
    assert.deepEqual(shots.map(s => s.src).sort(), expected);
    assert.equal(shots[0]!.start, cycle * MEMORY_CYCLE_DURATION);
    assert.equal(memoryFrame(shots[49]!.start).titleOpacity, 0);
    if (cycle > 0) assert.notDeepEqual(shots.map(s => s.src), sequence.slice((cycle - 1) * 50, cycle * 50).map(s => s.src));
  }
  assert.equal(MEMORY_DURATION, 7300);
});


test("the cycle boundary keeps the same photo cadence without a blank pause", () => {
  const sequence = createMemorySequence(123);
  for (let i = 1; i < sequence.length; i++) {
    const gap = sequence[i]!.start - sequence[i - 1]!.start;
    assert.ok(gap > 0 && gap <= 50, `photo ${i} has a ${gap} ms gap`);
  }
  const boundary = sequence[50]!.start;
  // Several previous photos are still within their 300 ms hold as cycle two begins.
  assert.ok(sequence.slice(0, 50).filter(s => boundary - s.start < 300).length >= 4);
  assert.equal(memoryFrame(boundary).ambient, 1);
  assert.equal(memoryFrame(boundary).screenOpacity, 1);
  assert.equal(memoryFrame(boundary).titleOpacity, 0);
});
