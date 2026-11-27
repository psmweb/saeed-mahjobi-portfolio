"use client";

export type HumanoidSkeletonProps = {
  color: string;
  scale?: number;
};

/** Primitive capsule rig. The approved mockup replaces this mesh. */
export function HumanoidSkeleton({ color, scale = 1 }: HumanoidSkeletonProps) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.2, 0.72, 4, 12]} />
        <meshStandardMaterial color={color} roughness={0.38} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#F5F2EB" roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[-0.34, 1.02, 0]} rotation={[0, 0, 0.45]}>
        <capsuleGeometry args={[0.06, 0.36, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.5} />
      </mesh>
      <mesh position={[0.34, 1.02, 0]} rotation={[0, 0, -0.45]}>
        <capsuleGeometry args={[0.06, 0.36, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.07, 0.42, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.5} />
      </mesh>
      <mesh position={[0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.07, 0.42, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.5} />
      </mesh>
    </group>
  );
}
