'use client';

import { Button } from '@/components/atoms/button';

import { edgeNames, storyTime, type ResolvedGraph } from '@/lib/timeline';
import { SelectedArtwork } from '@/components/molecules/selected-artwork';
import type { TimelineNode } from '@/types/timeline';

export function EventPanel({ node, graph, onClose, onSelect, onOverview }: {
  node: TimelineNode | undefined; graph: ResolvedGraph; onClose: () => void; onSelect: (id: string) => void; onOverview: () => void;
}) {
  if (!node) return <aside className="event-panel" aria-label="Detalle del evento"><h2>Explorá los eventos</h2><p>Seleccioná un punto o buscá un evento para ver sus detalles.</p><p>Usá la rueda del mouse o arrastrá para recorrer el mapa hacia los lados. Usá Ctrl + rueda para ajustar el zoom y elegí una fila para explorar otros contextos.</p><p className="muted">Las columnas y los años son referencias visuales. Consultá las descripciones para fechas aproximadas y eventos fuera del tiempo.</p><p>{graph.nodes.size} nodos · {graph.connections.length} conexiones · {graph.rows.size} filas</p></aside>;
  const row = graph.rows.get(node.position.row)!.row;
  const outgoing = graph.connections.filter(edge => edge.sourceId === node.id);
  const incoming = graph.connections.filter(edge => edge.targetId === node.id);
  const related = node.workId ? [...graph.nodes.values()].filter(item => item.node.workId === node.workId && item.node.id !== node.id) : [];
  return <aside className="event-panel" aria-label="Detalle del evento" onWheel={e => e.stopPropagation()}>
    <Button className="close-button" onClick={onClose} aria-label="Cerrar detalle">×</Button>
    <div aria-live="polite">
      <p className="eyebrow">{node.kind === 'work' ? 'Obra seleccionada' : 'Evento seleccionado'}</p><h2>{node.title}</h2>
      <SelectedArtwork key={node.id} nodeId={node.id} />
      <p className="time-tag">{storyTime(node)}</p><p className="muted">{row.name}</p><p>{row.description}</p><p>{node.description}</p>
      {node.workId && <div className="work"><strong>Obra: {node.workId}</strong>{node.releaseYear !== undefined && <span>Año de estreno: {node.releaseYear}</span>}</div>}
      <Button className="overview-button" onClick={onOverview}>Volver a la vista general</Button>
      {incoming.length > 0 && <><h3>Conexiones entrantes</h3><ul className="event-links">{incoming.map((edge, i) => <li key={i}><Button onClick={() => onSelect(edge.sourceId)}>{graph.nodes.get(edge.sourceId)!.node.title}</Button><small>{edgeNames[edge.type]}{edge.label && ` · ${edge.label}`}</small></li>)}</ul></>}
      <h3>Conexiones salientes</h3>
      {outgoing.length ? <ul className="event-links">{outgoing.map((edge, i) => <li key={i}><Button onClick={() => onSelect(edge.targetId)}>{graph.nodes.get(edge.targetId)!.node.title}</Button><small>{edgeNames[edge.type]}{edge.label && ` · ${edge.label}`}</small></li>)}</ul> : <p className="muted">Sin conexiones salientes.</p>}
      {related.length > 0 && <><h3>Más eventos de esta obra</h3><ul className="event-links">{related.map(item => <li key={item.node.id}><Button onClick={() => onSelect(item.node.id)}>{item.node.title}</Button></li>)}</ul></>}
    </div>
  </aside>;
}
