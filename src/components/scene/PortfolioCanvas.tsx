"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AgentFigurines } from "./AgentFigurines";
import { AmberStoryteller } from "./AmberStoryteller";
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
      <AmberStoryteller />
      <AgentFigurines />
    </Canvas>
  );
}
