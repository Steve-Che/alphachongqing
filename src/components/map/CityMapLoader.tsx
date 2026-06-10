"use client";

import dynamic from "next/dynamic";
import type { MapDistrictData } from "./CityCanvas";

export const CityMapLoader = dynamic(
  () => import("./CityCanvas").then((m) => m.CityCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[65vh] min-h-[460px] w-full items-center justify-center rounded-lg border border-stone-200 bg-[#c5d4e0] text-stone-600">
        正在加载 3D 城市…
      </div>
    ),
  },
);

export type { MapDistrictData };
