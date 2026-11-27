"use client";

export function ObsidianAtmosphere() {
  return (
    <>
      <color attach="background" args={["#05070C"]} />
      <fog attach="fog" args={["#05070C", 8, 18]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[3.5, 5.5, 4]} intensity={1.4} color="#F59E0B" />
      <pointLight position={[-3.2, 1.6, 2]} intensity={6} color="#38BDF8" distance={12} />
    </>
  );
}
