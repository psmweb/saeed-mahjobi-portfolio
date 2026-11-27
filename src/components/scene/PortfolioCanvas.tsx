"use client";

import { Canvas } from "@react-three/fiber";
import { AgentFigurines } from "./AgentFigurines";
import { AmberStoryteller } from "./AmberStoryteller";
import { CameraRig } from "./CameraRig";
import { ObsidianAtmosphere } from "./ObsidianAtmosphere";

export function PortfolioCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
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
