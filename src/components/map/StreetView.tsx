"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type Slot = {
  id: string;
  slotIndex: number;
  status: string;
  isCenter: boolean;
  shop?: { name: string; slug: string } | null;
};

type StreetViewProps = {
  streetName: string;
  slots: Slot[];
};

function ShopBlock({
  slot,
  position,
}: {
  slot: Slot;
  position: [number, number, number];
}) {
  const occupied = slot.status === "OCCUPIED";
  const color = slot.isCenter ? "#8b7355" : occupied ? "#c4a574" : "#d6d3d1";

  return (
    <mesh position={position}>
      <boxGeometry args={[1.2, occupied ? 2 : 1.5, 1.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function StreetScene({ slots }: { slots: Slot[] }) {
  const shopSlots = slots.filter((s) => !s.isCenter);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#9ca88e" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 30]} />
        <meshStandardMaterial color="#b8a88a" />
      </mesh>
      {shopSlots.map((slot, i) => {
        const side = i < 7 ? -1 : 1;
        const index = i < 7 ? i : i - 7;
        const x = side * 3.5;
        const z = (index - 3) * 2.5;
        return (
          <ShopBlock
            key={slot.id}
            slot={slot}
            position={[x, slot.status === "OCCUPIED" ? 1 : 0.75, z]}
          />
        );
      })}
    </>
  );
}

export function StreetView({ streetName, slots }: StreetViewProps) {
  return (
    <div className="h-[40vh] min-h-[280px] w-full rounded-lg border border-stone-200 bg-[#d4ddd0]">
      <Canvas camera={{ position: [12, 8, 12], fov: 50 }}>
        <StreetScene slots={slots} />
        <OrbitControls
          enablePan
          enableZoom
          maxPolarAngle={Math.PI / 2.5}
          minDistance={8}
          maxDistance={25}
        />
      </Canvas>
      <p className="sr-only">街道三维视图：{streetName}</p>
    </div>
  );
}
