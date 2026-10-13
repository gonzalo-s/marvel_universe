import type { ResolvedGraph } from './timeline';

export const PIXELS_PER_UNIT = 36;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 2;
export const SCROLL_PADDING = 64;

/** Fixed reading scale: graph size and viewport size never shrink the content. */
export function cameraFraming(_bounds: ResolvedGraph['bounds'], width: number, height: number, zoom: number) {
  return { left: -width / 2, right: width / 2, top: height / 2, bottom: -height / 2, zoom: PIXELS_PER_UNIT * zoom };
}
export function horizontalNavigation(bounds: ResolvedGraph['bounds'], width: number, zoom: number) {
  const scale = PIXELS_PER_UNIT * zoom;
  const contentWidth = Math.max(width, (bounds.maxX - bounds.minX) * scale + SCROLL_PADDING * 2);
  const maxScroll = contentWidth - width;
  return {
    contentWidth,
    maxScroll,
    targetAt: (offset: number) => bounds.minX + (Math.max(0, Math.min(maxScroll, offset)) + width / 2 - SCROLL_PADDING) / scale,
    offsetAt: (target: number) => Math.max(0, Math.min(maxScroll, (target - bounds.minX) * scale - width / 2 + SCROLL_PADDING)),
  };
}
