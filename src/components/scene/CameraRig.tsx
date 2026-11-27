"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { useLanguage } from "@/context/LanguageContext";
import type { ActId } from "@/data/i18n/types";
import { mirrorX } from "@/lib/direction";

export type CameraBeat = {
  act: ActId;
  position: [number, number, number];
  lookAt: [number, number, number];
};

/**
 * Scroll-linked beats for the later visual build.
 * Only the command beat is live today, with a small idle sway.
 */
export const cameraBeats: readonly CameraBeat[] = [
  { act: "command", position: [0, 1.55, 6.4], lookAt: [0, 1.1, 0] },
  { act: "evolution", position: [1.4, 1.7, 6.8], lookAt: [0, 1.05, 0] },
  { act: "ventures", position: [0, 2.1, 7.2], lookAt: [0, 0.9, -0.2] },
  { act: "arena", position: [0, 1.35, 5.4], lookAt: [0, 1.15, -0.3] },
  { act: "finale", position: [0, 1.6, 5.8], lookAt: [0, 1.2, 0.4] },
];

export function CameraRig() {
  const camera = useRef<PerspectiveCameraImpl>(null);
  const reduceMotion = useRef(false);
  const { dir } = useLanguage();
  const home = cameraBeats[0];

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame(({ clock }) => {
    const rig = camera.current;
    if (!rig) return;
    const sway = reduceMotion.current ? 0 : Math.sin(clock.elapsedTime * 0.2) * 0.18;
    rig.position.set(mirrorX(home.position[0] + sway, dir), home.position[1], home.position[2]);
    rig.lookAt(home.lookAt[0], home.lookAt[1], home.lookAt[2]);
  });

  return <PerspectiveCamera ref={camera} makeDefault fov={40} position={home.position} />;
}
