import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { timeline } = require(join(process.env.TIMELINE_CHECK_DIR, 'data/timeline.js'));
const { layoutTimeline } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/layoutTimeline.js'));
const { validateTimeline, assertTimeline } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/validateTimeline.js'));
const { resolveGraph } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/timeline.js'));
const positions = layout => Object.fromEntries(layout.nodes.map(item => [item.node.id, item.position]));

test('consumes all supplied nodes, connections and rows', () => {
  const graph = resolveGraph(timeline);
  assert.equal(graph.nodes.size, timeline.nodes.length);
  assert.equal(graph.connections.length, timeline.nodes.reduce((count, node) => count + node.connections.length, 0));
  assert.equal(graph.rows.size, timeline.rows.length);
  assert.equal(graph.nodes.get('departure').node.releaseYear, 2019);
  assert.equal(graph.nodes.get('departure').node.position.year, 2023);
});
test('array reordering leaves layout and rendered positions unchanged without mutating input', () => {
  const before = structuredClone(timeline);
  const reordered = { rows: [...timeline.rows].reverse(), nodes: [...timeline.nodes].reverse() };
  assert.deepEqual(positions(layoutTimeline(reordered)), positions(layoutTimeline(timeline)));
  assert.deepEqual(positions(resolveGraph(reordered).layout), positions(resolveGraph(timeline).layout));
  assert.deepEqual(timeline, before);
});
test('data-only additions allow sparse rows, shared columns, independent rows, nested branches and cycles', () => {
  const data = structuredClone(timeline);
  data.rows.push({ id: 90, name: 'Independent' }, { id: 700, name: 'Empty row' });
  data.nodes.push({ id: 'new', kind: 'event', title: 'New event', position: { ...data.nodes[0].position, row: 90 }, connections: [{ targetId: 'capture', type: 'transition' }, { targetId: 'escape', type: 'branch' }] });
  data.nodes[0].connections.push({ targetId: 'new', type: 'branch' });
  const graph = resolveGraph(data);
  assert.equal(graph.nodes.size, timeline.nodes.length + 1);
  assert.equal(graph.connections.length, timeline.nodes.reduce((count, node) => count + node.connections.length, 0) + 3);
  assert.equal(graph.rows.size, timeline.rows.length + 2);
  assert.equal(graph.nodes.get('new').position[0], graph.nodes.get('capture').position[0]);
  assert.equal(graph.rows.get(90).y, -timeline.rows.length * 20);
});
test('logical edits move nodes and both incoming and outgoing endpoints', () => {
  const data = structuredClone(timeline);
  data.nodes.find(n => n.id === 'escape').position = { year: 2030, order: 10, row: 5 };
  const graph = resolveGraph(data);
  const target = graph.nodes.get('escape').position;
  assert.notDeepEqual(target, resolveGraph(timeline).nodes.get('escape').position);
  assert.deepEqual(graph.connections.find(e => e.targetId === 'escape').end, target);
  assert.deepEqual(graph.connections.find(e => e.sourceId === 'escape').start, target);
});
test('backward transitions are accepted and curves plus render padding fit inside bounds', () => {
  const graph = resolveGraph(timeline);
  assert.ok(graph.connections.some(e => e.type === 'transition' && e.end[0] < e.start[0]));
  for (const edge of graph.connections) for (const p of edge.points) {
    assert.ok(p[0] > graph.bounds.minX && p[0] < graph.bounds.maxX);
    assert.ok(p[1] > graph.bounds.minY && p[1] < graph.bounds.maxY);
  }
});
test('same-cell additions stack stably and keep endpoints attached', () => {
  const data = structuredClone(timeline);
  data.nodes.push({ id: 'another', kind: 'event', title: 'Same cell', position: { ...data.nodes[0].position }, connections: [{ targetId: data.nodes[0].id, type: 'sequence' }] });
  const graph = resolveGraph(data);
  assert.notDeepEqual(graph.nodes.get('another').position, graph.nodes.get('capture').position);
  assert.deepEqual(graph.connections.find(e => e.sourceId === 'another').start, graph.nodes.get('another').position);
  assert.deepEqual(positions(graph.layout), positions(resolveGraph({ ...data, nodes: [...data.nodes].reverse() }).layout));
});
for (const [name, mutate, path] of [
  ['missing kind', d => { delete d.nodes[0].kind; }, 'nodes[0].kind'],
  ['unknown kind', d => { d.nodes[0].kind = 'movie'; }, 'nodes[0].kind'],
  ['null kind', d => { d.nodes[0].kind = null; }, 'nodes[0].kind'],
  ['duplicate node', d => { d.nodes[1].id = d.nodes[0].id; }, 'nodes[1].id'],
  ['duplicate row', d => { d.rows[1].id = d.rows[0].id; }, 'rows[1].id'],
  ['unknown row', d => { d.nodes[0].position.row = 90; }, 'nodes[0].position.row'],
  ['unknown target', d => { d.nodes[0].connections[0].targetId = 'missing'; }, 'nodes[0].connections[0].targetId'],
  ['null year', d => { d.nodes[0].position.year = null; }, 'nodes[0].position.year'],
  ['fractional order', d => { d.nodes[0].position.order = 0.5; }, 'nodes[0].position.order'],
  ['negative order', d => { d.nodes[0].position.order = -1; }, 'nodes[0].position.order'],
  ['missing position', d => { delete d.nodes[0].position; }, 'nodes[0].position'],
  ['unknown type', d => { d.nodes[0].connections[0].type = 'time_travel'; }, 'nodes[0].connections[0].type'],
  ['obsolete edges field', d => { d.edges = []; }, 'data.edges'],
]) test(`rejects ${name} with an actionable path`, () => {
  const data = structuredClone(timeline); mutate(data);
  const result = validateTimeline(data);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.startsWith(`${path}:`)));
  assert.throws(() => assertTimeline(data), /Invalid timeline data/);
});
test('empty nodes remain valid, and invalid spacing is rejected', () => {
  assert.equal(resolveGraph({ rows: [{ id: 40, name: 'Empty' }], nodes: [] }).nodes.size, 0);
  for (const value of [0, -1, Infinity, NaN]) assert.throws(() => layoutTimeline(timeline, { columnSpacing: value }), /positive and finite/);
});

test('large same-cell stacks reserve row space and preserve every connection endpoint', () => {
  const data = structuredClone(timeline);
  for (let i = 0; i < 12; i++) data.nodes.push({
    id: `stack-${i}`, kind: 'event', title: `Stack ${i}`, position: { ...data.nodes[0].position },
    connections: [{ targetId: 'capture', type: 'sequence' }],
  });
  const graph = resolveGraph(data);
  const stack = graph.layout.nodes.filter(item => item.column === graph.nodes.get('capture').column && item.node.position.row === 0);
  const bottom = Math.min(...stack.map(item => item.position[1]));
  const topOfNextRow = graph.rows.get(1).y;
  assert.ok(bottom - topOfNextRow >= 8);
  assert.equal(new Set(stack.map(item => item.position[1])).size, 13);
  for (const edge of graph.connections) {
    assert.deepEqual(edge.start, graph.nodes.get(edge.sourceId).position);
    assert.deepEqual(edge.end, graph.nodes.get(edge.targetId).position);
  }
  assert.deepEqual(positions(graph.layout), positions(resolveGraph({ ...data, nodes: [...data.nodes].reverse(), rows: [...data.rows].reverse() }).layout));
});


test('kind classifies independently of workId and places events below the work band', () => {
  const data = structuredClone(timeline);
  const event = data.nodes.find(node => node.kind === 'event' && node.workId);
  const work = data.nodes.find(node => node.kind === 'work' && node.workId);
  assert.ok(event);
  assert.ok(work);
  assertTimeline(data);
  const before = positions(resolveGraph(data).layout);
  event.kind = 'work';
  work.kind = 'event';
  assertTimeline(data);
  const after = positions(resolveGraph(data).layout);
  assert.ok(after[event.id][1] > before[event.id][1]);
  assert.ok(after[work.id][1] < before[work.id][1]);
  assert.equal(after[event.id][0], before[event.id][0]);
  assert.equal(after[work.id][0], before[work.id][0]);
  assert.equal(resolveGraph(data).nodes.get(event.id).node.kind, 'work');
});

test('angled route channels keep separated corridors and clear node/label regions', () => {
  const graph = resolveGraph(timeline);
  const channels = graph.connections.filter(edge => edge.route === 'channel');
  assert.ok(channels.length > 0);
  for (let i = 0; i < channels.length; i++) {
    const edge = channels[i];
    const [a, b] = edge.points.slice(2, 4);
    const min = Math.min(a[0], b[0]), max = Math.max(a[0], b[0]);
    assert.ok(Math.abs(a[1] - b[1]) <= 0.2);
    assert.notEqual(edge.points[0][1], edge.points[1][1]);
    for (const other of channels.slice(i + 1)) {
      const [c, d] = other.points.slice(2, 4);
      if (a[1] === c[1]) assert.ok(max < Math.min(c[0], d[0]) || min > Math.max(c[0], d[0]));
    }
    for (const node of graph.layout.nodes) {
      if (node.position[0] >= min - 2.3 && node.position[0] <= max + 2.3)
        assert.ok(a[1] < node.position[1] - 3.5 || Math.min(a[1], b[1]) > node.position[1] + 1.4);
    }
  }
  const reordered = resolveGraph({ rows: [...timeline.rows].reverse(), nodes: [...timeline.nodes].reverse() });
  assert.deepEqual(Object.fromEntries(graph.connections.map(edge => [edge.id, edge.points])), Object.fromEntries(reordered.connections.map(edge => [edge.id, edge.points])));
});

test('parallel, reciprocal and self connections retain distinct routes and endpoints', () => {
  const data = { rows: [{ id: 0, name: 'One' }], nodes: [
    { id: 'a', kind: 'event', title: 'A', position: { year: 2000, order: 0, row: 0 }, connections: [
      { targetId: 'b', type: 'sequence' }, { targetId: 'b', type: 'transition' }, { targetId: 'a', type: 'transition' },
    ] },
    { id: 'b', kind: 'event', title: 'B', position: { year: 2001, order: 0, row: 0 }, connections: [{ targetId: 'a', type: 'transition' }] },
  ] };
  const graph = resolveGraph(data);
  assert.equal(new Set(graph.connections.map(edge => JSON.stringify(edge.points))).size, 4);
  for (const edge of graph.connections) {
    assert.deepEqual(edge.points[0], graph.nodes.get(edge.sourceId).position);
    assert.deepEqual(edge.points.at(-1), graph.nodes.get(edge.targetId).position);
    assert.ok(edge.points.flat().every(Number.isFinite));
    assert.equal(edge.route, 'channel');
  }
});

const { filterGraph } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/filterGraph.js'));
test('kind filters preserve geometry and only retain connections between visible nodes', () => {
  const original = resolveGraph(timeline);
  assert.equal(filterGraph(original, 'all'), original);
  for (const kind of ['work', 'event']) {
    const filtered = filterGraph(original, kind);
    assert.equal(filtered.nodes.size, timeline.nodes.filter(node => node.kind === kind).length);
    assert.equal(filtered.bounds, original.bounds);
    for (const item of filtered.layout.nodes) {
      assert.equal(item.node.kind, kind);
      assert.deepEqual(item.position, original.nodes.get(item.node.id).position);
    }
    const expected = original.connections.filter(edge => filtered.nodes.has(edge.sourceId) && filtered.nodes.has(edge.targetId));
    assert.deepEqual(filtered.connections, expected);
    assert.ok(filtered.layout.connections.every(edge => filtered.nodes.has(edge.sourceId) && filtered.nodes.has(edge.targetId)));
  }
  assert.equal(original.nodes.size, timeline.nodes.length);
});
test('filters can produce an empty view without inventing edges or changing bounds', () => {
  const graph = resolveGraph({ rows: [{ id: 0, name: 'Row' }], nodes: [{ id: 'e', kind: 'event', title: 'Event', position: { year: 2000, order: 0, row: 0 }, connections: [] }] });
  const filtered = filterGraph(graph, 'work');
  assert.equal(filtered.nodes.size, 0);
  assert.equal(filtered.connections.length, 0);
  assert.equal(filtered.bounds, graph.bounds);
});

test('TMDB metadata and curated themes validate without changing layout', () => {
  const data = structuredClone(timeline);
  data.nodes[0].tmdb = { mediaType: 'tv', id: 123, season: 0, posterPath: '/poster.jpg', backdropPath: null, posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg', backdropUrl: null };
  data.nodes[0].theme = { primary: '#abc', accent: '#123456' };
  assertTimeline(data);
  const plain = structuredClone(data);
  for (const node of plain.nodes) { delete node.tmdb; delete node.theme; }
  assert.deepEqual(positions(resolveGraph(data).layout), positions(resolveGraph(plain).layout));
});
for (const [name, mutate, path] of [
  ['TMDB ID', d => { d.nodes[0].tmdb = { mediaType: 'movie', id: -1 }; }, 'nodes[0].tmdb.id'],
  ['TMDB media type', d => { d.nodes[0].tmdb = { mediaType: 'person' }; }, 'nodes[0].tmdb.mediaType'],
  ['movie season', d => { d.nodes[0].tmdb = { mediaType: 'movie', season: 1 }; }, 'nodes[0].tmdb.season'],
  ['TMDB path traversal', d => { d.nodes[0].tmdb = { mediaType: 'movie', posterPath: '/../../secret' }; }, 'nodes[0].tmdb.posterPath'],
  ['external image URL', d => { d.nodes[0].tmdb = { mediaType: 'movie', posterUrl: 'https://example.com/poster.jpg' }; }, 'nodes[0].tmdb.posterUrl'],
  ['theme color', d => { d.nodes[0].theme = { primary: 'invalid', accent: '#fff' }; }, 'nodes[0].theme.primary'],
]) test(`rejects invalid ${name}`, () => {
  const data = structuredClone(timeline); mutate(data);
  assert.ok(validateTimeline(data).errors.some(error => error.startsWith(`${path}:`)));
});

const { selectionConnections } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/selectionConnections.js'));
function selectionGraph() {
  const node = (id, kind, workId, connections) => ({ id, kind, title: id, workId, position: { year: 2020, order: 0, row: 0 }, connections: connections.map(targetId => ({ targetId, type: 'sequence' })) });
  return resolveGraph({ rows: [{ id: 0, name: 'Main' }], nodes: [
    node('movie', 'work', 'film', ['middle']),
    node('middle', 'event', 'film', ['selected']),
    node('selected', 'event', 'film', ['other-movie', 'cycle']),
    node('cycle', 'event', 'film', ['middle']),
    node('other-movie', 'work', 'other', ['beyond']),
    node('beyond', 'event', 'film', []),
  ] });
}
test('event selection illuminates every segment to its associated work over a closer unrelated movie', () => {
  const graph = selectionGraph();
  const highlighted = selectionConnections(graph, 'selected');
  const pairs = graph.connections.filter(edge => highlighted.has(edge.id)).map(edge => [edge.sourceId, edge.targetId]);
  assert.deepEqual(pairs, [['movie', 'middle'], ['middle', 'selected']]);
  const reverse = resolveGraph({ rows: [{ id: 0, name: 'Main' }], nodes: [...graph.nodes.values()].map(({ node }) => node).reverse() });
  assert.deepEqual(selectionConnections(reverse, 'selected'), highlighted);
});
test('event selection stops at work nodes and handles cycles, missing selections and work selections', () => {
  const graph = selectionGraph();
  assert.equal(selectionConnections(graph, null).size, 0);
  assert.equal(selectionConnections(graph, 'missing').size, 0);
  assert.equal(selectionConnections(graph, 'movie').size, 0);
  // The associated film is beyond another work node; do not cross through that work.
  const highlighted = selectionConnections(graph, 'beyond');
  assert.equal(highlighted.size, 1);
  assert.ok(graph.connections.some(edge => highlighted.has(edge.id) && edge.sourceId === 'other-movie' && edge.targetId === 'beyond'));
});
test('hidden work nodes do not create selection routes across filtered-out connections', () => {
  const { filterGraph } = require(join(process.env.TIMELINE_CHECK_DIR, 'lib/filterGraph.js'));
  assert.equal(selectionConnections(filterGraph(selectionGraph(), 'event'), 'selected').size, 0);
});

test('node centers retain a minimum gap in dense columns and at the far right', () => {
  const data = structuredClone(timeline);
  const last = [...data.nodes].sort((a, b) => b.position.year - a.position.year || b.position.order - a.position.order)[0];
  for (let i = 0; i < 5; i++) data.nodes.push({ ...structuredClone(last), id: `dense-end-${i}`, connections: [] });
  const graph = resolveGraph(data);
  for (let i = 0; i < graph.layout.nodes.length; i++) {
    const a = graph.layout.nodes[i].position;
    for (const { position: b } of graph.layout.nodes.slice(i + 1))
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) >= 8, 'every pair keeps at least eight world units of clearance');
  }
  const columns = [...new Set(graph.layout.nodes.map(item => item.position[0]))].sort((a, b) => a - b);
  for (let i = 1; i < columns.length; i++) assert.ok(columns[i] - columns[i - 1] >= 9);
});

test('events occupy a lower vertical band while retaining row membership and attached connections', () => {
  const graph = resolveGraph(timeline);
  for (const { node, position } of graph.layout.nodes) {
    const rowY = graph.rows.get(node.position.row).y;
    if (node.kind === 'event') assert.ok(position[1] <= rowY - 8);
    else assert.ok(position[1] >= rowY);
  }
  for (const edge of graph.connections) {
    assert.deepEqual(edge.start, graph.nodes.get(edge.sourceId).position);
    assert.deepEqual(edge.end, graph.nodes.get(edge.targetId).position);
    assert.deepEqual(edge.points[0], edge.start);
    assert.deepEqual(edge.points.at(-1), edge.end);
  }
});

test('event-to-work connections use direct paths without rising above either endpoint', () => {
  const graph = resolveGraph(timeline);
  const mixed = graph.connections.filter(edge => graph.nodes.get(edge.sourceId).node.kind !== graph.nodes.get(edge.targetId).node.kind);
  assert.ok(mixed.length > 0);
  for (const edge of mixed) {
    assert.equal(edge.route, 'direct');
    assert.equal(edge.points.length, 3);
    assert.deepEqual(edge.points[0], edge.start);
    assert.deepEqual(edge.points.at(-1), edge.end);
    for (const point of edge.points) {
      assert.ok(point[1] >= Math.min(edge.start[1], edge.end[1]));
      assert.ok(point[1] <= Math.max(edge.start[1], edge.end[1]));
    }
    assert.equal(edge.points[1][1], (edge.start[1] + edge.end[1]) / 2);
  }
});
