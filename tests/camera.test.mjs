import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { cameraFraming, horizontalNavigation, PIXELS_PER_UNIT, MIN_ZOOM } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/camera.js'));
const bounds = { minX: -3, maxX: 270, minY: -48, maxY: 8, maxZ: 0 };

for (const [width, height] of [[1120, 730], [390, 434]]) {
  test(`fixed zoom preserves readable spacing and uniform X/Y scale at ${width}×${height}`, () => {
    for (const zoom of [MIN_ZOOM, 1, 1.5, 2]) {
      const frame = cameraFraming(bounds, width, height, zoom);
      const pixelsPerX = width * frame.zoom / (frame.right - frame.left);
      const pixelsPerY = height * frame.zoom / (frame.top - frame.bottom);
      assert.equal(pixelsPerX, pixelsPerY);
      assert.equal(pixelsPerX, PIXELS_PER_UNIT * zoom);
      assert.ok(6 * pixelsPerX >= 156 * Math.min(1, zoom / 0.8)); // Overview labels scale with spacing.
      assert.ok(horizontalNavigation(bounds, width, zoom).contentWidth >= width);
    }
  });
}

test('adding content or resizing the viewport never compresses node spacing', () => {
  const original = cameraFraming(bounds, 1120, 730, 1).zoom;
  assert.equal(cameraFraming({ ...bounds, maxX: 10000, minY: -10000 }, 1120, 730, 1).zoom, original);
  assert.equal(cameraFraming(bounds, 390, 300, 1).zoom, original);
  assert.ok(horizontalNavigation({ ...bounds, maxX: 10000 }, 1120, 1).contentWidth > horizontalNavigation(bounds, 1120, 1).contentWidth);
});

test('native scrolling moves content by matching pixel distances at every zoom', () => {
  for (const zoom of [MIN_ZOOM, 1, 2]) {
    const scroll = horizontalNavigation({ ...bounds, maxX: 1000 }, 1120, zoom);
    const movedWorld = scroll.targetAt(500) - scroll.targetAt(300);
    assert.ok(Math.abs(movedWorld * PIXELS_PER_UNIT * zoom - 200) < 1e-9);
  }
});

test('zoom and resize preserve the current world center, with bounded ends', () => {
  const center = horizontalNavigation(bounds, 1120, 1).targetAt(2000);
  for (const [width, zoom] of [[1120, MIN_ZOOM], [1120, 2], [390, 1]]) {
    const scroll = horizontalNavigation(bounds, width, zoom);
    const target = scroll.targetAt(scroll.offsetAt(center));
    if (scroll.offsetAt(center) > 0 && scroll.offsetAt(center) < scroll.maxScroll) assert.ok(Math.abs(target - center) < 1e-9);
    else assert.ok(Number.isFinite(target));
    assert.equal(scroll.offsetAt(-Infinity), 0);
    assert.equal(scroll.offsetAt(Infinity), scroll.maxScroll);
    assert.equal(scroll.targetAt(-500), scroll.targetAt(0));
    assert.equal(scroll.targetAt(Infinity), scroll.targetAt(scroll.maxScroll));
  }
});

test('a small or empty graph still has valid navigation', () => {
  const scroll = horizontalNavigation({ ...bounds, minX: -3, maxX: 3 }, 1120, 1);
  assert.equal(scroll.maxScroll, 0);
  assert.equal(scroll.contentWidth, 1120);
  assert.ok(Number.isFinite(scroll.targetAt(0)));
});
