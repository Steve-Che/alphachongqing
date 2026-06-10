"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { DistrictGeo } from "@/lib/chongqing/geo";

type DistrictMeshProps = {
  district: DistrictGeo;
  onSelect?: (slug: string) => void;
};

export function DistrictMesh({ district, onSelect }: DistrictMeshProps) {
  const router = useRouter();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const shape = new THREE.Shape();
  district.boundary.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.z);
    else shape.lineTo(p.x, p.z);
  });
  shape.closePath();

  const handleClick = () => {
    onSelect?.(district.slug);
    router.push(`/district/${district.slug}`);
  };

  return (
    <group position={[0, district.elevation, 0]}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <extrudeGeometry
          args={[
            shape,
            { depth: district.elevation, bevelEnabled: false },
          ]}
        />
        <meshStandardMaterial
          color={district.color}
          transparent
          opacity={hovered ? 0.95 : 0.75}
          emissive={hovered ? district.color : "#000000"}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>
      <Html
        position={[district.center.x, district.elevation + 2, district.center.z]}
        center
        distanceFactor={40}
        style={{ pointerEvents: "none" }}
      >
        <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white">
          {district.nameZh}
        </div>
      </Html>
    </group>
  );
}
