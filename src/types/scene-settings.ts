export interface SceneSettings {
  depth: number;
  fog: number;
  bloom: number;
  exposure: number;
  lighting: number;
  parallax: number;
  motion: boolean;
  quality: 'auto' | 'high' | 'low';
}
/** Fixed Claro appearance; tuning stays out of the timeline UI. */
export const sceneSettings: SceneSettings = {
  depth: 2.8, fog: 0.1, bloom: 0.2, exposure: 1.15,
  lighting: 1.1, parallax: 0.25, motion: false, quality: 'auto',
};
