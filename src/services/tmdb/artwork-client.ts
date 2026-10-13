'use client';

import type { TmdbArtwork } from './client';

const cache = new Map<string, TmdbArtwork>();
const pending = new Map<string, Promise<TmdbArtwork>>();
const queue: (() => void)[] = [];
let active = 0;
export class ArtworkFetchError extends Error {
  constructor(public readonly status: number) { super('Unable to load artwork.'); }
}
export const getCachedArtwork = (nodeId: string) => cache.get(nodeId);

/** Share artwork between timeline logos and the panel, with bounded concurrency. */
export function loadArtwork(nodeId: string): Promise<TmdbArtwork> {
  const cached = cache.get(nodeId);
  if (cached) return Promise.resolve(cached);
  const existing = pending.get(nodeId);
  if (existing) return existing;
  const task = new Promise<TmdbArtwork>((resolve, reject) => {
    const run = () => {
      active++;
      void fetch(`/api/tmdb/${encodeURIComponent(nodeId)}`).then(async response => {
        if (!response.ok) throw new ArtworkFetchError(response.status);
        const artwork = await response.json() as TmdbArtwork;
        cache.set(nodeId, artwork);
        resolve(artwork);
      }).catch(reject).finally(() => {
        active--; pending.delete(nodeId); queue.shift()?.();
      });
    };
    if (active < 4) run(); else queue.push(run);
  });
  pending.set(nodeId, task);
  return task;
}
