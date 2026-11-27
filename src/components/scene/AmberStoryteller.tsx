"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh, PointLight } from "three";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { readClock } from "./cinema";

function radialGlow(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.45, `${color}55`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  texture.needsUpdate = true;
  return texture;
}

/** Faceted amber storyteller from the reference scene, with a cyan orbit spark. */
export function AmberStoryteller() {
  const group = useRef<Group>(null);
  const gem = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);
  const spark = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const camera = useThree((state) => state.camera);
  const glowMap = useMemo(() => radialGlow("#F59E0B"), []);

  useFrame(() => {
    const { internal } = readClock(scrollProgress.current);
    const root = group.current;
    if (!root || !gem.current || !core.current || !ring.current || !ringB.current || !glow.current || !spark.current) {
      return;
    }
    const visible = internal > 1.2 && internal < 4.6;
    root.visible = visible;
    if (!visible) return;
    root.position.set(0.3, 2.35 + Math.sin(internal * 2) * 0.08, 1.6);
    gem.current.rotation.set(internal * 0.7, internal * 1.1, 0);
    core.current.rotation.set(-internal, internal * 0.6, 0);
    ring.current.rotation.set(Math.PI / 2.4 + Math.sin(internal) * 0.2, internal * 0.5, 0);
    ringB.current.rotation.set(Math.PI / 1.8, -internal * 0.4, Math.sin(internal * 0.7) * 0.3);
    glow.current.quaternion.copy(camera.quaternion);
    spark.current.position.set(Math.cos(internal * 1.4) * 1.15, Math.sin(internal * 1.7) * 0.45, Math.sin(internal * 1.4) * 1.15);
    if (light.current) light.current.intensity = 12 + Math.sin(internal * 3) * 2;
  });

  return (
    <group ref={group} name="amber-storyteller">
      <mesh ref={gem}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial
          color="#FFB347"
          roughness={0.08}
          metalness={0.1}
          transmission={0.5}
          thickness={0.8}
          ior={1.54}
          clearcoat={1}
          emissive="#E07800"
          emissiveIntensity={0.35}
          flatShading
        />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#FFD27A" emissive="#FFB020" emissiveIntensity={3} roughness={0.3} flatShading />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[0.8, 0.012, 6, 96]} />
        <meshBasicMaterial color="#FFD27A" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} scale={1.2}>
        <torusGeometry args={[0.8, 0.012, 6, 96]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={spark}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} />
      </mesh>
      <mesh ref={glow}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial map={glowMap} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#FFB347" intensity={14} distance={8} decay={2} />
    </group>
  );
}
