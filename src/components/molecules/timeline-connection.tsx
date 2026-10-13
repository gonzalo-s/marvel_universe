'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, CurvePath, LineCurve3, MathUtils, Mesh, MeshBasicMaterial, QuadraticBezierCurve3, Quaternion, TubeGeometry, Vector3, AdditiveBlending, type Curve } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useSceneSettings } from '@/hooks/scene-settings';
import { useSceneActivity } from '@/hooks/scene-activity';
import { edgeStyles, type ResolvedGraph } from '@/lib/timeline';
import { depthOf, seeded, hashString } from '@/lib/presentation';
import { resolveNodeVisuals } from '@/lib/nodeVisuals';

function buildCurve(edge: ResolvedGraph['connections'][number], zA: number, zB: number): Curve<Vector3> {
  const vertices = edge.points.map(point => new Vector3(...point));
  let base: Curve<Vector3>;
  if (edge.route === 'local' || edge.route === 'direct') base = new QuadraticBezierCurve3(vertices[0], vertices[1], vertices[2]);
  else {
    const path = new CurvePath<Vector3>();
    let cursor = vertices[0];
    for (let i = 1; i < vertices.length - 1; i++) {
      const corner = vertices[i];
      const radius = Math.min(1.6, corner.distanceTo(vertices[i - 1]) * 0.3, corner.distanceTo(vertices[i + 1]) * 0.3);
      const incoming = corner.clone().add(vertices[i - 1].clone().sub(corner).normalize().multiplyScalar(radius));
      const outgoing = corner.clone().add(vertices[i + 1].clone().sub(corner).normalize().multiplyScalar(radius));
      if (cursor.distanceTo(incoming) > 0) path.add(new LineCurve3(cursor, incoming));
      path.add(new QuadraticBezierCurve3(incoming, corner, outgoing));
      cursor = outgoing;
    }
    path.add(new LineCurve3(cursor, vertices.at(-1)!));
    base = path;
  }
  // Presentation depth: endpoints stay on their nodes; the path blends between them.
  const points = base.getSpacedPoints(160);
  points.forEach((p, i) => { p.z = MathUtils.lerp(zA, zB, i / 160); });
  return new CatmullRomCurve3(points, false, 'centripetal');
}

/** Deterministic jagged bolt around the stored route; endpoints never move. */
function lightningCurve(base: Curve<Vector3>, seed: number, amplitude: number) {
  const random = seeded(seed), length = base.getLength();
  const count = Math.min(480, Math.max(32, Math.round(length * 4)));
  const points: Vector3[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count, p = base.getPointAt(t), ahead = base.getPointAt(Math.min(1, t + 0.01)), behind = base.getPointAt(Math.max(0, t - 0.01));
    const tangent = ahead.sub(behind).normalize();
    const envelope = Math.min(1, Math.sin(Math.PI * t) * 3);
    // Broad irregular meanders plus sharp small discharges, without moving endpoints.
    const wander = Math.sin(t * 19 + seed % 17) * 0.6 + Math.sin(t * 43 + seed % 11) * 0.3;
    const jitter = ((random() - 0.5) * 2 + wander) * amplitude * envelope;
    points.push(p.add(new Vector3(-tangent.y, tangent.x, 0).multiplyScalar(jitter)).add(new Vector3(0, 0, (random() - 0.5) * amplitude * envelope)));
  }
  return { curve: new CatmullRomCurve3(points, false, 'catmullrom', 0.15), points, random };
}

function sparks(points: Vector3[], random: () => number, radius: number) {
  const parts: TubeGeometry[] = [];
  const forks = Math.min(8, Math.max(2, Math.round(points.length / 55)));
  for (let f = 0; f < forks; f++) {
    const i = 4 + Math.floor(random() * (points.length - 8)), origin = points[i];
    const dir = new Vector3(random() - 0.5, random() - 0.5, (random() - 0.5) * 0.4).normalize();
    const fork = [origin.clone()];
    for (let k = 1; k <= 4; k++) fork.push(fork[k - 1].clone().addScaledVector(dir, 0.22 + random() * 0.22).add(new Vector3((random() - 0.5) * 0.14, (random() - 0.5) * 0.14, 0)));
    parts.push(new TubeGeometry(new CatmullRomCurve3(fork, false, 'catmullrom', 0.15), 8, radius * 0.6, 5, false));
  }
  return parts;
}

/** Film-theme gradient: source node color flows into target node color along the bolt. */
function colorize(geometry: BufferGeometry, samples: Vector3[], from: Color, to: Color, boost: number) {
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3), vertex = new Vector3(), mixed = new Color();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    let best = 0, bestDistance = Infinity;
    for (let j = 0; j < samples.length; j++) { const d = vertex.distanceToSquared(samples[j]); if (d < bestDistance) { bestDistance = d; best = j; } }
    mixed.copy(from).lerp(to, best / (samples.length - 1)).multiplyScalar(boost);
    colors.set([mixed.r, mixed.g, mixed.b], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

export function TimelineConnection({ edge, selectedId, graph, reducedMotion, illuminated }: { illuminated: boolean; edge: ResolvedGraph['connections'][number]; selectedId: string | null; graph: ResolvedGraph; reducedMotion: boolean }) {
  const { hovered } = useSceneActivity();
  const settings = useSceneSettings();
  const style = edgeStyles[edge.type];
  const mainRow = graph.layout.rows[0]?.row.id;
  const main = edge.type === 'sequence' && graph.nodes.get(edge.sourceId)!.node.position.row === mainRow && graph.nodes.get(edge.targetId)!.node.position.row === mainRow;
  const zA = depthOf(edge.sourceId, graph.nodes.get(edge.sourceId)!.node.kind, settings.depth), zB = depthOf(edge.targetId, graph.nodes.get(edge.targetId)!.node.kind, settings.depth);
  const far = Math.max(0, Math.min(1, (-(zA + zB) / 2 - 1) / 6));
  const smooth = useMemo(() => buildCurve(edge, zA, zB), [edge, zA, zB]);
  const colors = useMemo(() => ({
    from: new Color(resolveNodeVisuals(graph.nodes.get(edge.sourceId)!.node).primary), to: new Color(resolveNodeVisuals(graph.nodes.get(edge.targetId)!.node).primary),
  }), [graph, edge.sourceId, edge.targetId]);
  const bolt = useMemo(() => lightningCurve(smooth, hashString(edge.id), edge.type === 'branch' ? 0.42 : edge.type === 'transition' ? 0.32 : 0.26), [smooth, edge]);
  const curve = bolt.curve;
  const samples = useMemo(() => curve.getSpacedPoints(80), [curve]);
  const coreGeometry = useMemo(() => {
    const body = new TubeGeometry(curve, Math.min(640, Math.max(60, bolt.points.length * 2)), main ? 0.05 : 0.03, 6, false);
    const extra = sparks(bolt.points, seeded(hashString(edge.id) + 1), 0.03);
    const merged = mergeGeometries([body, ...extra])!;
    [body, ...extra].forEach(part => part.dispose());
    return colorize(merged, samples, colors.from, colors.to, main ? 2.4 : 1.5);
  }, [curve, edge, bolt, samples, colors, main]);
  const glowGeometry = useMemo(() => colorize(new TubeGeometry(curve, 120, main ? 0.18 : 0.12 * (1 + far * 0.8), 8, false), samples, colors.from, colors.to, main ? 1.4 : 1), [curve, samples, colors, main, far]);
  useEffect(() => () => { coreGeometry.dispose(); glowGeometry.dispose(); }, [coreGeometry, glowGeometry]);
  const coreColor = useMemo(() => colors.from.clone().lerp(colors.to, 0.5).multiplyScalar(1.5), [colors]);
  const core = useRef<MeshBasicMaterial>(null!), glow = useRef<MeshBasicMaterial>(null!), pulse = useRef<Mesh>(null!), pulseMaterial = useRef<MeshBasicMaterial>(null!), cue = useRef<MeshBasicMaterial>(null!);
  const level = useRef(main ? 1.2 : edge.route === 'local' ? 0.9 : 0.55);
  const arrow = useMemo(() => ({ position: smooth.getPointAt(0.85), quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), smooth.getTangentAt(0.85).normalize()) }), [smooth]);
  const marker = useMemo(() => curve.getPointAt(Math.min(0.3, 1.3 / curve.getLength())), [curve]);
  const phase = useMemo(() => (edge.id.length * 0.137) % 1, [edge.id]);

  useFrame(({ clock }, delta) => {
    const focus = selectedId ?? hovered();
    const related = illuminated || (focus !== null && (edge.sourceId === focus || edge.targetId === focus));
    const target = related ? 1.8 : main ? focus && !related ? 0.8 : 1.3 : focus ? related ? 1.3 : 0.12 : edge.route === 'local' ? 0.9 : 0.5;
    level.current = MathUtils.damp(level.current, target * (related ? 1 : 1 - 0.35 * far), 7, delta);
    const l = Math.min(1, level.current);
    const flicker = related || reducedMotion ? 1 : 0.8 + 0.2 * Math.sin(clock.elapsedTime * 21 + phase * 40) * Math.sin(clock.elapsedTime * 6.7 + phase * 9);
    core.current.color.setScalar(related ? 2.5 : 1);
    glow.current.color.setScalar(related ? 2 : 1);
    core.current.opacity = l * flicker; glow.current.opacity = (related ? 0.38 : main ? 0.2 : 0.14) * level.current; cue.current.opacity = l;
    if (edge.type === 'sequence') {
      const t = reducedMotion ? phase : (clock.elapsedTime * 0.07 + phase) % 1;
      pulse.current.position.copy(curve.getPointAt(t)); pulseMaterial.current.opacity = l * Math.sin(t * Math.PI) * 0.9;
    }
  });

  return <group>
    <mesh geometry={glowGeometry}><meshBasicMaterial ref={glow} vertexColors transparent opacity={0.1} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></mesh>
    <mesh geometry={coreGeometry}><meshBasicMaterial ref={core} vertexColors transparent opacity={0.5} depthWrite={false} toneMapped={false} /></mesh>
    <mesh position={arrow.position} quaternion={arrow.quaternion}><coneGeometry args={[0.15, 0.4, 12]} /><meshBasicMaterial ref={cue} color={coreColor} transparent depthWrite={false} toneMapped={false} /></mesh>
    {edge.type === 'sequence' && <mesh ref={pulse}><sphereGeometry args={[0.085, 12, 8]} /><meshBasicMaterial ref={pulseMaterial} color={coreColor} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>}
    {edge.type === 'branch' && <mesh position={marker} rotation={[0, 0, Math.PI / 4]}>
      <octahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color="#1a1208" roughness={0.3} metalness={0.8} emissive={style.color} emissiveIntensity={1.2} />
    </mesh>}
  </group>;
}
