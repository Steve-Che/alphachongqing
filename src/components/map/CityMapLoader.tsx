"use client";

import dynamic from "next/dynamic";
import type { DistrictMeta } from "./CityCanvas";

export const CityMapLoader = dynamic(
  () => import("./CityCanvas").then((m) => m.CityCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60vh] min-h-[420px] w-full items-center justify-center rounded-lg border border-stone-200 bg-[#c5d4e0] text-stone-600">
        正在加载 3D 城市…
      </div>
    ),
  },
);

export type { DistrictMeta };
