import { hash01 } from './presentation';
import type { PositionedConnection, PositionedNode, Vec3 } from './layoutTimeline';

export interface RoutedConnection extends PositionedConnection {
  route: 'local' | 'channel' | 'direct';
  points: Vec3[];
  channel?: number;
}

/** Generic routing, independent of connection direction and editorial IDs. */
export function routeConnections(edges: PositionedConnection[], nodes: PositionedNode[]): RoutedConnection[] {
  const columns = [...new Set(nodes.map(item => item.position[0]))].sort((a, b) => a - b);
  const spacing = columns.length > 1 ? Math.min(...columns.slice(1).map((x, i) => x - columns[i])) : 6;
  const kinds = new Map(nodes.map(item => [item.node.id, item.node.kind]));
  const isDirect = (edge: PositionedConnection) => kinds.get(edge.sourceId) !== kinds.get(edge.targetId);
  const pairCounts = new Map<string, number>();
  const pair = (edge: PositionedConnection) => JSON.stringify([edge.sourceId, edge.targetId].sort());
  edges.forEach(edge => pairCounts.set(pair(edge), (pairCounts.get(pair(edge)) ?? 0) + 1));
  const isLocal = (edge: PositionedConnection) =>
    edge.start[1] === edge.end[1] && edge.start[0] !== edge.end[0] &&
    pairCounts.get(pair(edge)) === 1 &&
    !nodes.some(item => item.position[1] === edge.start[1] &&
      item.position[0] > Math.min(edge.start[0], edge.end[0]) &&
      item.position[0] < Math.max(edge.start[0], edge.end[0]));
  const routed = edges.filter(edge => !isDirect(edge) && !isLocal(edge));

  // Give every vertical leg a distinct port inside a column gutter. Shared
  // destinations and neighboring source columns therefore do not share a line.
  const gutters = new Map<number, { key: string; center: number }[]>();
  const portKey = (edge: PositionedConnection, side: string) => `${edge.id}:${side}`;
  for (const edge of routed) {
    const direction = edge.end[0] >= edge.start[0] ? 1 : -1;
    for (const [side, point, sign] of [['start', edge.start, direction], ['end', edge.end, -direction]] as const) {
      const center = point[0] + sign * spacing / 2;
      gutters.set(center, [...(gutters.get(center) ?? []), { key: portKey(edge, side), center }]);
    }
  }
  const ports = new Map<string, number>();
  for (const group of gutters.values()) {
    group.sort((a, b) => a.key.localeCompare(b.key));
    group.forEach((port, i) => ports.set(port.key, port.center + ((i + 1) / (group.length + 1) - 0.5) * spacing * 0.2));
  }

  // Overlapping horizontal intervals get different lanes above the higher
  // endpoint. Disjoint intervals can reuse a lane, keeping bounds compact.
  const lanes = new Map<number, { min: number; max: number }[]>();
  const paths = new Map<string, RoutedConnection>();
  const sorted = [...routed].sort((a, b) =>
    Math.min(ports.get(portKey(a, 'start'))!, ports.get(portKey(a, 'end'))!) - Math.min(ports.get(portKey(b, 'start'))!, ports.get(portKey(b, 'end'))!) ||
    Math.max(a.start[0], a.end[0]) - Math.max(b.start[0], b.end[0]) || a.id.localeCompare(b.id));
  for (const edge of sorted) {
    const startPort = ports.get(portKey(edge, 'start'))!;
    const endPort = ports.get(portKey(edge, 'end'))!;
    const min = Math.min(startPort, endPort), max = Math.max(startPort, endPort);
    const anchor = Math.max(edge.start[1], edge.end[1]);
    const baseY = Math.ceil((anchor + 3) / 0.75) * 0.75;
    let channel = 0, y = baseY;
    while (true) {
      const occupied = (lanes.get(y) ?? []).some(interval => !(max + 0.3 < interval.min || min - 0.3 > interval.max));
      const hitsNodeOrLabel = nodes.some(item => item.position[0] >= min - 2.3 && item.position[0] <= max + 2.3 &&
        y >= item.position[1] - 3.5 && y <= item.position[1] + 1.8);
      if (!occupied && !hitsNodeOrLabel) break;
      channel++; y = baseY + channel * 1.25;
    }
    lanes.set(y, [...(lanes.get(y) ?? []), { min, max }]);
    const shoulder = Math.sign(endPort - startPort) * Math.min(spacing * 0.18, Math.abs(endPort - startPort) * 0.12);
    paths.set(edge.id, { ...edge, route: 'channel', channel, points: [
      [...edge.start], [startPort, edge.start[1] + Math.min(2.4, (y - edge.start[1]) * 0.35), 0],
      [startPort + shoulder, y, 0],
      [endPort - shoulder, y + (hash01(edge.id, 'slope') - 0.5) * 0.4, 0],
      [endPort, edge.end[1] + Math.min(2.4, (y - edge.end[1]) * 0.35), 0], [...edge.end],
    ] });
  }
  return edges.map(edge => {
    if (isDirect(edge)) {
      // Connect the lower event band directly to its work, with no elevated lane.
      // A small horizontal bow separates coincident bolts without Y overshoot.
      const span = Math.abs(edge.end[0] - edge.start[0]);
      const bow = (hash01(edge.id, 'direct') - 0.5) * Math.min(1.2, span || 1.2);
      return { ...edge, route: 'direct', points: [
        [...edge.start], [(edge.start[0] + edge.end[0]) / 2 + bow, (edge.start[1] + edge.end[1]) / 2, 0], [...edge.end],
      ] } as RoutedConnection;
    }
    return paths.get(edge.id) ?? {
    ...edge, route: 'local', points: [[...edge.start], [(edge.start[0] + edge.end[0]) / 2, edge.start[1] + 0.8 + hash01(edge.id, 'bow') * 0.65, 0], [...edge.end]],
    } as RoutedConnection;
  });
}
