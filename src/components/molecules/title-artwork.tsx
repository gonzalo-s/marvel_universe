'use client';

import { MediaImage } from '@/components/atoms/media-image';
import { useTitleArtwork } from '@/hooks/use-title-artwork';
import type { TimelineNode } from '@/types/timeline';

/** Fetch only work logos near the viewport; events retain their descriptive text. */
export function TitleArtwork({ node }: { node: TimelineNode }) {
  const { element, logo, showLogo, loaded, markLoaded, markFailed } = useTitleArtwork(node);
  return <span ref={element} className="timeline-title">
    {showLogo && <MediaImage variant="title" src={logo!} alt={node.title}
      className={`timeline-title-artwork ${loaded ? '' : 'is-loading'}`} onLoad={markLoaded} onError={markFailed} />}
    {(!showLogo || !loaded) && node.title}
  </span>;
}
