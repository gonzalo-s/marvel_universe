export interface TitleLabel {
  id: string; x: number; y: number; width: number; height: number; selected: boolean; hovered?: boolean; preferredOffset?: number;
}
export interface LabelPlacement { visible: boolean; offset: number; xOffset: number }
interface Rect { left: number; right: number; top: number; bottom: number }

/** Artwork grows in screen pixels as the scene zooms out, with a bounded overview size. */
export function titleArtworkScale(zoom: number) { return 1 + Math.min(.35, Math.max(0, 1 - zoom) * .5); }
const overlaps = (a: Rect, b: Rect, gap = 12) => a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;

/** Prefer nearby staggered slots; never shrink artwork to squeeze in more labels. */
export function placeTitleLabels(labels: TitleLabel[], width: number, height: number, reserved: Rect[] = []): Map<string, LabelPlacement> {
  const placed = [...reserved], result = new Map<string, LabelPlacement>();
  const ordered = [...labels].sort((a, b) => Number(b.selected) - Number(a.selected) || Number(!!b.hovered) - Number(!!a.hovered) || Math.abs(a.x - width / 2) - Math.abs(b.x - width / 2) || a.id.localeCompare(b.id));
  for (const label of ordered) {
    if (label.x < 0 || label.x > width || label.width > width - 16) {
      result.set(label.id, { visible: false, offset: 30, xOffset: 0 }); continue;
    }
    const x = Math.max(label.width / 2 + 8, Math.min(width - label.width / 2 - 8, label.x));
    const offsets = [30, -label.height - 30];
    if (label.preferredOffset !== undefined) offsets.unshift(label.preferredOffset);
    for (let row = 1; row <= 3; row++) offsets.push(30 + row * (label.height + 14), -label.height - 30 - row * (label.height + 14));
    if (label.height <= height - 16) {
      const clamp = (offset: number) => Math.max(8 - label.y, Math.min(offset, height - 8 - label.height - label.y));
      offsets.push(clamp(30), clamp(-label.height - 30));
    }
    const candidates = offsets.map(offset => ({ offset, rect: {
      left: x - label.width / 2, right: x + label.width / 2,
      top: label.y + offset, bottom: label.y + offset + label.height,
    } }));
    const inside = (r: Rect) => r.left >= 8 && r.right <= width - 8 && r.top >= 8 && r.bottom <= height - 8;
    const slot = candidates.find(({ rect }) => inside(rect) && !placed.some(other => overlaps(rect, other)));
    if (slot) { placed.push(slot.rect); result.set(label.id, { visible: true, offset: slot.offset, xOffset: x - label.x }); }
    else result.set(label.id, { visible: false, offset: 30, xOffset: 0 });
  }
  return result;
}
