"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BlendFunction, Effect } from "postprocessing";
import { Color, Uniform, Vector4 } from "three";
import { FluidSimulation } from "three-fluid-fx";
import { useSceneActivity } from "@/hooks/scene-activity";
import { resolveNodeVisuals } from "@/lib/nodeVisuals";
import type { QualityTier } from "@/lib/presentation";
import type { ResolvedGraph } from "@/lib/timeline";

const shader = `
uniform sampler2D fluidDensity;
uniform vec3 smokeColor;
uniform vec3 smokeHighlight;
uniform float smokeIntensity;
uniform float smokeOpacity;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float density = max(0., texture2D(fluidDensity, uv).b);
  float strength = 1. - exp(-density * 1.5);
  vec3 tint = mix(smokeColor, smokeHighlight, smoothstep(.2, .85, strength));
  float alpha = strength * smokeOpacity * smokeIntensity;
  // Source-over transparency, matching the portfolio's density overlay.
  outputColor = vec4(mix(inputColor.rgb, tint, alpha), inputColor.a);
}`;

class CosmicSmokeEffect extends Effect {
  constructor() {
    super("CosmicPointerSmoke", shader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["fluidDensity", new Uniform(null)],
        ["smokeColor", new Uniform(new Color("#303651"))],
        ["smokeHighlight", new Uniform(new Color("#303651"))],
        ["smokeIntensity", new Uniform(0)],
        ["smokeOpacity", new Uniform(0.3)],
      ]),
    });
  }
  display(fluid: FluidSimulation | null, intensity: number) {
    this.uniforms.get("fluidDensity")!.value = fluid?.densityTexture ?? null;
    this.uniforms.get("smokeIntensity")!.value = intensity;
  }
}

/** Screen-space fluid solver feeding the existing compositor, with one renderer/frame loop. */
export function PointerFluid({
  graph,
  selectedId,
  reducedMotion,
  tier,
}: {
  graph: ResolvedGraph;
  selectedId: string | null;
  reducedMotion: boolean;
  tier: QualityTier;
}) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const { hovered } = useSceneActivity();
  const effect = useMemo(() => new CosmicSmokeEffect(), []);
  const effectRef = useRef(effect);
  const simulation = useRef<FluidSimulation | null>(null);
  const state = useRef({
    activeUntil: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    initialized: false,
  });
  const colors = useMemo(
    () => ({
      current: new Color("#303651"),
      desired: new Color("#303651"),
      base: new Color("#303651"),
      accent: new Color(),
    }),
    [],
  );
  const scratch = useMemo(
    () => ({ viewport: new Vector4(), scissor: new Vector4() }),
    [],
  );

  useEffect(() => {
    // Touch-only devices and reduced-motion users do not allocate simulation targets.
    const touchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(any-pointer: fine)").matches &&
      navigator.maxTouchPoints > 0;
    if (reducedMotion || touchOnly) return;
    const fluid = new FluidSimulation(gl, {
      profile: tier === "high" ? "balanced" : "performance",
      pressureIterations: tier === "high" ? 12 : 4,
      densityDissipation: 0.96,
      dyeDissipation: 0.97,
      velocityDissipation: 0.975,
      enableVorticity: true,
      curlStrength: 2.5,
      bfecc: false,
      reflectWalls: true,
      splatRadius: 0.001,
      splatForce: 6,
    });
    const rect = gl.domElement.getBoundingClientRect();
    fluid.resize(Math.max(1, rect.width), Math.max(1, rect.height));
    simulation.current = fluid;
    const ownedEffect = effectRef.current;
    const surface = gl.domElement.closest(".scene-window") ?? gl.domElement;
    const move = (event: Event) => {
      const e = event as PointerEvent;
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const bounds = gl.domElement.getBoundingClientRect();
      if (
        e.clientX < bounds.left ||
        e.clientX > bounds.right ||
        e.clientY < bounds.top ||
        e.clientY > bounds.bottom
      )
        return;
      const s = state.current,
        now = performance.now();
      const first = !s.initialized;
      const dx = first ? 0 : Math.max(-80, Math.min(80, e.clientX - s.lastX));
      const dy = first ? 0 : Math.max(-80, Math.min(80, s.lastY - e.clientY));
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastTime = now;
      s.initialized = true;
      if (Math.abs(dx) + Math.abs(dy) < 0.25) return;
      fluid.addSplat(
        (e.clientX - bounds.left) / bounds.width,
        1 - (e.clientY - bounds.top) / bounds.height,
        dx * fluid.splatForce,
        dy * fluid.splatForce,
      );
      s.activeUntil = now + 3500;
    };
    const reset = () => {
      state.current.initialized = false;
    };
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointercancel", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointercancel", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      ownedEffect.display(null, 0);
      simulation.current = null;
      fluid.dispose();
    };
  }, [gl, reducedMotion, tier, colors]);

  useEffect(() => {
    simulation.current?.resize(size.width, size.height);
  }, [size.width, size.height]);
  useEffect(() => {
    const owned = effectRef.current;
    return () => {
      owned.display(null, 0);
      owned.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    const fluid = simulation.current;
    if (!fluid || document.hidden || reducedMotion) return;
    const focus = hovered() ?? selectedId,
      node = focus ? graph.nodes.get(focus)?.node : undefined;
    colors.desired.copy(colors.base);
    if (node)
      colors.desired.lerp(
        colors.accent.set(resolveNodeVisuals(node).accent),
        0.7,
      );
    colors.current.lerp(colors.desired, 1 - Math.exp(-delta * 4));
    (effectRef.current.uniforms.get("smokeColor")!.value as Color).copy(
      colors.current,
    );
    if (performance.now() > state.current.activeUntil) {
      effectRef.current.display(fluid, 0);
      return;
    }
    // The solver shares R3F's renderer; restore state before the composer renders.
    const target = gl.getRenderTarget(),
      autoClear = gl.autoClear,
      scissorTest = gl.getScissorTest();
    gl.getViewport(scratch.viewport);
    gl.getScissor(scratch.scissor);
    const decayScale = Math.max(1, Math.min(delta, 1) * 60);
    fluid.densityDissipation = Math.pow(0.96, decayScale);
    fluid.velocityDissipation = Math.pow(0.975, decayScale);
    try {
      fluid.step(Math.min(delta, 1 / 60));
    } finally {
      gl.setRenderTarget(target);
      gl.autoClear = autoClear;
      gl.setViewport(scratch.viewport);
      gl.setScissor(scratch.scissor);
      gl.setScissorTest(scissorTest);
    }
    const idleFade = Math.exp(
      -Math.max(0, performance.now() - state.current.lastTime - 200) / 1100,
    );
    effectRef.current.display(fluid, idleFade);
  });

  return <primitive object={effect} dispose={null} />;
}
