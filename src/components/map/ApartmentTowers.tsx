"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  getApartmentTowerColor,
  getApartmentTowerHeight,
  getApartmentTowerPosition,
} from "@/lib/chongqing/street-layout";

export type ApartmentBuildingData = {
  id: string;
  buildingNumber: number;
  occupiedCount: number;
  totalUnits: number;
  sampleUnitId?: string | null;
};

type ApartmentTowersProps = {
  buildings: ApartmentBuildingData[];
  selectedBuildingNumber?: number | null;
  onBuildingHover?: (buildingNumber: number | null) => void;
  onBuildingSelect?: (buildingNumber: number | null) => void;
};

export function ApartmentTowers({
  buildings,
  selectedBuildingNumber,
  onBuildingHover,
  onBuildingSelect,
}: ApartmentTowersProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const instanceData = useMemo(
    () =>
      buildings.map((building) => {
        const position = getApartmentTowerPosition(building.buildingNumber);
        const height = getApartmentTowerHeight(
          building.occupiedCount,
          building.totalUnits,
        );
        const color = getApartmentTowerColor(building.occupiedCount);
        return { building, position, height, color };
      }),
    [buildings],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    instanceData.forEach((data, i) => {
      const active = selectedBuildingNumber === data.building.buildingNumber;
      tempObject.position.set(
        data.position[0],
        data.height / 2,
        data.position[2],
      );
      tempObject.scale.set(1.1, data.height, 1.1);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);

      tempColor.set(active ? "#5a8ab0" : data.color);
      mesh.setColorAt(i, tempColor);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceData, selectedBuildingNumber, tempObject, tempColor]);

  if (buildings.length === 0) return null;

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id !== undefined) {
      onBuildingHover?.(buildings[id].buildingNumber);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id !== undefined && selectedBuildingNumber !== buildings[id].buildingNumber) {
      onBuildingHover?.(null);
    }
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id !== undefined) {
      onBuildingSelect?.(buildings[id].buildingNumber);
    }
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}
