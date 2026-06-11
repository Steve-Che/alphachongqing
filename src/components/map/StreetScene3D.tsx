"use client";

import Link from "next/link";
import { encodeRouteSlug } from "@/lib/route-slug";
import { StreetScene, type StreetSlotData } from "./StreetScene";
import type { ApartmentBuildingData } from "./ApartmentTowers";

export type { StreetSlotData };

type StreetScene3DProps = {
  slots: StreetSlotData[];
  apartmentBuildings?: ApartmentBuildingData[];
  selectedSlotId?: string | null;
  selectedBuildingNumber?: number | null;
  onSlotHover?: (slotId: string | null) => void;
  onSlotSelect?: (slotId: string | null) => void;
  onBuildingHover?: (buildingNumber: number | null) => void;
  onBuildingSelect?: (buildingNumber: number | null) => void;
};

export function StreetScene3D({
  slots,
  apartmentBuildings = [],
  selectedSlotId,
  selectedBuildingNumber,
  onSlotHover,
  onSlotSelect,
  onBuildingHover,
  onBuildingSelect,
}: StreetScene3DProps) {
  return (
    <StreetScene
      slots={slots}
      apartmentBuildings={apartmentBuildings}
      selectedSlotId={selectedSlotId}
      selectedBuildingNumber={selectedBuildingNumber}
      onSlotHover={onSlotHover}
      onSlotSelect={onSlotSelect}
      onBuildingHover={onBuildingHover}
      onBuildingSelect={onBuildingSelect}
    />
  );
}

export function StreetSlotPanel({
  slot,
  streetSlug,
  pinned,
  onClear,
}: {
  slot: StreetSlotData | null;
  streetSlug: string;
  pinned?: boolean;
  onClear?: () => void;
}) {
  if (!slot) return null;

  const occupied = slot.status === "OCCUPIED" && slot.shop;

  return (
    <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
      {pinned && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-stone-400">已选中铺位</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              取消选择
            </button>
          )}
        </div>
      )}

      {occupied ? (
        <>
          <p className="text-xs text-stone-400">营业中</p>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            {slot.shop!.name}
          </h3>
          <Link
            href={`/shop/${encodeRouteSlug(slot.shop!.slug)}`}
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
            href={`/street/${encodeRouteSlug(streetSlug)}`}
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
          <p className="mt-1 text-sm text-stone-600">
            点击左侧「申请开店」前往街道页完成入驻
          </p>
          <Link
            href={`/street/${encodeRouteSlug(streetSlug)}`}
            className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
          >
            申请开店 →
          </Link>
        </>
      )}
    </div>
  );
}
