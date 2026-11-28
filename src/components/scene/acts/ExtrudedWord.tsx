"use client";

import { Text3D, useFont } from "@react-three/drei";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { Mesh } from "three";

/** Bebas Neue, generated from the OFL face into public/fonts. */
export const BEBAS_FONT = "/fonts/bebas-neue.json";

useFont.preload(BEBAS_FONT);

type ExtrudedWordProps = {
  text: string;
  size: number;
  depth: number;
  /** 1em = `size`. The hero lockup uses 0.06. */
  trackingEm?: number;
  center?: boolean;
  /** Fit the laid-out width, including tracking, to this world size. */
  width?: number;
  onWidth?: (naturalWidth: number) => void;
  curveSegments?: number;
  children?: ReactNode;
};

/**
 * Drei `Text3D` in Bebas Neue. Tracking is in ems, matching the CSS hero
 * lockup (`letter-spacing: 0.06em`).
 */
export function ExtrudedWord({
  text,
  size,
  depth,
  trackingEm = 0.06,
  center = false,
  width,
  onWidth,
  curveSegments = 5,
  children,
}: ExtrudedWordProps) {
  const ref = useRef<Mesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const bounds = mesh.geometry.boundingBox;
    if (!bounds) return;
    const natural = Math.max(0.001, bounds.max.x - bounds.min.x);
    const fit = width ? width / natural : 1;
    mesh.scale.setScalar(fit);
    const anchor = center ? (bounds.min.x + bounds.max.x) / 2 : bounds.min.x;
    mesh.position.x = -anchor * fit;
    onWidth?.(natural);
  }, [center, depth, onWidth, size, text, trackingEm, width]);

  return (
    <Text3D
      ref={ref}
      font={BEBAS_FONT}
      size={size}
      height={depth}
      curveSegments={curveSegments}
      bevelEnabled
      bevelThickness={depth * 0.14}
      bevelSize={size * 0.016}
      bevelSegments={2}
      letterSpacing={size * trackingEm}
    >
      {text}
      {children}
    </Text3D>
  );
}
