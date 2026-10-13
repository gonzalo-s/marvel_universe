'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { MathUtils, PerspectiveCamera } from 'three';
import type { ResolvedGraph } from '@/lib/timeline';
import { PIXELS_PER_UNIT } from '@/lib/camera';
import { presentation, smoothstep } from '@/lib/presentation';

import { useSceneSettings } from '@/hooks/scene-settings';
import type { Navigation } from '@/types/navigation';
export function CameraRig({ navigation, zoom, reducedMotion }: {
  graph: ResolvedGraph; navigation: RefObject<Navigation>; zoom: number; reducedMotion: boolean;
}) {
  const settings = useSceneSettings();
  const { size } = useThree();
  const revision = useRef(-1);
  const drift = useRef({ x: 0, y: 0 });
  useFrame(({ camera, pointer }, delta) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const { targetX, targetY, revision: nextRevision } = navigation.current;
    const instant = reducedMotion || revision.current !== nextRevision;
    const scale = PIXELS_PER_UNIT * zoom;
    const distance = size.height / (2 * Math.tan(MathUtils.degToRad(presentation.fov) / 2) * scale);
    const amount = reducedMotion ? 0 : settings.parallax * MathUtils.lerp(presentation.camera.driftOverview, presentation.camera.driftNear, smoothstep(0.5, presentation.camera.nearZoom, zoom));
    drift.current.x = MathUtils.damp(drift.current.x, pointer.x * amount, 3, delta);
    drift.current.y = MathUtils.damp(drift.current.y, pointer.y * amount, 3, delta);
    camera.position.set(
      (instant ? targetX : MathUtils.damp(camera.position.x - drift.current.x, targetX, 14, delta)) + drift.current.x,
      (instant ? targetY : MathUtils.damp(camera.position.y - drift.current.y, targetY, 14, delta)) + drift.current.y,
      distance,
    );
    revision.current = nextRevision;
    camera.fov = presentation.fov;
    camera.aspect = size.width / size.height;
    camera.near = Math.max(0.5, distance * 0.05);
    camera.far = distance + presentation.far;
    camera.updateProjectionMatrix();
  });
  return null;
}
