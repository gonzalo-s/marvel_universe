import type { ResolvedGraph } from './timeline';

/** Follow existing connections through events, stopping at work nodes.
 * Prefer the selected event's associated work; otherwise use the nearest work.
 * Undirected traversal supports movies preceding or following an event.
 */
export function selectionConnections(graph: ResolvedGraph, selectedId: string | null): Set<string> {
  const selected = selectedId ? graph.nodes.get(selectedId)?.node : undefined;
  if (!selected || selected.kind !== 'event') return new Set();
  const adjacent = new Map<string, { nodeId: string; edgeId: string }[]>();
  for (const edge of [...graph.connections].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const [from, to] of [[edge.sourceId, edge.targetId], [edge.targetId, edge.sourceId]]) {
      const links = adjacent.get(from) ?? [];
      links.push({ nodeId: to, edgeId: edge.id });
      adjacent.set(from, links);
    }
  }
  const visited = new Set([selected.id]);
  const queue = [{ nodeId: selected.id, path: [] as string[] }];
  let nearest: string[] | undefined;
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    for (const link of adjacent.get(current.nodeId) ?? []) {
      if (visited.has(link.nodeId)) continue;
      visited.add(link.nodeId);
      const node = graph.nodes.get(link.nodeId)?.node;
      if (!node) continue;
      const path = [...current.path, link.edgeId];
      if (node.kind === 'work') {
        nearest ??= path;
        if (selected.workId && node.workId === selected.workId) return new Set(path);
      } else queue.push({ nodeId: node.id, path });
    }
  }
  return new Set(nearest ?? []);
}
