import type { MouseEventHandler } from 'react';
import { Button } from '@/components/atoms/button';
import { TextInput } from '@/components/atoms/text-input';
import type { TimelineNode } from '@/types/timeline';

export function SearchControl({ query, results, onQueryChange, onSelect }: {
  query: string; results: TimelineNode[]; onQueryChange: (query: string) => void; onSelect: MouseEventHandler<HTMLButtonElement>;
}) {
  return <>
    <label htmlFor="event-search">Buscar eventos u obras</label>
    <TextInput id="event-search" type="search" value={query} onChange={event => onQueryChange(event.target.value)} />
    {query.trim() && <ul className="search-results">{results.length
      ? results.map(node => <li key={node.id}><Button value={node.id} onClick={onSelect}>{node.title} · {node.workId ?? 'Sin obra'}</Button></li>)
      : <li>Sin resultados</li>}</ul>}
  </>;
}
