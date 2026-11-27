"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { readClock } from "./cinema";
import { Act1Hero } from "./acts/Act1Hero";
import { Act2Evolution as Act2EvolutionScene } from "./acts/Act2Evolution";
import { Act3Ventures } from "./acts/Act3Ventures";
import { AgentFigurines } from "./AgentFigurines";
import { CameraRig } from "./CameraRig";
import { ObsidianAtmosphere } from "./ObsidianAtmosphere";

function LaterActFigurines() {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.visible = readClock(scrollProgress.current).internal > 17.2;
  });
  return (
    <group ref={group} visible={false}>
      <AgentFigurines />
    </group>
  );
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
      <LaterActFigurines />
    </Canvas>
  );
}
