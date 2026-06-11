"use client";

import { useEffect, useState } from "react";
import { CityMapLoader, type MapDistrictData } from "@/components/map/CityMapLoader";
import { DistrictList } from "@/components/map/DistrictList";

type DistrictListItem = Parameters<typeof DistrictList>[0]["districts"][number];

export function MapViewToggle({
  mapData,
  districtList,
}: {
  mapData: MapDistrictData[];
  districtList: DistrictListItem[];
}) {
  const [mode, setMode] = useState<"3d" | "list">("3d");
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

  const effectiveMode = webglFailed ? "list" : mode;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold">三维城市地图</h2>
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
          当前设备不支持 WebGL，已自动切换为列表模式。
        </p>
      )}
      {effectiveMode === "3d" ? (
        <CityMapLoader districts={mapData} />
      ) : (
        <DistrictList districts={districtList} />
      )}
    </div>
  );
}
