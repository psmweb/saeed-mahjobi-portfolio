"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { scrollProgress, stepSmoothed, syncReducedMotion } from "@/lib/scrollProgress";
import { arenaFraming } from "./arenaFraming";
import { readClock, sampleCamera } from "./cinema";

const dolly = new THREE.Vector3();
const look = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    syncReducedMotion();
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = 0.1;
      camera.far = 500;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Negative priority runs before the acts and does not take over rendering.
  useFrame((state, delta) => {
    stepSmoothed(delta);
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const progress = scrollProgress.smoothed;
    const sample = sampleCamera(progress, scrollProgress.reducedMotion);
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const internal = readClock(progress).internal;
    const framing = arenaFraming(aspect, sample.fov, internal);
    camera.position.copy(sample.position);
    if (framing.fit > 1.001) {
      dolly.copy(camera.position).sub(sample.target);
      camera.position.copy(sample.target).addScaledVector(dolly, framing.fit);
    }
    look.copy(sample.target);
    if (aspect < 1 && internal > 9.85 && internal < 17.35) {
      const safe = Math.max(aspect, 0.35);
      dolly.copy(camera.position).sub(sample.target);
      const distance = Math.max(dolly.length(), 0.001);
      const vFov = (sample.fov * Math.PI) / 180;
      const visibleW = 2 * Math.tan(vFov / 2) * distance * safe;
      const fit = Math.min(2.7, Math.max(1, 9.05 / Math.max(visibleW, 0.001)));
      camera.position.copy(sample.target).addScaledVector(dolly.normalize(), distance * fit);
      look.y -= 1.45;
    }
    if (aspect < 1 && internal >= 24.65) {
      const safe = Math.max(aspect, 0.35);
      const fit = Math.min(1.72, Math.max(1, 0.78 / safe));
      dolly.copy(camera.position).sub(sample.target);
      camera.position.copy(sample.target).addScaledVector(dolly, fit);
    }
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.rotateZ(sample.roll);
    camera.fov = sample.fov;
    camera.updateProjectionMatrix();
  }, -1);

  return null;
}
