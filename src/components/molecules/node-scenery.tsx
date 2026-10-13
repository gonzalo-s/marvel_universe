'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, DodecahedronGeometry, Group, IcosahedronGeometry, MathUtils, TorusGeometry } from 'three';
import { hashString, seeded } from '@/lib/presentation';
import { sharedSurfaceTexture } from '@/lib/proceduralTextures';

const shared = {
  rock: new IcosahedronGeometry(1, 1), shard: new DodecahedronGeometry(1, 0)
};
const arcCache = new Map<number, TorusGeometry>();
const arc = (angle: number, tube: number) => {
  const key = Math.round(angle * 100) * 1000 + Math.round(tube * 1000);
  if (!arcCache.has(key)) arcCache.set(key, new TorusGeometry(2.4, tube, 8, 40, angle));
  return arcCache.get(key)!;
};
const darkMetal = { color: '#2a303d', roughness: 0.55, metalness: 0.8, envMapIntensity: 1.1, bumpScale: 2 } as const;

function Portal({ seed, accent }: { seed: number; accent: string }) {
  const random = useMemo(() => seeded(seed), [seed]);
  const parts = useMemo(() => Array.from({ length: 4 }, (_, i) => ({ angle: 0.5 + random() * 0.7, rot: i * (Math.PI / 2) + random() * 0.4 })), [random]);
  const shards = useMemo(() => Array.from({ length: 4 }, () => ({ a: random() * 6.28, r: 2.8 + random() * 1.2, y: (random() - 0.5) * 2, s: 0.1 + random() * 0.18, rot: random() * 3 })), [random]);
  const rotation = useMemo(() => { const r = seeded(seed + 43); return [1 + r() * .3, r() * .6 - .3, 0] as [number, number, number]; }, [seed]);
  return <group rotation={rotation}>
    {parts.map((p, i) => <group key={i} rotation={[0, 0, p.rot]}>
      <mesh geometry={arc(p.angle, 0.1)}><meshStandardMaterial {...darkMetal} map={sharedSurfaceTexture()} bumpMap={sharedSurfaceTexture()} /></mesh>
      <mesh geometry={arc(p.angle * 0.85, 0.014)} scale={0.94}><meshBasicMaterial color={new Color(accent).multiplyScalar(2.6)} toneMapped={false} /></mesh>
    </group>)}
    {shards.map((s, i) => <mesh key={i} geometry={shared.shard} position={[Math.cos(s.a) * s.r, Math.sin(s.a) * s.r, s.y]} scale={s.s} rotation={[s.rot, s.rot * 2, 0]}><meshStandardMaterial {...darkMetal} map={sharedSurfaceTexture()} bumpMap={sharedSurfaceTexture()} /></mesh>)}
  </group>;
}

function Islands({ seed, accent }: { seed: number; accent: string }) {
  const random = useMemo(() => seeded(seed), [seed]);
  const rocks = useMemo(() => Array.from({ length: 3 }, (_, i) => ({ pos: [(i - 1) * 2.1 + (random() - 0.5), -1.5 - random() * 0.9, (random() - 0.5) * 1.6] as const, s: 0.55 + random() * 0.55, rot: random() * 6 })), [random]);
  return <group>
    {rocks.map((r, i) => <group key={i} position={[...r.pos]} rotation={[0, r.rot, 0]}>
      <mesh geometry={shared.rock} scale={[r.s, r.s * 0.45, r.s]}><meshStandardMaterial color="#3a4050" map={sharedSurfaceTexture()} bumpMap={sharedSurfaceTexture()} bumpScale={4} roughness={0.95} metalness={0.1} flatShading /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, r.s * 0.43, 0]}><torusGeometry args={[r.s * 0.58, 0.025, 8, 32]} /><meshBasicMaterial color={new Color(accent).multiplyScalar(2)} toneMapped={false} /></mesh>
    </group>)}
  </group>;
}

/** Deterministic per-node composition: same ID always yields the same arrangement. */
export function NodeScenery({ id, accent, detail, glow, reducedMotion }: { id: string; accent: string; detail: number; glow: React.RefObject<number>; reducedMotion: boolean }) {
  const seed = hashString(id), variant = seed % 2;
  const group = useRef<Group>(null!);
  useFrame(({ clock }, delta) => {
    const g = group.current;
    const target = detail * (1 + glow.current * 0.08);
    const s = MathUtils.damp(g.scale.x, target, 6, delta);
    g.scale.setScalar(Math.max(s, 0.0001));
    g.visible = s > 0.02;
    if (!reducedMotion) { g.position.y = Math.sin(clock.elapsedTime * 0.5 + seed) * 0.12; g.rotation.y += delta * (0.05 + glow.current * 0.15); }
  });
  return <group ref={group} scale={0.0001}>
    {variant === 0 && <Portal seed={seed} accent={accent} />}
    {variant === 1 && <Islands seed={seed} accent={accent} />}
  </group>;
}

/** Large floating arrangement for the far background, reusing the node scenery shapes. */
export function BackgroundScenery({ seed, accent }: { seed: number; accent: string }) {
  const variant = seed % 2;
  return <>{variant === 0 && <Portal seed={seed} accent={accent} />}{variant === 1 && <Islands seed={seed} accent={accent} />}</>;
}
