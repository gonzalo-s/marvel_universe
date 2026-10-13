'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, Color, Group, MathUtils, Mesh, MeshStandardMaterial, ShaderMaterial } from 'three';
import { depthOf, hash01, presentation, smoothstep } from '@/lib/presentation';
import { sharedCloudTexture, sharedSurfaceTexture } from '@/lib/proceduralTextures';
import { resolveNodeVisuals } from '@/lib/nodeVisuals';
import type { PositionedNode } from '@/lib/layoutTimeline';
import { NodeScenery } from './node-scenery';
import { useSceneSettings } from '@/hooks/scene-settings';
import { useSceneActivity } from '@/hooks/scene-activity';

const atmosphereVertex = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const atmosphereFragment = `uniform vec3 color; uniform float intensity; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.6); gl_FragColor = vec4(color * f * intensity, f); }`;

export const NODE_RADIUS = 0.8;

export function NodeBody({ item, selected, zoom, reducedMotion, children }: { item: PositionedNode; selected: boolean; zoom: number; reducedMotion: boolean; children?: React.ReactNode }) {
  const { node, position } = item;
  const settings = useSceneSettings();
  const { primary, accent } = resolveNodeVisuals(node);
  const { hovered } = useSceneActivity();
  const glow = useRef(0);
  const body = useRef<Mesh<BufferGeometry, MeshStandardMaterial>>(null!);
  const atmosphere = useRef<Mesh>(null!);
  const halo = useRef<Group>(null!);
  const clouds = useRef<Mesh>(null!);

  const compact = node.kind === 'event';
  const size = compact ? 0.55 : 1;
  const bodyColor = useMemo(() => new Color('#0d1018').lerp(new Color(primary), 0.4), [primary]);
  const atmosphereMaterial = useRef<ShaderMaterial>(null!);
  const atmosphereUniforms = useMemo(() => ({ color: { value: new Color(accent) }, intensity: { value: 0.6 } }), [accent]);
  const tilt = hash01(node.id, 'tilt') * Math.PI;
  const detail = smoothstep(presentation.scenery.showZoom, presentation.scenery.fullZoom, zoom);

  useFrame((_, delta) => {
    const target = selected ? 1 : hovered() === node.id ? 0.75 : 0;
    glow.current = MathUtils.damp(glow.current, target, 8, delta);
    const g = glow.current;
    atmosphereMaterial.current.uniforms.intensity.value = 0.55 + g * 1.4;
    atmosphere.current.scale.setScalar(1.3 + g * 0.14);
    body.current.material.emissiveIntensity = 0.1 + g * 0.3;
    halo.current.visible = selected;
    if (selected && !reducedMotion) halo.current.rotation.z += delta * 0.4;
    if (!reducedMotion) { clouds.current.rotation.y += delta * 0.05; }

  });

  return <group position={[position[0], position[1], depthOf(node.id, node.kind, settings.depth)]}>
    <group scale={size}>
    <mesh ref={body} rotation={[0, hash01(node.id, 'spin') * 6, 0]}><sphereGeometry args={[NODE_RADIUS, 48, 32]} />
      <meshPhysicalMaterial clearcoat={0.18} clearcoatRoughness={0.45} color={bodyColor} map={sharedSurfaceTexture()} displacementMap={sharedSurfaceTexture()} displacementScale={0.025} bumpMap={sharedSurfaceTexture()} bumpScale={0.12} roughness={0.8} metalness={0.08} emissive={primary} emissiveIntensity={0.1} envMapIntensity={1.2} />
    </mesh>
    <mesh ref={clouds} scale={1.04}><sphereGeometry args={[NODE_RADIUS, 40, 28]} /><meshStandardMaterial map={sharedCloudTexture()} color={accent} transparent opacity={0.35} roughness={1} depthWrite={false} /></mesh>
    <mesh ref={atmosphere}><sphereGeometry args={[NODE_RADIUS, 32, 24]} />
      <shaderMaterial ref={atmosphereMaterial} uniforms={atmosphereUniforms} vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} transparent depthWrite={false} blending={AdditiveBlending} />
    </mesh>
    <mesh rotation={[tilt, 0.6, 0]}><torusGeometry args={[NODE_RADIUS * 1.02, 0.012, 6, 64]} /><meshBasicMaterial color={new Color(primary).multiplyScalar(2.4)} toneMapped={false} /></mesh>
    <group ref={halo} rotation={[1.15, 0, 0]} visible={false}>
      <mesh><torusGeometry args={[NODE_RADIUS * 1.75, 0.022, 8, 96]} /><meshBasicMaterial color={new Color(accent).multiplyScalar(2.8)} toneMapped={false} /></mesh>
      <mesh rotation={[0, 0, 0.9]}><torusGeometry args={[NODE_RADIUS * 2.05, 0.012, 8, 96, 2.2]} /><meshBasicMaterial color={new Color(accent).multiplyScalar(1.8)} toneMapped={false} /></mesh>
    </group>
    </group>
    {!compact && <NodeScenery id={node.id} accent={accent} detail={detail} glow={glow} reducedMotion={reducedMotion} />}
    {children}
  </group>;
}
