import type { NodeKind } from '../types/timeline';
import type { ResolvedGraph } from './timeline';

export type NodeFilter = NodeKind | 'all';

/** Filter visibility after layout so toggling kinds never moves the graph. */
export function filterGraph(graph: ResolvedGraph, kind: NodeFilter): ResolvedGraph {
  if (kind === 'all') return graph;
  const nodes = graph.layout.nodes.filter(item => item.node.kind === kind);
  const ids = new Set(nodes.map(item => item.node.id));
  return {
    ...graph,
    nodes: new Map(nodes.map(item => [item.node.id, item])),
    connections: graph.connections.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId)),
    layout: {
      ...graph.layout,
      nodes,
      connections: graph.layout.connections.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId)),
    },
  };
}
