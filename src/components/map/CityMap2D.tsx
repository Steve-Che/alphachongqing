"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RIVERS, SCENE_BOUNDS } from "@/lib/chongqing/geo";
import { encodeRouteSlug } from "@/lib/route-slug";
import type { MapDistrictData } from "./CityCanvas";

export type Map2DDistrictData = MapDistrictData & {
  center: { x: number; z: number };
  color: string;
  boundary: { x: number; z: number }[];
};

type MapLevel = "city" | "district";

const VB = 100;
const PAD = 4;

function sceneToSvg(x: number, z: number): { sx: number; sy: number } {
  const span = SCENE_BOUNDS.max - SCENE_BOUNDS.min;
  const sx =
    PAD + ((x - SCENE_BOUNDS.min) / span) * (VB - PAD * 2);
  const sy =
    PAD + ((SCENE_BOUNDS.max - z) / span) * (VB - PAD * 2);
  return { sx, sy };
}

function boundaryToPoints(boundary: { x: number; z: number }[]): string {
  return boundary
    .map((p) => {
      const { sx, sy } = sceneToSvg(p.x, p.z);
      return `${sx},${sy}`;
    })
    .join(" ");
}

function riverToPath(points: { x: number; z: number }[]): string {
  return points
    .map((p, i) => {
      const { sx, sy } = sceneToSvg(p.x, p.z);
      return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
    })
    .join(" ");
}

function streetActivity(street: MapDistrictData["streets"][number]): number {
  const shops = street.slots.filter(
    (s) => !s.isCenter && s.status === "OCCUPIED",
  ).length;
  const apt = street.apartmentsSummary;
  const aptRatio = apt?.totalUnits
    ? apt.occupiedUnits / apt.totalUnits
    : 0;
  return shops + aptRatio * 8;
}

export function CityMap2D({ districts }: { districts: Map2DDistrictData[] }) {
  const [level, setLevel] = useState<MapLevel>("city");
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);

  const district = useMemo(
    () => districts.find((d) => d.slug === districtSlug) ?? null,
    [districts, districtSlug],
  );

  const maxStreetActivity = useMemo(() => {
    if (!district) return 1;
    return Math.max(1, ...district.streets.map(streetActivity));
  }, [district]);

  if (level === "district" && district) {
    return (
      <div className="rounded-lg border border-stone-300 bg-[#f0ebe3] p-4">
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <button
            type="button"
            onClick={() => {
              setLevel("city");
              setDistrictSlug(null);
            }}
            className="hover:text-[#b84a2f] hover:underline"
          >
            城市
          </button>
          <span>/</span>
          <span className="font-medium text-stone-900">{district.nameZh}</span>
        </nav>
        <p className="mb-3 text-xs text-stone-500">
          点击街道进入街景 · 色块越深表示越热闹
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {district.streets.map((street) => {
            const activity = streetActivity(street);
            const intensity = 0.35 + (activity / maxStreetActivity) * 0.65;
            const occupiedShops = street.slots.filter(
              (s) => !s.isCenter && s.status === "OCCUPIED",
            ).length;
            const rentable = street.slots.filter((s) => !s.isCenter).length;

            return (
              <Link
                key={street.slug}
                href={`/street/${encodeRouteSlug(street.slug)}`}
                className="group rounded border border-stone-300 bg-paper p-3 shadow-sm transition hover:border-[#b84a2f]/50 hover:shadow"
                style={{
                  backgroundColor: `color-mix(in srgb, ${district.color} ${Math.round(intensity * 55)}%, #faf6ee)`,
                }}
              >
                <p className="font-serif text-sm font-semibold text-stone-900 group-hover:text-[#b84a2f]">
                  {street.nameZh}
                </p>
                <p className="mt-1 text-[10px] text-stone-600">
                  店铺 {occupiedShops}/{rentable}
                  {street.apartmentsSummary && (
                    <>
                      {" "}
                      · 公寓入住{" "}
                      {Math.round(
                        (street.apartmentsSummary.occupiedUnits /
                          Math.max(street.apartmentsSummary.totalUnits, 1)) *
                          100,
                      )}
                      %
                    </>
                  )}
                </p>
                <span className="mt-2 inline-block text-[10px] text-[#b84a2f] opacity-0 transition group-hover:opacity-100">
                  进入街道 →
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 text-center">
          <Link
            href={`/district/${district.slug}`}
            className="text-xs text-stone-500 hover:text-[#b84a2f] hover:underline"
          >
            查看城区详情页 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-300 bg-[#e8dfd0] p-2">
      <p className="mb-2 text-center text-xs text-stone-600">
        平面城市地图 · 点击区域下钻到街道
      </p>
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="mx-auto block h-auto w-full max-w-2xl"
        role="img"
        aria-label="阿尔法重庆平面地图"
      >
        <rect x={0} y={0} width={VB} height={VB} fill="#e8dfd0" />
        <path
          d={riverToPath(RIVERS.yangtze)}
          fill="none"
          stroke="#6a9ab8"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d={riverToPath(RIVERS.jialing)}
          fill="none"
          stroke="#5a8aa8"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.65}
        />
        {districts.map((d) => {
          const occupied = d.streets.reduce((sum, s) => {
            return (
              sum +
              s.slots.filter((sl) => !sl.isCenter && sl.status === "OCCUPIED")
                .length
            );
          }, 0);
          const { sx, sy } = sceneToSvg(d.center.x, d.center.z);

          return (
            <g key={d.slug}>
              {d.boundary.length > 0 && (
                <polygon
                  points={boundaryToPoints(d.boundary)}
                  fill={d.color}
                  fillOpacity={0.55}
                  stroke="#5a4a3a"
                  strokeWidth={0.4}
                  className="cursor-pointer transition hover:fill-opacity-80"
                  onClick={() => {
                    setDistrictSlug(d.slug);
                    setLevel("district");
                  }}
                />
              )}
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none fill-stone-900 text-[3.5px] font-semibold"
                style={{ fontFamily: "serif" }}
              >
                {d.nameZh.replace("区", "")}
              </text>
              <text
                x={sx}
                y={sy + 3.5}
                textAnchor="middle"
                className="pointer-events-none select-none fill-stone-700 text-[2.5px]"
              >
                {occupied} 铺
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
