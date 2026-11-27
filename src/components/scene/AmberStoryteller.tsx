"use client";

import { HumanoidSkeleton } from "./HumanoidSkeleton";

/** Amber-gold narrator. Pose and cloth land with the visual build. */
export function AmberStoryteller() {
  return (
    <group name="amber-storyteller" position={[0, 0, 0.9]}>
      <HumanoidSkeleton color="#F59E0B" scale={1.16} />
      <pointLight position={[0, 1.7, 0.45]} intensity={3} color="#F59E0B" distance={5} />
    </group>
  );
}
