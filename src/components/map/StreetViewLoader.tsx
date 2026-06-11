"use client";

import dynamic from "next/dynamic";
import type { ApartmentBuildingData } from "./ApartmentTowers";
import type { StreetSlotData } from "./StreetScene";

export type StreetViewLoaderProps = {
  streetName: string;
  streetSlug: string;
  slots: StreetSlotData[];
  apartmentBuildings?: ApartmentBuildingData[];
};

export const StreetViewLoader = dynamic<StreetViewLoaderProps>(
  () => import("./StreetView").then((m) => m.StreetView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[40vh] min-h-[280px] w-full items-center justify-center rounded-lg border border-stone-200 bg-[#d4ddd0] text-sm text-stone-600">
        正在加载街景…
      </div>
    ),
  },
);
