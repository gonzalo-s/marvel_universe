import type { MouseEventHandler } from 'react';
import { SearchControl } from '@/components/molecules/search-control';
import { SelectControl } from '@/components/molecules/select-control';
import type { NodeFilter } from '@/lib/filterGraph';
import type { ResolvedGraph } from '@/lib/timeline';
import type { TimelineNode } from '@/types/timeline';

export function ExplorerToolbar({ graph, query, results, kindFilter, rowId, onQueryChange, onSelectSearch, onKindChange, onRowChange }: {
  graph: ResolvedGraph; query: string; results: TimelineNode[]; kindFilter: NodeFilter; rowId: number;
  onQueryChange: (query: string) => void; onSelectSearch: MouseEventHandler<HTMLButtonElement>;
  onKindChange: (kind: NodeFilter) => void; onRowChange: (id: number) => void;
}) {
  return <div className="search-bar">
    <SearchControl query={query} results={results} onQueryChange={onQueryChange} onSelect={onSelectSearch} />
    <SelectControl id="timeline-kind" label="Mostrar" value={kindFilter} onChange={value => onKindChange(value as NodeFilter)} options={[
      { value: 'all', label: 'Ambos' }, { value: 'work', label: 'Películas / obras' }, { value: 'event', label: 'Eventos' },
    ]} />
    <SelectControl id="timeline-row" label="Fila" value={rowId} onChange={value => onRowChange(Number(value))} options={graph.layout.rows.map(({ row }) => ({
      value: row.id, label: row.name, disabled: !graph.layout.nodes.some(item => item.node.position.row === row.id),
    }))} />
  </div>;
}
