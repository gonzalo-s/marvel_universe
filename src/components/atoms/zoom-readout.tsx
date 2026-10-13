export function ZoomReadout({ zoom }: { zoom: number }) {
  return <output id="timeline-zoom" data-zoom={zoom} aria-label="Zoom del mapa" className="zoom-readout">{Math.round(zoom * 100)}%</output>;
}
