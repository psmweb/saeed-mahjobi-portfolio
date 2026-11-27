"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { arenaFraming } from "./arenaFraming";
import { readClock, sampleCamera } from "./cinema";

const dolly = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    scrollProgress.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = 0.1;
      camera.far = 500;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const sample = sampleCamera(scrollProgress.current, scrollProgress.reducedMotion);
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const framing = arenaFraming(aspect, sample.fov, readClock(scrollProgress.current).internal);
    camera.position.copy(sample.position);
    if (framing.fit > 1.001) {
      dolly.copy(camera.position).sub(sample.target);
      camera.position.copy(sample.target).addScaledVector(dolly, framing.fit);
    }
    camera.up.set(0, 1, 0);
    camera.lookAt(sample.target);
    camera.rotateZ(sample.roll);
    camera.fov = sample.fov;
    camera.updateProjectionMatrix();
  });

  return null;
}
