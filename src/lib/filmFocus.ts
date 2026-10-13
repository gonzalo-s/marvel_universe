import type { ResolvedGraph } from './timeline';
import { MAX_ZOOM, MIN_ZOOM, PIXELS_PER_UNIT } from './camera';

/** Fit the selected film and nearby works from its own visible narrative row. */
export function filmFocus(graph: ResolvedGraph, id: string, width: number, height: number) {
  const selected = graph.nodes.get(id);
  if (!selected || selected.node.kind !== 'work') return null;
  const films = graph.layout.nodes.filter(item => item.node.kind === 'work' && item.node.position.row === selected.node.position.row)
    .sort((a, b) => a.position[0] - b.position[0] || a.node.id.localeCompare(b.node.id));
  const index = films.findIndex(item => item.node.id === id);
  const start = Math.max(0, Math.min(index - 1, films.length - 3));
  const context = films.slice(start, start + 3);
  const xs = context.map(item => item.position[0]), ys = context.map(item => item.position[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const horizontalRoom = Math.max(width * .6, width - 240);
  const verticalRoom = Math.max(height * .5, height - 220);
  const zoom = Math.min(.85, MAX_ZOOM, Math.max(MIN_ZOOM,
    horizontalRoom / (Math.max(8, maxX - minX) * PIXELS_PER_UNIT),
  ), verticalRoom / (Math.max(8, maxY - minY) * PIXELS_PER_UNIT));
  return { zoom: Math.max(MIN_ZOOM, zoom), targetX: (minX + maxX) / 2, targetY: (minY + maxY) / 2 - 1, ids: context.map(item => item.node.id) };
}
