'use client';

import { useEffect, useRef, useState } from 'react';
import { getCachedArtwork, loadArtwork } from '@/services/tmdb/artwork-client';
import type { TimelineNode } from '@/types/timeline';

export function useTitleArtwork(node: TimelineNode) {
  const element = useRef<HTMLSpanElement>(null);
  const [logo, setLogo] = useState<string | null>(() => node.tmdb?.logoUrl ?? getCachedArtwork(node.id)?.logoUrl ?? null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (node.kind !== 'work' || logo || failed) return;
    let active = true;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void loadArtwork(node.id).then(artwork => { if (active) setLogo(artwork.logoUrl); }).catch(() => {});
    }, { root: element.current?.closest('.scene-window') ?? null, rootMargin: '200px' });
    if (element.current) observer.observe(element.current);
    return () => { active = false; observer.disconnect(); };
  }, [node.id, node.kind, logo, failed]);
  const showLogo = node.kind === 'work' && logo && !failed;
  return { element, logo, showLogo, loaded, markLoaded: () => setLoaded(true), markFailed: () => setFailed(true) };
}
