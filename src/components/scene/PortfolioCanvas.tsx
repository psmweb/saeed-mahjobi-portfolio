"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
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
    if (canvas.dataset.drawCalls !== calls) canvas.dataset.drawCalls = calls;
    if (canvas.dataset.triangles !== triangles) canvas.dataset.triangles = triangles;
  });
  return null;
}

export function PortfolioCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ fov: 40, near: 0.1, far: 500, position: [-1.8, 1.4, 15.5] }}
      dpr={[1, 1.5]}
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
      <ObsidianAtmosphere />
      <CameraRig />
      <Act1Hero />
      <Act2EvolutionScene />
      <Act3Ventures />
      <Act4Arena />
      <Act5Finale />
      <RenderMeter />
    </Canvas>
  );
}
