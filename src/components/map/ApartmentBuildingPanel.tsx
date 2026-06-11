"use client";

import { ApartmentRentPanel } from "./ApartmentRentPanel";
import type { ApartmentBuildingData } from "./ApartmentTowers";

export function ApartmentBuildingPanel({
  building,
  streetSlug,
  pinned,
  onClear,
  isLoggedIn,
  canRent,
}: {
  building: ApartmentBuildingData | null;
  streetSlug: string;
  pinned?: boolean;
  onClear?: () => void;
  isLoggedIn?: boolean;
  canRent?: boolean;
}) {
  if (!building) return null;

  return (
    <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
      {pinned && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-stone-400">已选中公寓楼</span>
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

      <p className="text-xs text-stone-400">公寓楼</p>
      <h3 className="font-serif text-lg font-semibold text-stone-900">
        {building.buildingNumber} 号楼
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        入住 {building.occupiedCount}/{building.totalUnits} 户
      </p>

      <div className="mt-3">
        <ApartmentRentPanel
          building={building}
          streetSlug={streetSlug}
          isLoggedIn={isLoggedIn}
          canRent={canRent}
        />
      </div>
    </div>
  );
}
