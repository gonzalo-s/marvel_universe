/** Visual tuning only. Timeline data never reads from this file. */
export const presentation = {
  fov: 38,
  far: 900,
  depthRange: 2.4,
  eventDepth: -5,
  camera: { driftOverview: 0.25, driftNear: 0.7, nearZoom: 1.2 },
  light: { key: 3.2, fill: 0.35, ambient: 0.18, keyColor: '#fff1dc', fillColor: '#6f8cff' },
  bloom: { threshold: 1, intensity: 0.8, radius: 0.7 },
  exposure: 0.95,
  scenery: { showZoom: 0.45, fullZoom: 0.9 },
  labels: { titleZoom: 0.45, eventZoom: 1 },
  tiers: {
    high: { dpr: [1, 1.75] as [number, number], stars: 2600, dust: 420, nebulae: 8, texture: 512, fog: 5, planets: 6, debris: 240, islands: 70, galaxies: 2, multisampling: 4 },
    low: { dpr: [1, 1.25] as [number, number], stars: 900, dust: 120, nebulae: 5, texture: 256, fog: 3, planets: 3, debris: 80, islands: 28, galaxies: 1, multisampling: 0 },
  },
};
export type QualityTier = keyof typeof presentation.tiers;

/** Events sit deeper in the scene than works, so they read as background beats of the story. */
export const depthOf = (id: string, kind: 'work' | 'event' = 'work', depth = 1) =>
  -depth * (kind === 'event' ? 6 + Math.floor(hash01(id, 'depth') * 4) * 2 : Math.floor(hash01(id, 'depth') * 4) * 1.2);

export function hashString(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function hash01(id: string, salt = '') { return hashString(`${id}|${salt}`) / 4294967295; }
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const smoothstep = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
