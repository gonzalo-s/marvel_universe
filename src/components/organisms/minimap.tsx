'use client';

import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { PIXELS_PER_UNIT } from '@/lib/camera';
import { resolveNodeVisuals } from '@/lib/nodeVisuals';
import { edgeStyles, type ResolvedGraph } from '@/lib/timeline';
import type { Navigation } from '@/types/navigation';

/** Whole-graph overview; the viewport rectangle is derived from the live camera target. */
export function Minimap({ graph, navigation, zoom, scene, selectedId, onJump }: {
  graph: ResolvedGraph; navigation: RefObject<Navigation>; zoom: number; scene: RefObject<HTMLDivElement | null>; selectedId: string | null; onJump: (x: number, y: number) => void;
}) {
  const frame = useRef<SVGRectElement>(null);
  const { minX, maxX, minY, maxY } = graph.bounds;
  const width = maxX - minX, height = maxY - minY;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = scene.current, rect = frame.current;
      if (el && rect) {
        const scale = PIXELS_PER_UNIT * zoom, w = el.clientWidth / scale, h = el.clientHeight / scale;
        rect.setAttribute('x', String(navigation.current.targetX - w / 2 - minX));
        rect.setAttribute('y', String(maxY - navigation.current.targetY - h / 2));
        rect.setAttribute('width', String(w)); rect.setAttribute('height', String(h));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [navigation, scene, zoom, minX, maxY]);
  const jump = (event: PointerEvent<SVGSVGElement>) => {
    if (event.type === 'pointermove' && event.buttons !== 1) return;
    const box = event.currentTarget.getBoundingClientRect();
    onJump(minX + ((event.clientX - box.left) / box.width) * width, maxY - ((event.clientY - box.top) / box.height) * height);
  };
  return <div className="minimap" role="group" aria-label="Minimapa">
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" onPointerDown={jump} onPointerMove={jump}>
      {graph.connections.map(edge => <line key={edge.id} x1={edge.start[0] - minX} y1={maxY - edge.start[1]} x2={edge.end[0] - minX} y2={maxY - edge.end[1]}
        stroke={edgeStyles[edge.type].color} strokeOpacity={0.45} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />)}
      {graph.layout.nodes.map(item => <rect key={item.node.id} x={item.position[0] - minX - 0.9} y={maxY - item.position[1] - 0.9} width={1.8} height={1.8}
        fill={item.node.id === selectedId ? '#ffffff' : resolveNodeVisuals(item.node).primary} />)}
      <rect ref={frame} className="minimap-frame" fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  </div>;
}
