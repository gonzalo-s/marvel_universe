'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { Vector3 } from 'three';
import { depthOf } from '@/lib/presentation';
import { placeTitleLabels, type TitleLabel } from '@/lib/titleLabels';
import { useSceneActivity } from '@/hooks/scene-activity';
import { useSceneSettings } from '@/hooks/scene-settings';
import type { ResolvedGraph } from '@/lib/timeline';

/** Read all label sizes before writing styles; no React state updates per frame. */
export function TitleLabelLayout({ graph, portal }: { graph: ResolvedGraph; portal: RefObject<HTMLDivElement> }) {
  const { hovered } = useSceneActivity();
  const settings = useSceneSettings();
  const point = useRef(new Vector3());
  useFrame(({ camera, size }) => {
    if (!portal.current) return;
    camera.updateMatrixWorld();
    const elements = [...portal.current.querySelectorAll<HTMLElement>('.event-label-card[data-work-label]')];
    const labels: TitleLabel[] = [];
    for (const element of elements) {
      const item = graph.nodes.get(element.dataset.workLabel!);
      if (!item) continue;
      point.current.set(item.position[0], item.position[1], depthOf(item.node.id, item.node.kind, settings.depth) + .2).project(camera);
      const scale = Number(element.dataset.labelScale);
      labels.push({ id: item.node.id, x: (point.current.x + 1) * size.width / 2, y: (1 - point.current.y) * size.height / 2,
        width: element.offsetWidth * scale, height: element.offsetHeight * scale, selected: element.classList.contains('selected'), hovered: hovered() === item.node.id });
    }
    const reserved = [...portal.current.querySelectorAll<HTMLElement>('.event-label-card.compact.selected')].map(element => {
      const rect = element.getBoundingClientRect(), root = portal.current.getBoundingClientRect();
      return { left: rect.left - root.left, right: rect.right - root.left, top: rect.top - root.top, bottom: rect.bottom - root.top };
    });
    const minimap = portal.current.closest('.scene')?.querySelector('.minimap');
    if (minimap) {
      const rect = minimap.getBoundingClientRect(), root = portal.current.getBoundingClientRect();
      if (rect.width && rect.height) reserved.push({ left: rect.left - root.left, right: rect.right - root.left, top: rect.top - root.top, bottom: rect.bottom - root.top });
    }
    const placements = placeTitleLabels(labels, size.width, size.height, reserved);
    for (const element of elements) {
      const placement = placements.get(element.dataset.workLabel!);
      if (!placement) continue;
      const visibility = placement.visible ? 'visible' : 'hidden', top = `${placement.offset}px`, left = `${placement.xOffset}px`;
      if (element.style.visibility !== visibility) element.style.visibility = visibility;
      if (element.style.top !== top) element.style.top = top;
      if (element.style.left !== left) element.style.left = left;
      element.classList.toggle('is-staggered', placement.visible && placement.offset !== 30);
      const scale = Number(element.dataset.labelScale), label = labels.find(item => item.id === element.dataset.workLabel)!;
      element.dataset.labelSide = placement.offset < 0 ? 'above' : 'below';
      const length = placement.offset < 0 ? Math.max(0, -20 - placement.offset - label.height) : Math.max(0, placement.offset - 20);
      const leader = `${length / scale}px`;
      const leaderX = `${-placement.xOffset / scale}px`;
      if (element.style.getPropertyValue('--title-leader-x') !== leaderX) element.style.setProperty('--title-leader-x', leaderX);
      if (element.style.getPropertyValue('--title-leader-length') !== leader) element.style.setProperty('--title-leader-length', leader);
    }
  });
  return null;
}
