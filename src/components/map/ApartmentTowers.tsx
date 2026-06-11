"use client";

import { type ThreeEvent } from "@react-three/fiber";
import {
  getApartmentTowerColor,
  getApartmentTowerHeight,
  getApartmentTowerPosition,
} from "@/lib/chongqing/street-layout";
import { SketchEdges, ToonFaceMaterial } from "./sketchup-materials";

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

function ApartmentTower({
  building,
  selected,
  onHover,
  onSelect,
}: {
  building: ApartmentBuildingData;
  selected: boolean;
  onHover: (n: number | null) => void;
  onSelect: (n: number) => void;
}) {
  const position = getApartmentTowerPosition(building.buildingNumber);
  const height = getApartmentTowerHeight(
    building.occupiedCount,
    building.totalUnits,
  );
  const color = getApartmentTowerColor(building.occupiedCount);
  const active = selected;

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(building.buildingNumber);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!selected) onHover(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(building.buildingNumber);
  };

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1.1, height, 1.1]} />
        <ToonFaceMaterial
          color={color}
          emissive={active ? "#3a5a7a" : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
        <SketchEdges />
      </mesh>
    </group>
  );
}

export function ApartmentTowers({
  buildings,
  selectedBuildingNumber,
  onBuildingHover,
  onBuildingSelect,
}: ApartmentTowersProps) {
  return (
    <group>
      {buildings.map((b) => (
        <ApartmentTower
          key={b.id}
          building={b}
          selected={selectedBuildingNumber === b.buildingNumber}
          onHover={onBuildingHover ?? (() => {})}
          onSelect={(n) => onBuildingSelect?.(n)}
        />
      ))}
    </group>
  );
}
