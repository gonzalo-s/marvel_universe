import { edgeNames, edgeStyles } from '@/lib/timeline';
import type { ConnectionType } from '@/types/timeline';

const legendHint: Record<ConnectionType, string> = { sequence: 'continúa', branch: 'se separa ◆', transition: 'salto ▸' };

export function ConnectionLegend() {
  return <div className="legend" aria-label="Tipos de conexión">{(Object.keys(edgeStyles) as ConnectionType[]).map(type => {
    const style = edgeStyles[type];
    return <span key={type}><i style={{ borderColor: style.color, borderTopStyle: style.dashed ? 'dashed' : 'solid' }} />{type === 'branch' && <b className="legend-diamond" aria-hidden />}{edgeNames[type]}<small>{legendHint[type]}</small></span>;
  })}</div>;
}
