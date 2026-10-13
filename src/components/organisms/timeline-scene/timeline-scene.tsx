'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Component, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Color, NoToneMapping, PointLight } from 'three';
import { PointerFluid } from './pointer-fluid';
import { TitleLabelLayout } from './title-label-layout';
import { CameraRig } from './camera-rig';
import { SceneEnvironment } from './environment';
import { SceneSettingsContext, useSceneSettings } from '@/hooks/scene-settings';
import type { SceneSettings } from '@/types/scene-settings';
import { SceneActivity } from '@/hooks/scene-activity';
import type { Navigation } from '@/types/navigation';
import { TimelineConnection } from '@/components/molecules/timeline-connection';
import { TimelineNodeView } from '@/components/molecules/timeline-node-view';
import { PIXELS_PER_UNIT } from '@/lib/camera';
import { resolveNodeVisuals } from '@/lib/nodeVisuals';
import { depthOf, presentation, type QualityTier } from '@/lib/presentation';
import { selectionConnections } from '@/lib/selectionConnections';
import { type ResolvedGraph } from '@/lib/timeline';


class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Exposure({ value }: { value: number }) {
  useFrame(({ gl }) => { gl.toneMappingExposure = value; });
  return null;
}

function RimLight({ graph, selectedId }: { graph: ResolvedGraph; selectedId: string | null }) {
  const settings = useSceneSettings();
  const light = useRef<PointLight>(null!);
  const color = useMemo(() => new Color(), []);
  useFrame((_, delta) => {
    const item = selectedId ? graph.nodes.get(selectedId) : undefined;
    light.current.intensity += ((item ? 38 : 0) - light.current.intensity) * Math.min(1, delta * 6);
    if (!item) return;
    light.current.position.set(item.position[0] + 2.2, item.position[1] + 1.8, depthOf(item.node.id, item.node.kind, settings.depth) + 3);
    light.current.color.lerp(color.set(resolveNodeVisuals(item.node).accent), 0.15);
  });
  return <pointLight ref={light} intensity={0} distance={14} decay={2} />;
}

function Graph({ graph, selectedId, onSelect, zoom, portal, reducedMotion }: {
  graph: ResolvedGraph; selectedId: string | null; onSelect: (id: string) => void; zoom: number; portal: RefObject<HTMLDivElement>; reducedMotion: boolean;
}) {
  const illuminatedEdges = useMemo(() => selectionConnections(graph, selectedId), [graph, selectedId]);
  const headingSize = Math.max(8, Math.min(13, zoom * 20));
  const headingOffset = Math.max(3, (headingSize * 1.1 + 6) / (PIXELS_PER_UNIT * zoom));
  return <group>
    {graph.layout.rows.map(({ row, y }) => <group key={row.id}>
      <Html portal={portal} position={[graph.layout.bounds.min[0], y + headingOffset, 0]} className="lane-label" zIndexRange={[5, 0]} style={{ pointerEvents: 'none', fontSize: headingSize, lineHeight: 1.1 }}><span>{row.name}</span></Html>
    </group>)}
    {graph.connections.map(edge => <TimelineConnection key={edge.id} edge={edge} illuminated={illuminatedEdges.has(edge.id)} selectedId={selectedId} graph={graph} reducedMotion={reducedMotion} />)}
    <TitleLabelLayout graph={graph} portal={portal} />
    {graph.layout.nodes.map(item => <TimelineNodeView key={item.node.id} item={item} selected={item.node.id === selectedId}
      onSelect={onSelect} zoom={zoom} portal={portal} reducedMotion={reducedMotion} />)}
  </group>;
}

export default function TimelineScene({ graph, selectedId, onSelect, navigation, zoom, reducedMotion, fallback, settings }: {
  settings: SceneSettings;
  graph: ResolvedGraph; selectedId: string | null; onSelect: (id: string) => void;
  navigation: RefObject<Navigation>; zoom: number; reducedMotion: boolean; fallback: ReactNode;
}) {
  const portal = useRef<HTMLDivElement>(null!);
  const hoverId = useRef<string | null>(null);
  const activity = useMemo(() => ({ hovered: () => hoverId.current, hover: (id: string, on: boolean) => { if (on) hoverId.current = id; else if (hoverId.current === id) hoverId.current = null; } }), []);
  // This module only loads client-side (ssr: false), so browser APIs are available here.
  const [tier] = useState<QualityTier>(() => window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 900 && (navigator.hardwareConcurrency ?? 4) >= 6 ? 'high' : 'low');
  const quality = settings.quality === 'auto' ? tier : settings.quality;
  const t = presentation.tiers[quality];
  const still = reducedMotion || !settings.motion;
  return <SceneBoundary fallback={fallback}>
    <div ref={portal} className="scene-label-layer" />
    <Canvas camera={{ fov: presentation.fov, position: [0, 0, 30], near: 1, far: presentation.far }} dpr={t.dpr} frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: NoToneMapping }} fallback={fallback}>
      <SceneSettingsContext.Provider value={settings}><SceneActivity.Provider value={activity}>
        <Exposure value={settings.exposure} />
        <SceneEnvironment graph={graph} tier={quality} reducedMotion={still} />
        <CameraRig graph={graph} navigation={navigation} zoom={zoom} reducedMotion={still} />
        <RimLight graph={graph} selectedId={selectedId} />
        <Graph graph={graph} selectedId={selectedId} onSelect={onSelect} zoom={zoom} portal={portal} reducedMotion={still} />
        <EffectComposer multisampling={t.multisampling}>
          <PointerFluid graph={graph} selectedId={selectedId} reducedMotion={reducedMotion} tier={quality} />
          <Bloom mipmapBlur luminanceThreshold={presentation.bloom.threshold} intensity={settings.bloom} radius={presentation.bloom.radius} />
          <Vignette offset={0.3} darkness={0.35} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </SceneActivity.Provider></SceneSettingsContext.Provider>
    </Canvas>
  </SceneBoundary>;
}
