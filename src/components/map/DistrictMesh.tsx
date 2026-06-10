"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { DistrictGeo } from "@/lib/chongqing/geo";

type DistrictMeshProps = {
  district: DistrictGeo;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
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

export function DistrictMesh({ district, onHover, onSelect }: DistrictMeshProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const shape = useMemo(() => buildShape(district.boundary), [district.boundary]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(district.slug);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(district.slug);
    router.push(`/district/${district.slug}`);
  };

  const y = district.elevation + 0.15;

  return (
    <group>
      {/* 可点击的平面区划（XZ 平面，与地理坐标一致） */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, y, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        renderOrder={2}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={district.color}
          transparent
          opacity={hovered ? 0.92 : 0.78}
          emissive={district.color}
          emissiveIntensity={hovered ? 0.25 : 0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 立体侧边（不参与点击检测） */}
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
          opacity={0.55}
        />
      </mesh>

      <Html
        position={[district.center.x, y + 1.5, district.center.z]}
        center
        distanceFactor={45}
        style={{ pointerEvents: "none" }}
        zIndexRange={[100, 0]}
      >
        <div
          className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium shadow-sm transition-all ${
            hovered
              ? "bg-stone-900 text-white scale-105"
              : "bg-black/75 text-white"
          }`}
        >
          {district.nameZh}
        </div>
      </Html>
    </group>
  );
}
