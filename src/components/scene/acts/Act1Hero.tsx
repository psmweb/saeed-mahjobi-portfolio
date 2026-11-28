"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { AmberStoryteller } from "../AmberStoryteller";
import { readClock } from "../cinema";

function spotlightTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  const gradient = context.createRadialGradient(256, 230, 20, 256, 256, 250);
  gradient.addColorStop(0, "rgba(245,158,11,0.28)");
  gradient.addColorStop(0.42, "rgba(20,16,12,0.55)");
  gradient.addColorStop(1, "rgba(5,7,12,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  texture.needsUpdate = true;
  return texture;
}

/** Frameless studio light and the storyteller gem. No portrait frame and no face. */
export function Act1Hero() {
  const spot = useMemo(() => spotlightTexture(), []);
  const stage = useRef<THREE.Group>(null);

  useFrame(() => {
    const node = stage.current;
    if (!node) return;
    node.visible = readClock(scrollProgress.current).internal < 5.2;
  });

  return (
    <group name="act-1-hero">
      <group ref={stage}>
      <mesh name="portrait-slot" position={[3.75, 0.35, 0]}>
        <planeGeometry args={[3.4, 4.6]} />
        <meshBasicMaterial map={spot} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[-1.6, -0.35, 1.15]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[3.4, 1.15, 0.08]} />
        <meshPhysicalMaterial
          color="#0A0C12"
          metalness={0.6}
          roughness={0.2}
          clearcoat={1}
          transparent
          opacity={0.72}
        />
      </mesh>
      </group>
      <AmberStoryteller />
    </group>
  );
}
