"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { DISTRICTS } from "@/lib/chongqing/geo";
import type { MapLevel } from "@/lib/chongqing/camera";
import { getStreetWorldPosition } from "@/lib/chongqing/pick";
import { TerrainLayer } from "./TerrainLayer";
import { RiverLayer } from "./RiverLayer";
import { DistrictMesh } from "./DistrictMesh";
import { GroundPicker } from "./GroundPicker";
import { MapCameraController } from "./MapCameraController";
import { StreetMarkers, type StreetMarkerData } from "./StreetMarkers";
import {
  StreetScene3D,
  StreetSlotPanel,
  type StreetSlotData,
} from "./StreetScene3D";
import { MapCanvasSetup } from "./MapCanvasSetup";

export type MapStreetData = {
  slug: string;
  nameZh: string;
  sortOrder: number;
  districtSlug: string;
  slots: StreetSlotData[];
};

export type MapDistrictData = {
  slug: string;
  nameZh: string;
  summary: string | null;
  streets: MapStreetData[];
};

type CityCanvasProps = {
  districts?: MapDistrictData[];
};

export function CityCanvas({ districts = [] }: CityCanvasProps) {
  const [level, setLevel] = useState<MapLevel>("city");
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);
  const [streetSlug, setStreetSlug] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [hoveredStreet, setHoveredStreet] = useState<string | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  const streetMarkers: StreetMarkerData[] = useMemo(
    () =>
      districts.flatMap((d) =>
        d.streets.map((s) => ({
          slug: s.slug,
          nameZh: s.nameZh,
          districtSlug: d.slug,
          sortOrder: s.sortOrder,
          occupiedCount: s.slots.filter(
            (sl) => !sl.isCenter && sl.status === "OCCUPIED",
          ).length,
          vacantCount: s.slots.filter(
            (sl) => !sl.isCenter && sl.status !== "OCCUPIED",
          ).length,
        })),
      ),
    [districts],
  );

  const streetPickList = useMemo(
    () =>
      districts.flatMap((d) =>
        d.streets.map((s) => ({
          slug: s.slug,
          districtSlug: d.slug,
          sortOrder: s.sortOrder,
        })),
      ),
    [districts],
  );

  const activeDistrictSlug =
    level === "city" ? hoveredDistrict : districtSlug;
  const activeStreetSlug = level === "district" ? hoveredStreet : streetSlug;

  const districtGeo = DISTRICTS.find((d) => d.slug === activeDistrictSlug);
  const districtMeta = districts.find((d) => d.slug === activeDistrictSlug);
  const streetData = districts
    .flatMap((d) => d.streets)
    .find((s) => s.slug === activeStreetSlug);
  const hoveredSlot =
    streetData?.slots.find((s) => s.id === hoveredSlotId) ?? null;

  const focusCenter = useMemo(() => {
    if (!districtSlug) return null;
    return DISTRICTS.find((d) => d.slug === districtSlug)?.center ?? null;
  }, [districtSlug]);

  const streetSortOrder = useMemo(() => {
    if (!streetSlug || !districtSlug) return null;
    const district = districts.find((d) => d.slug === districtSlug);
    return district?.streets.find((s) => s.slug === streetSlug)?.sortOrder ?? 0;
  }, [streetSlug, districtSlug, districts]);

  const focusStreet = useMemo(() => {
    if (!districtSlug || streetSortOrder === null) return null;
    return getStreetWorldPosition(districtSlug, streetSortOrder);
  }, [districtSlug, streetSortOrder]);

  const enterDistrict = (slug: string) => {
    setDistrictSlug(slug);
    setStreetSlug(null);
    setHoveredStreet(null);
    setHoveredSlotId(null);
    setLevel("district");
  };

  const enterStreet = (slug: string) => {
    setStreetSlug(slug);
    setHoveredSlotId(null);
    setLevel("street");
  };

  const backToCity = () => {
    setLevel("city");
    setDistrictSlug(null);
    setStreetSlug(null);
    setHoveredDistrict(null);
    setHoveredStreet(null);
    setHoveredSlotId(null);
  };

  const backToDistrict = () => {
    setLevel("district");
    setStreetSlug(null);
    setHoveredStreet(null);
    setHoveredSlotId(null);
  };

  const hint =
    level === "city"
      ? "固定视角 · 滚轮缩放 · 点击区域进入城区"
      : level === "district"
        ? "滚轮缩放 · 点击街道块下钻到街景"
        : "滚轮缩放至铺面 · 悬停/点击店铺查看详情";

  return (
    <div className="relative">
      <div className="h-[65vh] min-h-[460px] w-full rounded-lg border border-stone-200 bg-[#c5d4e0]">
        <Canvas
          camera={{ position: [0, 78, 78], fov: 42, near: 0.1, far: 500 }}
          gl={{ antialias: true }}
          style={{ touchAction: "none" }}
        >
          <Suspense fallback={null}>
            <MapCanvasSetup />
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[30, 50, 20]} intensity={1.1} />
            <TerrainLayer />
            <RiverLayer />

            {level !== "street" &&
              DISTRICTS.map((d) => (
                <DistrictMesh
                  key={d.slug}
                  district={d}
                  hovered={hoveredDistrict === d.slug}
                  highlighted={districtSlug === d.slug && level === "district"}
                  dimmed={
                    level === "district" && districtSlug !== d.slug
                  }
                />
              ))}

            {level === "district" && districtSlug && (
              <StreetMarkers
                streets={streetMarkers}
                districtSlug={districtSlug}
                hoveredSlug={hoveredStreet}
              />
            )}

            {level === "street" && streetData && focusStreet && (
              <group position={[focusStreet.x, 0, focusStreet.z]}>
                <StreetScene3D
                  streetName={streetData.nameZh}
                  streetSlug={streetData.slug}
                  slots={streetData.slots}
                  onSlotHover={setHoveredSlotId}
                />
              </group>
            )}

            {level !== "street" && (
              <GroundPicker
                level={level}
                districtSlug={districtSlug}
                streets={streetPickList}
                onDistrictHover={setHoveredDistrict}
                onDistrictSelect={enterDistrict}
                onStreetHover={setHoveredStreet}
                onStreetSelect={enterStreet}
              />
            )}

            <MapCameraController
              level={level}
              focusCenter={focusCenter}
              focusStreet={focusStreet}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="rounded bg-white/90 px-3 py-2 text-xs text-stone-600 shadow-sm backdrop-blur-sm">
            {hint}
          </div>
          {level !== "city" && (
            <button
              type="button"
              onClick={level === "street" ? backToDistrict : backToCity}
              className="pointer-events-auto rounded bg-white/90 px-3 py-2 text-xs text-stone-700 shadow-sm backdrop-blur-sm hover:bg-white"
            >
              ← {level === "street" ? "返回城区" : "返回全城"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {(level === "city" || level === "district") &&
            activeDistrictSlug &&
            districtGeo && (
              <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
                <nav className="mb-2 text-xs text-stone-400">
                  阿尔法重庆
                  {level === "district" && (
                    <>
                      {" "}
                      / {districtMeta?.nameZh ?? districtGeo.nameZh}
                    </>
                  )}
                </nav>
                <p className="text-xs text-stone-400">
                  {level === "city" ? "悬停区域" : "当前城区"}
                </p>
                <h3 className="font-serif text-lg font-semibold text-stone-900">
                  {districtMeta?.nameZh ?? districtGeo.nameZh}
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  {districtMeta?.summary ?? districtGeo.summary}
                </p>
                {level === "city" ? (
                  <button
                    type="button"
                    onClick={() => enterDistrict(activeDistrictSlug)}
                    className="mt-3 rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
                  >
                    进入{districtMeta?.nameZh ?? districtGeo.nameZh} →
                  </button>
                ) : (
                  <Link
                    href={`/district/${activeDistrictSlug}`}
                    className="mt-3 inline-block rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    打开城区页面
                  </Link>
                )}
              </div>
            )}

          {level === "district" && activeStreetSlug && streetData && (
            <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
              <p className="text-xs text-stone-400">街道</p>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                {streetData.nameZh}
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                {streetData.slots.filter((s) => s.status === "OCCUPIED").length}{" "}
                家店铺营业中，点击进入街景
              </p>
              <button
                type="button"
                onClick={() => enterStreet(activeStreetSlug)}
                className="mt-3 rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
              >
                下钻到{streetData.nameZh} →
              </button>
            </div>
          )}

          {level === "street" && streetData && (
            <StreetSlotPanel
              slot={hoveredSlot ?? streetData.slots.find((s) => s.shop) ?? null}
              streetSlug={streetData.slug}
            />
          )}
        </div>
      </div>
    </div>
  );
}
