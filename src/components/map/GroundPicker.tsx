"use client";

import { useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { findDistrictAt, findStreetAt } from "@/lib/chongqing/pick";
import type { MapLevel } from "@/lib/chongqing/camera";

type StreetPick = {
  slug: string;
  districtSlug: string;
  sortOrder: number;
};

type GroundPickerProps = {
  level: MapLevel;
  districtSlug: string | null;
  streets: StreetPick[];
  onDistrictHover: (slug: string | null) => void;
  onDistrictSelect: (slug: string) => void;
  onStreetHover: (slug: string | null) => void;
  onStreetSelect: (slug: string) => void;
};

export function GroundPicker({
  level,
  districtSlug,
  streets,
  onDistrictHover,
  onDistrictSelect,
  onStreetHover,
  onStreetSelect,
}: GroundPickerProps) {
  const lastDistrict = useRef<string | null>(null);
  const lastStreet = useRef<string | null>(null);

  const pickAt = (point: THREE.Vector3) => {
    const x = point.x;
    const z = point.z;

    if (level === "city") {
      const district = findDistrictAt(x, z);
      const slug = district?.slug ?? null;
      if (slug !== lastDistrict.current) {
        lastDistrict.current = slug;
        onDistrictHover(slug);
        document.body.style.cursor = slug ? "pointer" : "auto";
      }
      return { districtSlug: slug, streetSlug: null as string | null };
    }

    if (level === "district" && districtSlug) {
      const scoped = streets.filter((s) => s.districtSlug === districtSlug);
      const streetSlug = findStreetAt(x, z, scoped);
      if (streetSlug !== lastStreet.current) {
        lastStreet.current = streetSlug;
        onStreetHover(streetSlug);
        document.body.style.cursor = streetSlug ? "pointer" : "auto";
      }
      return { districtSlug: null, streetSlug };
    }

    return { districtSlug: null, streetSlug: null };
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    pickAt(e.point);
  };

  const handlePointerOut = () => {
    if (level === "city") {
      lastDistrict.current = null;
      onDistrictHover(null);
    } else if (level === "district") {
      lastStreet.current = null;
      onStreetHover(null);
    }
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { districtSlug: dSlug, streetSlug } = pickAt(e.point);
    if (level === "city" && dSlug) onDistrictSelect(dSlug);
    if (level === "district" && streetSlug) onStreetSelect(streetSlug);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.05, 0]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      renderOrder={10}
    >
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
