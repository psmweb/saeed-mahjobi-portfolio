"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { sampleCamera } from "./cinema";

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

  useFrame(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const sample = sampleCamera(scrollProgress.current, scrollProgress.reducedMotion);
    camera.position.copy(sample.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(sample.target);
    camera.rotateZ(sample.roll);
    camera.fov = sample.fov;
    camera.updateProjectionMatrix();
  });

  return null;
}
