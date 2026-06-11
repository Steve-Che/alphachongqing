"use client";

import { type ThreeEvent } from "@react-three/fiber";
import {
  STREET_GROUND_SIZE,
  STREET_ROAD_SIZE,
  getStreetSlotPosition,
} from "@/lib/chongqing/street-layout";
import {
  ApartmentTowers,
  type ApartmentBuildingData,
} from "./ApartmentTowers";
import { SketchEdges, ToonFaceMaterial } from "./sketchup-materials";

export type StreetSlotData = {
  id: string;
  slotIndex: number;
  status: string;
  isCenter: boolean;
  shop?: { name: string; slug: string } | null;
};

type StreetSceneProps = {
  slots: StreetSlotData[];
  apartmentBuildings?: ApartmentBuildingData[];
  selectedSlotId?: string | null;
  selectedBuildingNumber?: number | null;
  onSlotHover?: (slotId: string | null) => void;
  onSlotSelect?: (slotId: string | null) => void;
  onBuildingHover?: (buildingNumber: number | null) => void;
  onBuildingSelect?: (buildingNumber: number | null) => void;
};

function ShopBuilding({
  slot,
  position,
  selected,
  onHover,
  onSelect,
}: {
  slot: StreetSlotData;
  position: [number, number, number];
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const occupied = slot.status === "OCCUPIED";
  const active = selected;
  const color = slot.isCenter
    ? "#7a6a55"
    : occupied
      ? "#c4a574"
      : "#b8b0a4";
  const height = occupied ? 2.4 : 1.6;

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(slot.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!selected) onHover(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(slot.id);
  };

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1.8, height, 1.8]} />
        <ToonFaceMaterial
          color={color}
          emissive={active ? color : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
        <SketchEdges />
      </mesh>
    </group>
  );
}

export function StreetScene({
  slots,
  apartmentBuildings = [],
  selectedSlotId,
  selectedBuildingNumber,
  onSlotHover,
  onSlotSelect,
  onBuildingHover,
  onBuildingSelect,
}: StreetSceneProps) {
  const shopSlots = slots.filter((s) => !s.isCenter);
  const center = slots.find((s) => s.isCenter);

  const clearSelection = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSlotSelect?.(null);
    onSlotHover?.(null);
    onBuildingSelect?.(null);
    onBuildingHover?.(null);
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={clearSelection}
      >
        <planeGeometry args={STREET_GROUND_SIZE} />
        <ToonFaceMaterial color="#8a9a7a" />
        <SketchEdges threshold={5} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={STREET_ROAD_SIZE} />
        <ToonFaceMaterial color="#b8a88a" />
        <SketchEdges threshold={5} />
      </mesh>

      {apartmentBuildings.length > 0 && (
        <ApartmentTowers
          buildings={apartmentBuildings}
          selectedBuildingNumber={selectedBuildingNumber}
          onBuildingHover={onBuildingHover}
          onBuildingSelect={onBuildingSelect}
        />
      )}

      {center && (
        <ShopBuilding
          slot={center}
          position={[0, 0, 0]}
          selected={selectedSlotId === center.id}
          onHover={onSlotHover ?? (() => {})}
          onSelect={(id) => onSlotSelect?.(id)}
        />
      )}

      {shopSlots.map((slot, i) => (
        <ShopBuilding
          key={slot.id}
          slot={slot}
          position={getStreetSlotPosition(i)}
          selected={selectedSlotId === slot.id}
          onHover={onSlotHover ?? (() => {})}
          onSelect={(id) => onSlotSelect?.(id)}
        />
      ))}
    </group>
  );
}
