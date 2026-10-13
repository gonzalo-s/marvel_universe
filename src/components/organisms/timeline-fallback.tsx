import { Button } from '@/components/atoms/button';
import { edgeNames, storyTime, type ResolvedGraph } from '@/lib/timeline';

export function TimelineFallback({ graph, onSelect }: { graph: ResolvedGraph; onSelect: (id: string) => void }) {
  return <div className="html-fallback"><h2>Vista de eventos</h2><p>WebGL no está disponible.</p>
    {graph.layout.rows.map(({ row }) => <section key={row.id}><h3>{row.name}</h3><p>{row.description}</p><ul>
      {[...graph.nodes.values()].filter(item => item.node.position.row === row.id).map(({ node }) => <li key={node.id}><Button onClick={() => onSelect(node.id)}>{node.title}<small>{storyTime(node)}</small></Button></li>)}
    </ul></section>)}
    <h3>Conexiones</h3><ul>{graph.connections.map(edge => <li key={edge.id}>{graph.nodes.get(edge.sourceId)!.node.title} → {graph.nodes.get(edge.targetId)!.node.title}<small>{edgeNames[edge.type]} · {edge.label}</small></li>)}</ul>
  </div>;
}
