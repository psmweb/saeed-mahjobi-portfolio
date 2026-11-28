"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { readClock } from "../cinema";

const C2 = new THREE.Vector3(1, 0, -46);

function place(theta: number, radius: number, y: number) {
  return new THREE.Vector3(C2.x + Math.sin(theta) * radius, y, C2.z + Math.cos(theta) * radius);
}

const YEARS = [
  { year: "2016", at: place(0, 4, 0.2), accent: "#10B981", rim: "#38BDF8" },
  { year: "2020", at: place(1, 3.6, 0.35), accent: "#F59E0B", rim: "#F59E0B" },
  { year: "2026", at: place(2, 3.4, 0.45), accent: "#F59E0B", rim: "#38BDF8" },
] as const;

function studioMark() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  context.clearRect(0, 0, 512, 512);
  context.strokeStyle = "#F59E0B";
  context.lineWidth = 14;
  context.lineJoin = "round";
  context.beginPath();
  context.arc(256, 210, 78, Math.PI * 1.05, Math.PI * 1.95);
  context.stroke();
  context.strokeRect(188, 214, 136, 108);
  context.beginPath();
  context.moveTo(256, 96);
  context.lineTo(312, 168);
  context.lineTo(200, 168);
  context.closePath();
  context.stroke();
  texture.needsUpdate = true;
  return texture;
}

function Beam({ a, b, color }: { a: THREE.Vector3; b: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const length = a.distanceTo(b);
  const mid = a.clone().lerp(b, 0.5);
  const orientation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );

  return (
    <mesh ref={ref} position={mid} quaternion={orientation}>
      <cylinderGeometry args={[0.025, 0.025, length, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
    </mesh>
  );
}

function Monolith({
  index,
  year,
  at,
  accent,
  rim,
  mark,
}: {
  index: number;
  year: string;
  at: THREE.Vector3;
  accent: string;
  rim: string;
  mark?: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const node = group.current;
    if (!node) return;
    const { internal } = readClock(scrollProgress.current);
    const start = [4.8, 6.0, 7.15][index];
    const rise = 1 - (1 - Math.min(1, Math.max(0, (internal - start) / 0.8))) ** 3;
    node.visible = rise > 0.02 && internal < 10.4;
    node.position.set(at.x, at.y + (rise - 1) * 4.5, at.z);
    node.scale.setScalar(0.2 + rise * 0.8);
    const pulse = 0.35 + Math.sin(internal * 2.2 + index) * 0.15;
    node.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.emissive) {
        const material = child.material;
        if (material instanceof THREE.MeshBasicMaterial) material.opacity = pulse * rise;
      }
    });
  });

  return (
    <group ref={group} name={year} position={at}>
      <mesh>
        <boxGeometry args={[1.55, 6.8, 0.42]} />
        <meshPhysicalMaterial color="#0C0E14" metalness={0.62} roughness={0.24} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.22]} userData={{ emissive: true }}>
        <boxGeometry args={[1.62, 6.9, 0.04]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[0.84, 0, 0]} userData={{ emissive: true }}>
        <boxGeometry args={[0.04, 6.9, 0.46]} />
        <meshBasicMaterial color={rim} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.4, 0.24]}>
        <planeGeometry args={[1.15, 1.15]} />
        {mark ? (
          <meshBasicMaterial map={mark} transparent toneMapped={false} />
        ) : (
          <meshBasicMaterial color={accent} transparent opacity={0.9} toneMapped={false} />
        )}
      </mesh>
    </group>
  );
}

export function Act2Evolution() {
  const mark = useMemo(() => studioMark(), []);
  const root = useRef<THREE.Group>(null);
  const floorY = -2.35;
  const bases = YEARS.map((year) => new THREE.Vector3(year.at.x, floorY, year.at.z));

  useFrame(() => {
    const node = root.current;
    if (!node) return;
    const { internal } = readClock(scrollProgress.current);
    node.visible = internal > 4.4 && internal < 10.4;
  });

  return (
    <group ref={root} name="act-2-evolution" visible={false}>
      <Monolith index={0} year={YEARS[0].year} at={YEARS[0].at} accent={YEARS[0].accent} rim={YEARS[0].rim} />
      <Monolith index={1} year={YEARS[1].year} at={YEARS[1].at} accent={YEARS[1].accent} rim={YEARS[1].rim} mark={mark} />
      <Monolith index={2} year={YEARS[2].year} at={YEARS[2].at} accent={YEARS[2].accent} rim={YEARS[2].rim} />
      <Beam a={bases[0]} b={bases[1]} color="#10B981" />
      <Beam a={bases[1]} b={bases[2]} color="#F59E0B" />
      <Beam a={bases[0]} b={bases[2]} color="#38BDF8" />
    </group>
  );
}
