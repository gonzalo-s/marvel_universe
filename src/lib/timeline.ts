import { layoutTimeline, type Vec3 } from './layoutTimeline';
import { assertTimeline } from './validateTimeline';
import { routeConnections } from './routeConnections';
import type { ConnectionType, TimelineData, TimelineNode } from '../types/timeline';

export const edgeStyles: Record<ConnectionType, { color: string; dashed: boolean }> = {
  sequence: { color: '#9fb9db', dashed: false },
  branch: { color: '#f4b860', dashed: false },
  transition: { color: '#bba5ff', dashed: true },
};
export const edgeNames: Record<ConnectionType, string> = {
  sequence: 'Secuencia', branch: 'Bifurcación', transition: 'Transición',
};

/** Rendering decisions live here, never in the editable content. */
export function resolveGraph(data: TimelineData) {
  assertTimeline(data);
  // Separate work/event bands within each narrative row, reserving clearance
  // for the largest stacks so events never spill into the next row's works.
  const occupancy = new Map<string, number>();
  let maxWorks = 1, maxEvents = 1;
  for (const node of data.nodes) {
    const key = `${node.position.year}:${node.position.order}:${node.position.row}:${node.kind}`;
    const count = (occupancy.get(key) ?? 0) + 1;
    occupancy.set(key, count);
    if (node.kind === 'work') maxWorks = Math.max(maxWorks, count);
    else maxEvents = Math.max(maxEvents, count);
  }
  const stackSpacing = 8;
  const eventOffset = 8;
  const rowSpacing = (maxWorks - 1) * stackSpacing + eventOffset + (maxEvents - 1) * stackSpacing + 12;
  const layout = layoutTimeline(data, { columnSpacing: 12, rowSpacing });
  const nodes = new Map(layout.nodes.map(item => [item.node.id, item]));
  const rows = new Map(layout.rows.map(item => [item.row.id, item]));
  const cells = new Map<string, typeof layout.nodes>();
  for (const item of layout.nodes) {
    const key = `${item.column}:${item.node.position.row}:${item.node.kind}`;
    cells.set(key, [...(cells.get(key) ?? []), item]);
  }
  // Works stack upward from the row; events stack downward below it.
  for (const items of cells.values()) {
    items.sort((a, b) => a.node.id.localeCompare(b.node.id));
    items.forEach((item, i) => {
      item.position[1] += item.node.kind === 'event' ? -eventOffset - i * stackSpacing : i * stackSpacing;
    });
  }
  const connections = routeConnections(layout.connections.map(edge => ({
    ...edge,
    start: [...nodes.get(edge.sourceId)!.position] as Vec3,
    end: [...nodes.get(edge.targetId)!.position] as Vec3,
  })), layout.nodes);
  const points = [...layout.nodes.map(item => item.position), ...connections.flatMap(edge => edge.points)];
  // World padding for row headings, stacked events and node radii. Camera also
  // reserves screen space for the fixed-size DOM labels.
  const bounds = {
    minX: Math.min(layout.bounds.min[0], ...points.map(p => p[0])) - 3,
    maxX: Math.max(layout.bounds.max[0], ...points.map(p => p[0])) + 3,
    minY: Math.min(layout.bounds.min[1], ...points.map(p => p[1])) - 3,
    maxY: Math.max(layout.bounds.max[1], ...points.map(p => p[1])) + 3,
    maxZ: 0,
  };
  return { layout, nodes, rows, connections, bounds };
}
export type ResolvedGraph = ReturnType<typeof resolveGraph>;
export function storyTime(node: TimelineNode) {
  if (node.kind === 'work') return `Historia: ${node.storyPeriod ?? node.position.year}`;
  return `Ancla visual: ${node.position.year}`;
}
