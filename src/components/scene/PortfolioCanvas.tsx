"use client";

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { actHandoff } from "@/lib/actHandoff";
import { markDegraded, sceneQuality, sparkBudget, subscribeQuality } from "@/lib/performanceTier";
import { scrollProgress } from "@/lib/scrollProgress";
import { Act1Hero } from "./acts/Act1Hero";
import { Act2Evolution as Act2EvolutionScene } from "./acts/Act2Evolution";
import { Act3Ventures } from "./acts/Act3Ventures";
import { Act4Arena } from "./acts/Act4Arena";
import { Act5Finale } from "./acts/Act5Finale";
import { CameraRig } from "./CameraRig";
import { ObsidianAtmosphere } from "./ObsidianAtmosphere";

function RenderMeter() {
  const gl = useThree((state) => state.gl);
  useFrame(() => {
    const calls = String(gl.info.render.calls);
    const triangles = String(gl.info.render.triangles);
    const canvas = gl.domElement;
    const handoff = actHandoff(scrollProgress.smoothed, scrollProgress.reducedMotion);
    const tier = sceneQuality.degraded ? `${sceneQuality.tier}-degraded` : sceneQuality.tier;
    const dpr = gl.getPixelRatio().toFixed(2);
    const sparks = String(sparkBudget());
    const pulse = handoff.pulse.toFixed(3);
    if (canvas.dataset.drawCalls !== calls) canvas.dataset.drawCalls = calls;
    if (canvas.dataset.triangles !== triangles) canvas.dataset.triangles = triangles;
    if (canvas.dataset.tier !== tier) canvas.dataset.tier = tier;
    if (canvas.dataset.dpr !== dpr) canvas.dataset.dpr = dpr;
    if (canvas.dataset.sparks !== sparks) canvas.dataset.sparks = sparks;
    if (canvas.dataset.handoff !== pulse) canvas.dataset.handoff = pulse;
  });
  return null;
}

export function PortfolioCanvas() {
  const [dprMax, setDprMax] = useState(() => sceneQuality.dpr);
  useEffect(() => subscribeQuality(() => setDprMax(sceneQuality.dpr)), []);
  return (
    <Canvas
      className="h-full w-full"
      camera={{ fov: 40, near: 0.1, far: 500, position: [-1.8, 1.4, 15.5] }}
      dpr={[1, dprMax]}
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#05070C");
      }}
    >
      <PerformanceMonitor
        onDecline={() => markDegraded(true)}
        onIncline={() => markDegraded(false)}
      >
        <AdaptiveDpr />
      </PerformanceMonitor>
      <ObsidianAtmosphere />
      <CameraRig />
      <Suspense fallback={null}>
        <Act1Hero />
        <Act2EvolutionScene />
      </Suspense>
      <Act3Ventures />
      <Act4Arena />
      <Act5Finale />
      <RenderMeter />
    </Canvas>
  );
}
