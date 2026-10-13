'use client';

import dynamic from 'next/dynamic';
import { sceneSettings } from '@/types/scene-settings';
import { useTimelineExplorer } from '@/hooks/use-timeline-explorer';
import { EventPanel } from '@/components/organisms/event-panel';
import { ExplorerHeader } from '@/components/organisms/explorer-header';
import { ExplorerToolbar } from '@/components/organisms/explorer-toolbar';
import { ExplorerFooter } from '@/components/organisms/explorer-footer';
import { Minimap } from '@/components/organisms/minimap';
import { TimelineFallback } from '@/components/organisms/timeline-fallback';
import { TimelineLayout } from './timeline-layout';
import type { TimelineData } from '@/types/timeline';

const TimelineScene = dynamic(() => import('@/components/organisms/timeline-scene/timeline-scene'), {
  ssr: false, loading: () => <p className="scene-status">Cargando mapa…</p>,
});

export default function TimelineExplorer({ data }: { data: TimelineData }) {
  const { graph, fullGraph, selectedId, zoom, query, results, rowId, kindFilter, scene, scroller, navigation, scrolling, reducedMotion,
    reset, jumpTo, select, selectSearch, changeRow, changeKind, setQuery, closeSelection, startDrag, moveDrag, endDrag, cancelDrag, scroll } = useTimelineExplorer(data);
  return <TimelineLayout
    header={<ExplorerHeader zoom={zoom} onReset={reset} />}
    toolbar={<ExplorerToolbar graph={graph} query={query} results={results} kindFilter={kindFilter} rowId={rowId}
      onQueryChange={setQuery} onSelectSearch={selectSearch} onKindChange={changeKind} onRowChange={changeRow} />}
    scene={<section className="scene" aria-label="Mapa de eventos">
      <div className="scene-window" ref={scene} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={cancelDrag}>
        {graph.nodes.size === 0 && <p className="filter-empty" role="status">No hay nodos de este tipo.</p>}
        <TimelineScene settings={sceneSettings} graph={graph} selectedId={selectedId} onSelect={select} navigation={navigation} zoom={zoom} reducedMotion={reducedMotion}
          fallback={<TimelineFallback graph={graph} onSelect={select} />} />
      </div>
      <Minimap graph={graph} navigation={navigation} zoom={zoom} scene={scene} selectedId={selectedId} onJump={jumpTo} />
      <div ref={scroller} className="timeline-scrollbar" tabIndex={0} role="region" aria-label="Desplazamiento horizontal del mapa" onScroll={event => scroll(event.currentTarget.scrollLeft)}>
        <div style={{ width: scrolling.contentWidth, height: 1 }} />
      </div>
    </section>}
    panel={<EventPanel node={selectedId ? graph.nodes.get(selectedId)?.node : undefined} graph={graph} onClose={closeSelection} onSelect={select} onOverview={reset} />}
    footer={<ExplorerFooter visibleCount={graph.nodes.size} totalCount={fullGraph.nodes.size} />}
  />;
}
