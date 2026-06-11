"use client";

import Link from "next/link";
import { encodeRouteSlug, shopPath } from "@/lib/route-slug";
import type { MeResidence } from "@/lib/residence-types";
import { OpenShopForm } from "@/components/shop/OpenShopForm";
import { MoveShopButton } from "@/components/shop/MoveShopButton";
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
  streetName,
  pinned,
  onClear,
  isLoggedIn,
  canOpenShop,
  residence,
}: {
  slot: StreetSlotData | null;
  streetSlug: string;
  streetName?: string;
  pinned?: boolean;
  onClear?: () => void;
  isLoggedIn?: boolean;
  canOpenShop?: boolean;
  residence?: MeResidence | null;
}) {
  if (!slot) return null;

  const occupied = slot.status === "OCCUPIED" && slot.shop;
  const canMoveShop =
    isLoggedIn && residence?.type === "SHOP" && residence.shop;
  const targetStreetName = streetName ?? streetSlug;

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
            href={shopPath(slot.shop!.slug)}
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
          {isLoggedIn && canOpenShop ? (
            <OpenShopForm shopSlotId={slot.id} compact />
          ) : isLoggedIn && canMoveShop ? (
            <MoveShopButton
              targetShopSlotId={slot.id}
              targetStreetName={targetStreetName}
              shopName={residence.shop!.name}
              currentStreetName={residence.shop!.streetName}
              compact
            />
          ) : isLoggedIn ? (
            <p className="mt-2 text-sm text-stone-600">
              你已有公寓。店铺与公寓不可互换，请先在主页释放后再开店。
            </p>
          ) : (
            <p className="mt-2 text-sm text-stone-600">
              <Link
                href={`/login?callbackUrl=/street/${encodeRouteSlug(streetSlug)}`}
                className="text-accent hover:underline"
              >
                登录
              </Link>
              后即可在此开店
            </p>
          )}
          <Link
            href={`/street/${encodeRouteSlug(streetSlug)}`}
            className="mt-3 inline-block text-sm text-stone-500 hover:text-stone-800"
          >
            或前往街道页 →
          </Link>
        </>
      )}
    </div>
  );
}
