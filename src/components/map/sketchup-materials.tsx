"use client";

import { Edges } from "@react-three/drei";

export function ToonFaceMaterial({
  color,
  emissive = "#000000",
  emissiveIntensity = 0,
}: {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshToonMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

export function SketchEdges({ threshold = 15 }: { threshold?: number }) {
  return <Edges threshold={threshold} color="#1a1a1a" />;
}

export function SketchupSceneLighting() {
  return (
    <>
      <color attach="background" args={["#d4ddd0"]} />
      <fog attach="fog" args={["#d4ddd0", 70, 180]} />
      <ambientLight intensity={0.68} />
      <directionalLight position={[22, 38, 18]} intensity={0.82} />
    </>
  );
}
