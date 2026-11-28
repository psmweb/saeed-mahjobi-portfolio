"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { actHandoff } from "@/lib/actHandoff";
import { markDegraded, sceneQuality, sparkBudget } from "@/lib/performanceTier";
import { scrollProgress } from "@/lib/scrollProgress";
import { Act1Hero } from "./acts/Act1Hero";
import { Act2Evolution as Act2EvolutionScene } from "./acts/Act2Evolution";
import { Act3Ventures } from "./acts/Act3Ventures";
import { Act4Arena } from "./acts/Act4Arena";
import { Act5Finale } from "./acts/Act5Finale";
import { CameraRig } from "./CameraRig";
import { ObsidianAtmosphere } from "./ObsidianAtmosphere";
import { useIdleInput } from "./useIdleInput";

/** Same caps as `performanceTier`, then a floor of 1. A decline takes one step. */
const DPR_STEPS = [2, 1.5, 1.25, 1] as const;
const DPR_QUIET_MS = 500;

function loadTimeDpr() {
  const cap = sceneQuality.dpr;
  if (typeof window === "undefined") return cap;
  return Math.min(window.devicePixelRatio || 1, cap);
}

function stepDownDpr(current: number) {
  const next = DPR_STEPS.find((step) => step < current - 1e-3);
  return next ?? current;
}

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
  const [dpr, setDpr] = useState(loadTimeDpr);
  const { idle, idleRef } = useIdleInput(DPR_QUIET_MS);
  const droppedRef = useRef(false);
  const pendingRef = useRef(false);

  const applyLower = useCallback(() => {
    if (droppedRef.current || !pendingRef.current || !idleRef.current) return;
    droppedRef.current = true;
    pendingRef.current = false;
    setDpr((current) => stepDownDpr(current));
  }, [idleRef]);

  useEffect(() => {
    if (idle) applyLower();
  }, [idle, applyLower]);

  const onDecline = useCallback(() => {
    markDegraded(true);
    if (droppedRef.current) return;
    pendingRef.current = true;
    applyLower();
  }, [applyLower]);

  const onIncline = useCallback(() => {
    markDegraded(false);
  }, []);

  return (
    <Canvas
      className="h-full w-full"
      camera={{ fov: 40, near: 0.1, far: 500, position: [-1.8, 1.4, 15.5] }}
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#05070C");
      }}
    >
      <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} />
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
