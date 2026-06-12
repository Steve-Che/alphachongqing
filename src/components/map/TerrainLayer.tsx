"use client";

import { SketchEdges, ToonFaceMaterial } from "./sketchup-materials";

/** 平整基底，避免区划 mesh 与起伏地形穿插 */
export function TerrainLayer() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      raycast={() => null}
      renderOrder={0}
    >
      <planeGeometry args={[140, 140]} />
      <ToonFaceMaterial color="#6b7c5e" />
      <SketchEdges threshold={5} />
    </mesh>
  );
}
