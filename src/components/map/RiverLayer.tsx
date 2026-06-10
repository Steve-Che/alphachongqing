"use client";

import { RIVERS } from "@/lib/chongqing/geo";
import * as THREE from "three";

function River({ points, color }: { points: { x: number; z: number }[]; color: string }) {
  const shape = new THREE.Shape();
  const width = 2.5;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    const dz = p1.z - p0.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const nx = (-dz / len) * width;
    const nz = (dx / len) * width;

    if (i === 0) {
      shape.moveTo(p0.x + nx, p0.z + nz);
      shape.lineTo(p0.x - nx, p0.z - nz);
    }
    shape.lineTo(p1.x - nx, p1.z - nz);
    shape.lineTo(p1.x + nx, p1.z + nz);
  }
  shape.closePath();

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} raycast={() => null}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.55}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

export function RiverLayer() {
  return (
    <group>
      <River points={RIVERS.yangtze} color="#4a7c9b" />
      <River points={RIVERS.jialing} color="#5a8cad" />
    </group>
  );
}
