import { Button } from '@/components/atoms/button';
import { ZoomReadout } from '@/components/atoms/zoom-readout';

export function ExplorerHeader({ zoom, onReset }: { zoom: number; onReset: () => void }) {
  return <header className="explorer-header"><div><p className="eyebrow">Marvel · Explorador temporal · Contiene spoilers</p><h1>Marvel · Mapa de eventos</h1></div>
    <div className="view-controls" aria-label="Controles de vista"><ZoomReadout zoom={zoom} /><Button onClick={onReset}>Restablecer</Button></div>
  </header>;
}
