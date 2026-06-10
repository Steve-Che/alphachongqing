"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function TerrainLayer() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 40, 40);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h =
        Math.sin(x * 0.08) * 1.5 +
        Math.cos(y * 0.06) * 1.2 +
        Math.sin((x + y) * 0.04) * 0.8;
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      geometry={geometry}
      raycast={() => null}
      renderOrder={0}
    >
      <meshStandardMaterial color="#6b7c5e" roughness={0.9} />
    </mesh>
  );
}
