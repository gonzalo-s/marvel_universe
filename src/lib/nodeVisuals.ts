import type { TimelineNode } from '@/types/timeline';

const fallback = { work: { primary: '#7dd3fc', accent: '#9fe3ff' }, event: { primary: '#f4b860', accent: '#ffd9a0' } } as const;

/** Single place for theme inheritance and missing-theme fallbacks. */
export function resolveNodeVisuals(node: TimelineNode) {
  const base = fallback[node.kind];
  return { primary: node.theme?.primary ?? base.primary, accent: node.theme?.accent ?? node.theme?.primary ?? base.accent };
}
