'use client';

import { useEffect, useState } from 'react';
import { ArtworkFetchError, getCachedArtwork, loadArtwork } from '@/services/tmdb/artwork-client';
import type { TmdbArtwork } from '@/services/tmdb/client';

type ArtworkState = { status: 'loading' } | { status: 'unavailable' } | { status: 'error' } | { status: 'ready'; artwork: TmdbArtwork };


export function useSelectedArtwork(nodeId: string) {
  const [state, setState] = useState<ArtworkState>(() => {
    const artwork = getCachedArtwork(nodeId);
    return artwork ? { status: 'ready', artwork } : { status: 'loading' };
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void loadArtwork(nodeId).then(artwork => {
      if (active) setState({ status: 'ready', artwork });
    }).catch(error => {
      if (active) setState({ status: error instanceof ArtworkFetchError && error.status === 404 ? 'unavailable' : 'error' });
    });
    return () => { active = false; };
  }, [nodeId, attempt]);
  return { state, retry: () => { setState({ status: 'loading' }); setAttempt(value => value + 1); } };
}
