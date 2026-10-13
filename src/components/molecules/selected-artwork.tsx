'use client';

import { Button } from '@/components/atoms/button';

import { MediaImage } from '@/components/atoms/media-image';
import { useState } from 'react';
import { useSelectedArtwork } from '@/hooks/use-selected-artwork';

function ArtworkImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <MediaImage variant="poster" src={src} alt={alt} className="artwork-poster" onError={() => setFailed(true)} />;
}

/** Key this component by node ID so an old selection never flashes its images. */
export function SelectedArtwork({ nodeId }: { nodeId: string }) {
  const { state, retry } = useSelectedArtwork(nodeId);

  if (state.status === 'loading') return <p className="artwork-status" role="status">Cargando imágenes…</p>;
  if (state.status === 'unavailable') return <p className="artwork-status">No hay póster disponible para esta obra.</p>;
  if (state.status === 'error') return <div className="artwork-status"><p>No se pudieron cargar las imágenes.</p><Button onClick={retry}>Reintentar</Button></div>;
  const artwork = state.artwork;
  const hasImages = artwork.posterUrl;
  return <section className="selected-artwork" aria-label={`Imágenes de ${artwork.title}`}>
    {artwork.posterUrl && <ArtworkImage key={artwork.posterUrl} src={artwork.posterUrl} alt={`Póster de ${artwork.title}`} />}
    {!hasImages && <p className="artwork-status">No hay póster disponible para esta obra.</p>}
    <a className="artwork-source" href={`https://www.themoviedb.org/${artwork.mediaType}/${artwork.id}`} target="_blank" rel="noopener noreferrer">Imágenes: TMDB ↗</a>
  </section>;
}
