"use client";

import { useEffect, useState } from "react";
import { CityMapLoader, type MapDistrictData } from "@/components/map/CityMapLoader";
import { CityMap2D, type Map2DDistrictData } from "@/components/map/CityMap2D";
import { DistrictList } from "@/components/map/DistrictList";

type DistrictListItem = Parameters<typeof DistrictList>[0]["districts"][number];
type DistrictStatsMap = NonNullable<
  Parameters<typeof DistrictList>[0]["statsBySlug"]
>;

type MapMode = "3d" | "2d" | "list";

export function MapViewToggle({
  mapData,
  districtList,
  statsBySlug,
}: {
  mapData: Map2DDistrictData[];
  districtList: DistrictListItem[];
  statsBySlug?: DistrictStatsMap;
}) {
  const [mode, setMode] = useState<MapMode>("3d");
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglFailed(true);
    } catch {
      setWebglFailed(true);
    }
  }, []);

  const effectiveMode: MapMode = webglFailed
    ? mode === "3d"
      ? "2d"
      : mode
    : mode;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold">城市地图</h2>
        <div className="flex gap-1 rounded border border-stone-200 bg-paper p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("3d")}
            disabled={webglFailed}
            className={`rounded px-2 py-1 ${
              effectiveMode === "3d"
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
            aria-label="三维地图模式"
          >
            3D 地图
          </button>
          <button
            type="button"
            onClick={() => setMode("2d")}
            className={`rounded px-2 py-1 ${
              effectiveMode === "2d"
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
            aria-label="平面地图模式"
          >
            2D 地图
          </button>
          <button
            type="button"
            onClick={() => setMode("list")}
            className={`rounded px-2 py-1 ${
              effectiveMode === "list"
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
            aria-label="列表浏览模式"
          >
            列表浏览
          </button>
        </div>
      </div>
      {webglFailed && (
        <p className="mb-2 text-xs text-amber-800">
          当前设备不支持 WebGL，已推荐使用 2D 平面地图。
        </p>
      )}
      {effectiveMode === "3d" ? (
        <CityMapLoader districts={mapData as MapDistrictData[]} />
      ) : effectiveMode === "2d" ? (
        <CityMap2D districts={mapData} />
      ) : (
        <DistrictList districts={districtList} statsBySlug={statsBySlug} />
      )}
    </div>
  );
}
