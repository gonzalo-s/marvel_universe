import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from 'three';
import { seeded } from './presentation';

/** Seamless-in-x value noise: lattice columns wrap so spheres show no seam. */
function makeNoise(seed: number) {
  const random = seeded(seed), lattice = Array.from({ length: 64 * 64 }, () => random());
  const at = (x: number, y: number, period: number) => lattice[((((y % 64) + 64) % 64) * 64) + ((((x % period) + period) % period) % 64)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number, period: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = smooth(x - x0), ty = smooth(y - y0);
    const a = at(x0, y0, period) + (at(x0 + 1, y0, period) - at(x0, y0, period)) * tx;
    const b = at(x0, y0 + 1, period) + (at(x0 + 1, y0 + 1, period) - at(x0, y0 + 1, period)) * tx;
    return a + (b - a) * ty;
  };
  return (u: number, v: number, cells: number, octaves: number) => {
    let sum = 0, amplitude = 0.5, total = 0, frequency = cells;
    for (let o = 0; o < octaves; o++) { sum += value(u * frequency, v * frequency, frequency) * amplitude; total += amplitude; amplitude *= 0.5; frequency *= 2; }
    return sum / total;
  };
}

export interface NoiseOptions { seed: number; palette: string[]; size?: number; cells?: number; octaves?: number; alpha?: boolean; bands?: number; contrast?: number; fade?: boolean }

/** Procedural nebula / planet-surface texture. `alpha` fades to transparent at the edges for volumetric planes. */
export function noiseTexture({ seed, palette, size = 256, cells = 3, octaves = 5, alpha = false, bands = 0, contrast = 1.4, fade = true }: NoiseOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!, image = ctx.createImageData(size, size), noise = makeNoise(seed);
  const colors = palette.map(c => new Color(c)), mixed = new Color();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    let n = noise(u, v, cells, octaves);
    if (bands) n += Math.sin(v * Math.PI * bands + n * 5) * 0.12;
    n = Math.max(0, Math.min(1, (n - 0.5) * contrast + 0.5));
    const scaled = n * (colors.length - 1), i = Math.min(colors.length - 2, Math.floor(scaled));
    mixed.copy(colors[i]).lerp(colors[i + 1], scaled - i);
    const radial = alpha && fade ? Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) * 2) : 1;
    const a = alpha ? Math.pow(radial, 1.3) * Math.max(0, Math.min(1, (n - 0.25) * 1.8)) : 1;
    const k = (y * size + x) * 4;
    image.data[k] = mixed.r * 255; image.data[k + 1] = mixed.g * 255; image.data[k + 2] = mixed.b * 255; image.data[k + 3] = a * 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace; texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

let surface: CanvasTexture | undefined;
/** One shared mineral/cloud surface for every node body; tinted per node by material color. */
export function sharedSurfaceTexture() {
  return surface ??= noiseTexture({ seed: 900, palette: ['#4a4a52', '#9a9aa8', '#f2f2ff'], size: 256, cells: 4, octaves: 6, bands: 4, contrast: 1.6 });
}

let cloud: CanvasTexture | undefined, haze: CanvasTexture | undefined;
/** Wrapping cloud layer for rotating atmosphere shells. */
export function sharedCloudTexture() {
  return cloud ??= noiseTexture({ seed: 910, palette: ['#ffffff', '#ffffff'], size: 256, cells: 4, octaves: 5, alpha: true, fade: false, contrast: 1.8 });
}
/** Soft radial haze for fog around nodes. */
export function sharedHazeTexture() {
  return haze ??= noiseTexture({ seed: 920, palette: ['#ffffff', '#ffffff'], size: 128, cells: 2, octaves: 4, alpha: true, contrast: 1.2 });
}

/** Additive spiral-galaxy sprite: dotted arms around a warm core. */
export function galaxyTexture(seed: number, arms = 2, tint = '#8fa6ff') {
  const size = 512, canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!, random = seeded(seed), color = new Color(tint);
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.16);
  core.addColorStop(0, 'rgba(255,236,200,0.95)'); core.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = core; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {
    const r = Math.pow(random(), 0.7) * size * 0.46, arm = Math.floor(random() * arms);
    const angle = (arm / arms) * Math.PI * 2 + r * 0.018 + (random() - 0.5) * (0.5 + r / size);
    const x = size / 2 + Math.cos(angle) * r, y = size / 2 + Math.sin(angle) * r * 0.9;
    ctx.fillStyle = `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},${0.05 + random() * 0.18})`;
    ctx.beginPath(); ctx.arc(x, y, 0.6 + random() * 1.6, 0, Math.PI * 2); ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
