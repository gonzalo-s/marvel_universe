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

const { filmFocus } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/filmFocus.js'));
const { resolveGraph } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/timeline.js'));
const { filterGraph } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/filterGraph.js'));
const filmGraph = () => resolveGraph({ rows: [{ id: 0, name: 'Main' }, { id: 5, name: 'Independent' }], nodes: [
  ...Array.from({ length: 5 }, (_, i) => ({ id: `film-${i}`, kind: 'work', title: `Film ${i}`, position: { year: 2000 + i, order: 0, row: 0 }, connections: [] })),
  { id: 'other-universe', kind: 'work', title: 'Other', position: { year: 2002, order: 0, row: 5 }, connections: [] },
  { id: 'event', kind: 'event', title: 'Event', position: { year: 2002, order: 0, row: 0 }, connections: [] },
] });
test('film focus selects the previous/next works from the same timeline', () => {
  const graph = filmGraph(), focus = filmFocus(graph, 'film-2', 1120, 670);
  assert.deepEqual(focus.ids, ['film-1', 'film-2', 'film-3']);
  assert.ok(focus.zoom > .1 && focus.zoom <= .85);
  for (const id of focus.ids) assert.ok(Math.abs(graph.nodes.get(id).position[0] - focus.targetX) * PIXELS_PER_UNIT * focus.zoom < 1120 / 2);
});
test('film focus adapts to mobile width and keeps context at timeline ends', () => {
  const graph = filmGraph();
  assert.deepEqual(filmFocus(graph, 'film-0', 1120, 670).ids, ['film-0', 'film-1', 'film-2']);
  assert.deepEqual(filmFocus(graph, 'film-4', 1120, 670).ids, ['film-2', 'film-3', 'film-4']);
  const mobile = filmFocus(graph, 'film-2', 390, 319);
  assert.ok(mobile.zoom < filmFocus(graph, 'film-2', 1120, 670).zoom);
  for (const id of mobile.ids) assert.ok(Math.abs(graph.nodes.get(id).position[0] - mobile.targetX) * PIXELS_PER_UNIT * mobile.zoom < 390 / 2);
});
test('film focus handles a lone film and rejects hidden works/events', () => {
  const graph = filmGraph();
  assert.deepEqual(filmFocus(graph, 'other-universe', 390, 319).ids, ['other-universe']);
  assert.equal(filmFocus(graph, 'missing', 390, 319), null);
  assert.equal(filmFocus(graph, 'event', 390, 319), null);
  assert.equal(filmFocus(filterGraph(graph, 'event'), 'film-2', 390, 319), null);
});
