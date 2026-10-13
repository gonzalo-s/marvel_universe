import { Button } from './button';

export function NodeMarker({ label, selected, color, scale, onClick, onHover }: {
  label: string; selected: boolean; color: string; scale: number; onClick: () => void; onHover: (on: boolean) => void;
}) {
  return <Button className={`node-target ${selected ? 'selected' : ''}`} style={{ color, transform: `scale(${scale})` }}
    aria-label={label} aria-pressed={selected} onClick={onClick}
    onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)} onFocus={() => onHover(true)} onBlur={() => onHover(false)} />;
}
