"use client";

import Link from "next/link";
import { encodeRouteSlug } from "@/lib/route-slug";
import type { ApartmentBuildingData } from "./ApartmentTowers";

export function ApartmentBuildingPanel({
  building,
  streetSlug,
  pinned,
  onClear,
}: {
  building: ApartmentBuildingData | null;
  streetSlug: string;
  pinned?: boolean;
  onClear?: () => void;
}) {
  if (!building) return null;

  const hasResidents = building.occupiedCount > 0;

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

      {hasResidents && building.sampleUnitId ? (
        <Link
          href={`/apartment/${building.sampleUnitId}`}
          className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
        >
          查看住户 →
        </Link>
      ) : (
        <Link
          href={`/street/${encodeRouteSlug(streetSlug)}#apartment`}
          className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
        >
          选此楼入住 →
        </Link>
      )}
    </div>
  );
}
