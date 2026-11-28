import * as THREE from "three";

/** Shared Act 1–2 metals. One program, many meshes. Not disposed with the meshes. */
export const chromeMetal = new THREE.MeshPhysicalMaterial({
  color: "#F2F3F7",
  metalness: 1,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 2.2,
});

export const goldMetal = new THREE.MeshPhysicalMaterial({
  color: "#FFC24D",
  metalness: 1,
  roughness: 0.2,
  clearcoat: 0.8,
  emissive: "#B86A00",
  emissiveIntensity: 0.55,
  envMapIntensity: 2,
});

export const obsidianMetal = new THREE.MeshPhysicalMaterial({
  color: "#0C0E14",
  metalness: 0.55,
  roughness: 0.22,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
});
