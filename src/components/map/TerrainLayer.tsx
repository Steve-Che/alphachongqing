"use client";

/** 平整基底，避免区划 mesh 与起伏地形穿插 */
export function TerrainLayer() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      raycast={() => null}
      renderOrder={0}
    >
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#6b7c5e" roughness={0.92} />
    </mesh>
  );
}
