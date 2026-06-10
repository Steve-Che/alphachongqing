"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";

export type StreetSlotData = {
  id: string;
  slotIndex: number;
  status: string;
  isCenter: boolean;
  shop?: { name: string; slug: string } | null;
};

type StreetScene3DProps = {
  streetName: string;
  streetSlug: string;
  slots: StreetSlotData[];
  onSlotHover?: (slotId: string | null) => void;
};

function ShopBuilding({
  slot,
  position,
  streetSlug,
  onHover,
}: {
  slot: StreetSlotData;
  position: [number, number, number];
  streetSlug: string;
  onHover: (id: string | null) => void;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const occupied = slot.status === "OCCUPIED";
  const color = slot.isCenter
    ? "#7a6a55"
    : occupied
      ? "#c4a574"
      : "#b8b0a4";
  const height = occupied ? 2.4 : 1.6;

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(slot.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onHover(slot.id);
    if (slot.shop) router.push(`/shop/${slot.shop.slug}`);
    else router.push(`/street/${streetSlug}`);
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
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {(hovered || occupied) && (
        <Html
          position={[0, height + 0.8, 0]}
          center
          distanceFactor={18}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded px-2 py-1 text-[10px] shadow-sm ${
              hovered ? "bg-stone-900 text-white" : "bg-black/70 text-white"
            }`}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function StreetScene3D({
  streetName,
  streetSlug,
  slots,
  onSlotHover,
}: StreetScene3DProps) {
  const shopSlots = slots.filter((s) => !s.isCenter);
  const center = slots.find((s) => s.isCenter);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[36, 10]} />
        <meshStandardMaterial color="#8a9a7a" />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 34]} />
        <meshStandardMaterial color="#b8a88a" />
      </mesh>

      {center && (
        <ShopBuilding
          slot={center}
          position={[0, 0, 0]}
          streetSlug={streetSlug}
          onHover={onSlotHover ?? (() => {})}
        />
      )}

      {shopSlots.map((slot, i) => {
        const side = i < 7 ? -1 : 1;
        const index = i < 7 ? i : i - 7;
        const x = side * 4.2;
        const z = (index - 3) * 3;
        return (
          <ShopBuilding
            key={slot.id}
            slot={slot}
            position={[x, 0, z]}
            streetSlug={streetSlug}
            onHover={onSlotHover ?? (() => {})}
          />
        );
      })}

      <Html position={[0, 6, -14]} center distanceFactor={22}>
        <p className="rounded bg-black/60 px-3 py-1 text-xs text-white">
          {streetName}
        </p>
      </Html>
    </group>
  );
}

export function StreetSlotPanel({
  slot,
  streetSlug,
}: {
  slot: StreetSlotData | null;
  streetSlug: string;
}) {
  if (!slot) return null;

  const occupied = slot.status === "OCCUPIED" && slot.shop;

  return (
    <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
      {occupied ? (
        <>
          <p className="text-xs text-stone-400">营业中</p>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            {slot.shop!.name}
          </h3>
          <Link
            href={`/shop/${slot.shop!.slug}`}
            className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
          >
            进入店铺 →
          </Link>
        </>
      ) : slot.isCenter ? (
        <>
          <p className="text-xs text-stone-400">街心广场</p>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            街坊聚集地
          </h3>
          <Link
            href={`/street/${streetSlug}`}
            className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
          >
            查看街道 →
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs text-stone-400">空铺招租</p>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            铺位 #{slot.slotIndex + 1}
          </h3>
          <Link
            href={`/street/${streetSlug}`}
            className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
          >
            申请开店 →
          </Link>
        </>
      )}
    </div>
  );
}
