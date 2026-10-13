'use client';

import { Html } from '@react-three/drei';
import type { RefObject } from 'react';
import { NodeMarker } from '@/components/atoms/node-marker';
import { NodeBody } from './node-body';
import { useSceneActivity } from '@/hooks/scene-activity';
import { TitleArtwork } from './title-artwork';
import { storyTime } from '@/lib/timeline';
import { resolveNodeVisuals } from '@/lib/nodeVisuals';
import { presentation } from '@/lib/presentation';
import type { PositionedNode } from '@/lib/layoutTimeline';

export function TimelineNodeView({ item, selected, showLabel, onSelect, zoom, portal, reducedMotion }: {
  item: PositionedNode; selected: boolean; showLabel: boolean; onSelect: (id: string) => void; zoom: number; portal: RefObject<HTMLDivElement>; reducedMotion: boolean;
}) {
  const { node } = item;
  const { hover } = useSceneActivity();
  const { primary } = resolveNodeVisuals(node);
  const compact = node.kind === 'event';
  const scale = Math.min(1, Math.max(0.35, zoom / 0.8)) * (compact ? 0.65 : 1);
  return <NodeBody item={item} selected={selected} zoom={zoom} reducedMotion={reducedMotion}>
    <Html portal={portal} center position={[0, 0, 0.2]} zIndexRange={[20, 10]}>
      <NodeMarker label={`${node.title}. ${storyTime(node)}`} selected={selected} color={primary} scale={scale} onClick={() => onSelect(node.id)}
        onHover={on => hover(node.id, on)} />
    </Html>
    {(selected || (compact ? zoom >= presentation.labels.eventZoom : showLabel || zoom >= presentation.labels.titleZoom)) && <Html portal={portal} center position={[0, 0, 0.2]} className="event-label" zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`event-label-card ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`} style={{ transform: `translateX(-50%) scale(${selected ? 1 : scale})`, transformOrigin: 'top center', top: selected ? 30 : 30 * scale }}>
        <TitleArtwork node={node} /><small>{node.kind === 'work' ? 'Obra' : 'Evento'} · {node.position.year}</small>
      </div>
    </Html>}
  </NodeBody>;
}
