"use client";

import { Html } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import {
  STREET_GROUND_SIZE,
  STREET_ROAD_SIZE,
  getStreetSlotPosition,
} from "@/lib/chongqing/street-layout";

export type StreetSlotData = {
  id: string;
  slotIndex: number;
  status: string;
  isCenter: boolean;
  shop?: { name: string; slug: string } | null;
};

type StreetSceneProps = {
  slots: StreetSlotData[];
  selectedSlotId?: string | null;
  onSlotHover?: (slotId: string | null) => void;
  onSlotSelect?: (slotId: string | null) => void;
  showSlotLabels?: boolean;
};

function ShopBuilding({
  slot,
  position,
  selected,
  onHover,
  onSelect,
  showLabel,
}: {
  slot: StreetSlotData;
  position: [number, number, number];
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  showLabel?: boolean;
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

  const label = slot.isCenter
    ? "街心"
    : occupied && slot.shop
      ? slot.shop.name
      : `空铺 #${slot.slotIndex + 1}`;

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1.8, height, 1.8]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? color : "#000000"}
          emissiveIntensity={active ? 0.4 : 0}
        />
      </mesh>
      {showLabel && (active || occupied) && (
        <Html
          position={[0, height + 0.8, 0]}
          center
          distanceFactor={18}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded px-2 py-1 text-[10px] shadow-sm ${
              active
                ? "bg-stone-900 text-white ring-2 ring-white/80"
                : "bg-black/70 text-white"
            }`}
          >
            {label}
            {!occupied && active && (
              <span className="ml-1 opacity-80">· 已选中</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function StreetScene({
  slots,
  selectedSlotId,
  onSlotHover,
  onSlotSelect,
  showSlotLabels = true,
}: StreetSceneProps) {
  const shopSlots = slots.filter((s) => !s.isCenter);
  const center = slots.find((s) => s.isCenter);

  const clearSelection = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSlotSelect?.(null);
    onSlotHover?.(null);
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={clearSelection}
      >
        <planeGeometry args={STREET_GROUND_SIZE} />
        <meshStandardMaterial color="#8a9a7a" />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={STREET_ROAD_SIZE} />
        <meshStandardMaterial color="#b8a88a" />
      </mesh>

      {center && (
        <ShopBuilding
          slot={center}
          position={[0, 0, 0]}
          selected={selectedSlotId === center.id}
          onHover={onSlotHover ?? (() => {})}
          onSelect={(id) => onSlotSelect?.(id)}
          showLabel={showSlotLabels}
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
          showLabel={showSlotLabels}
        />
      ))}
    </group>
  );
}
