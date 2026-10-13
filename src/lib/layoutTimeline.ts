import type { Connection, TimelineData, TimelineNode, TimelineRow } from '../types/timeline';
import { assertTimeline } from './validateTimeline';

export type Vec3 = [number, number, number];
export interface LayoutOptions { columnSpacing?: number; rowSpacing?: number }
export interface PositionedNode { node: TimelineNode; column: number; position: Vec3 }
export interface PositionedRow { row: TimelineRow; y: number }
export interface PositionedConnection extends Connection {
  id: string;
  sourceId: string;
  start: Vec3;
  end: Vec3;
}
export interface TimelineLayout {
  nodes: PositionedNode[];
  rows: PositionedRow[];
  connections: PositionedConnection[];
  bounds: { min: Vec3; max: Vec3 };
}

/** Pure layout: no Three.js, React, camera, styling or mutation of source data. */
export function layoutTimeline(data: TimelineData, options: LayoutOptions = {}): TimelineLayout {
  assertTimeline(data);
  const { columnSpacing = 6, rowSpacing = 8 } = options;
  if (![columnSpacing, rowSpacing].every(value => Number.isFinite(value) && value > 0))
    throw new Error('Layout spacing must be positive and finite');
  const key = (year: number, order: number) => `${year}:${order}`;
  const slots = [...new Map(data.nodes.map(node => [key(node.position.year, node.position.order), node.position])).values()]
    .sort((a, b) => a.year - b.year || a.order - b.order);
  const columns = new Map(slots.map((slot, i) => [key(slot.year, slot.order), i]));
  const rows: PositionedRow[] = [...data.rows].sort((a, b) => a.id - b.id)
    .map((row, i) => ({ row, y: -i * rowSpacing }));
  const rowY = new Map(rows.map(item => [item.row.id, item.y]));
  const nodes: PositionedNode[] = data.nodes.map(node => {
    const column = columns.get(key(node.position.year, node.position.order))!;
    return { node, column, position: [column * columnSpacing, rowY.get(node.position.row)!, 0] };
  });
  const byId = new Map(nodes.map(item => [item.node.id, item]));
  const connections: PositionedConnection[] = nodes.flatMap(item => item.node.connections.map((connection, i) => ({
    ...connection,
    id: `${item.node.id}:connection:${i}`,
    sourceId: item.node.id,
    start: [...item.position] as Vec3,
    end: [...byId.get(connection.targetId)!.position] as Vec3,
  })));
  const xs = nodes.map(item => item.position[0]);
  const ys = rows.map(item => item.y);
  return { nodes, rows, connections, bounds: {
    min: [xs.length ? Math.min(...xs) : 0, Math.min(...ys), 0],
    max: [xs.length ? Math.max(...xs) : 0, Math.max(...ys), 0],
  } };
}
