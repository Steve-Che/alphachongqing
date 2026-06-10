"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { DistrictGeo } from "@/lib/chongqing/geo";

type DistrictMeshProps = {
  district: DistrictGeo;
  hovered?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
};

function buildShape(boundary: DistrictGeo["boundary"]) {
  const shape = new THREE.Shape();
  boundary.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.z);
    else shape.lineTo(p.x, p.z);
  });
  shape.closePath();
  return shape;
}

export function DistrictMesh({
  district,
  hovered = false,
  highlighted = false,
  dimmed = false,
}: DistrictMeshProps) {
  const shape = useMemo(() => buildShape(district.boundary), [district.boundary]);
  const active = hovered || highlighted;
  const y = district.elevation + 0.15;
  const opacity = dimmed ? 0.35 : active ? 0.92 : 0.78;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, y, 0]}
        renderOrder={2}
        raycast={() => null}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={district.color}
          transparent
          opacity={opacity}
          emissive={district.color}
          emissiveIntensity={active ? 0.3 : dimmed ? 0 : 0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        raycast={() => null}
        renderOrder={1}
      >
        <extrudeGeometry
          args={[shape, { depth: district.elevation, bevelEnabled: false }]}
        />
        <meshStandardMaterial
          color={district.color}
          transparent
          opacity={dimmed ? 0.25 : 0.55}
        />
      </mesh>

      {!dimmed && (
        <Html
          position={[district.center.x, y + 1.5, district.center.z]}
          center
          distanceFactor={45}
          style={{ pointerEvents: "none" }}
          zIndexRange={[100, 0]}
        >
          <div
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium shadow-sm transition-all ${
              active
                ? "scale-105 bg-stone-900 text-white"
                : "bg-black/75 text-white"
            }`}
          >
            {district.nameZh}
          </div>
        </Html>
      )}
    </group>
  );
}
