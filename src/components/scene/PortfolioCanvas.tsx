"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Act1Hero } from "./acts/Act1Hero";
import { Act2Evolution as Act2EvolutionScene } from "./acts/Act2Evolution";
import { Act3Ventures } from "./acts/Act3Ventures";
import { Act4Arena } from "./acts/Act4Arena";
import { CameraRig } from "./CameraRig";
import { ObsidianAtmosphere } from "./ObsidianAtmosphere";

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
    </Canvas>
  );
}
