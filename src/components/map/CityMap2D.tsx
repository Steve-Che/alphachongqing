"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MAP2D,
  MAP2D_PATTERN_ID,
  map2dActivityFill,
} from "@/lib/chongqing/map2d-style";
import {
  boundaryToGridCells,
  districtShortName,
  getCityRoadSegments,
  getDistrictStreetLayout,
  getRiverBandPaths,
  polygonArea,
  sceneSegmentToSvg,
  sceneToSvg,
  splitStreetLabel,
} from "@/lib/chongqing/map2d-geometry";
import {
  computeDistrictStats,
  formatDistrictStatsLine,
  formatStreetStatsLine,
} from "@/lib/chongqing/district-stats";
import { encodeRouteSlug } from "@/lib/route-slug";
import type { MapDistrictData } from "./CityCanvas";

export type Map2DDistrictData = MapDistrictData & {
  center: { x: number; z: number };
  color: string;
  boundary: { x: number; z: number }[];
};

type MapLevel = "city" | "district";

const VB = MAP2D.viewBox;

function streetActivity(street: MapDistrictData["streets"][number]): number {
  const shops = street.slots.filter(
    (s) => !s.isCenter && s.status === "OCCUPIED",
  ).length;
  const apt = street.apartmentsSummary;
  const aptRatio = apt?.totalUnits ? apt.occupiedUnits / apt.totalUnits : 0;
  return shops + aptRatio * 8;
}

function MapGridDefs() {
  const size = MAP2D.gridCellSize;
  return (
    <defs>
      <pattern
        id={MAP2D_PATTERN_ID}
        width={size}
        height={size}
        patternUnits="userSpaceOnUse"
      >
        <rect width={size} height={size} fill={MAP2D.bg} />
        <path
          d={`M ${size} 0 L 0 0 0 ${size}`}
          fill="none"
          stroke="#E8E0D4"
          strokeWidth={0.15}
        />
      </pattern>
    </defs>
  );
}

function CityMapLayer({
  districts,
  hoveredSlug,
  onHover,
  onSelectDistrict,
}: {
  districts: Map2DDistrictData[];
  hoveredSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelectDistrict: (slug: string) => void;
}) {
  const roads = useMemo(() => getCityRoadSegments(), []);
  const rivers = useMemo(() => getRiverBandPaths(), []);

  const districtCells = useMemo(
    () =>
      [...districts]
        .sort((a, b) => polygonArea(b.boundary) - polygonArea(a.boundary))
        .map((d) => ({
          slug: d.slug,
          nameZh: d.nameZh,
          cells: boundaryToGridCells(d.boundary),
          center: sceneToSvg(d.center.x, d.center.z),
          stats: computeDistrictStats(d),
        })),
    [districts],
  );

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className="mx-auto block h-auto w-full max-w-2xl"
      role="img"
      aria-label="阿尔法重庆平面地图"
    >
      <MapGridDefs />
      <rect x={0} y={0} width={VB} height={VB} fill={`url(#${MAP2D_PATTERN_ID})`} />

      {rivers.map((river, i) => (
        <path
          key={`river-${i}`}
          d={river.d}
          fill="none"
          stroke={MAP2D.river}
          strokeWidth={river.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
        />
      ))}

      {roads
        .filter((r) => !r.main)
        .map((r, i) => {
          const seg = sceneSegmentToSvg(r.x1, r.z1, r.x2, r.z2);
          return (
            <line
              key={`sec-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={MAP2D.roadSecondary}
              strokeWidth={MAP2D.roadSecondaryWidth}
              strokeLinecap="square"
            />
          );
        })}

      {roads
        .filter((r) => r.main)
        .map((r, i) => {
          const seg = sceneSegmentToSvg(r.x1, r.z1, r.x2, r.z2);
          return (
            <line
              key={`main-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={MAP2D.roadMain}
              strokeWidth={MAP2D.roadMainWidth}
              strokeLinecap="square"
            />
          );
        })}

      {districtCells.map((d) => {
        const isHovered = hoveredSlug === d.slug;

        return (
          <g
            key={`cells-${d.slug}`}
            onMouseEnter={() => onHover(d.slug)}
            onMouseLeave={() => onHover(null)}
          >
            {d.cells.map((cell, ci) => (
              <rect
                key={`${d.slug}-${ci}`}
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                fill={isHovered ? MAP2D.blockHover : MAP2D.block}
                stroke={MAP2D.blockStroke}
                strokeWidth={0.2}
                className="map-retro-block cursor-pointer"
                onClick={() => onSelectDistrict(d.slug)}
              />
            ))}
          </g>
        );
      })}

      {districtCells.map((d) => {
        const short = districtShortName(d.nameZh);

        return (
          <g key={`labels-${d.slug}`} className="pointer-events-none">
            <rect
              x={d.center.sx - 5}
              y={d.center.sy - 7}
              width={10}
              height={3.5}
              rx={0.4}
              fill={MAP2D.tag}
            />
            <text
              x={d.center.sx}
              y={d.center.sy - 5}
              textAnchor="middle"
              className="map-retro-tag select-none"
            >
              {short.slice(0, 2)}
            </text>
            <text
              x={d.center.sx}
              y={d.center.sy + 0.5}
              textAnchor="middle"
              className="map-retro-label select-none font-semibold"
            >
              {short}
            </text>
            <text
              x={d.center.sx}
              y={d.center.sy + 3.8}
              textAnchor="middle"
              className="map-retro-stats select-none"
            >
              店 {d.stats.occupiedShops}/{d.stats.totalShops}
            </text>
            <text
              x={d.center.sx}
              y={d.center.sy + 6.5}
              textAnchor="middle"
              className="map-retro-stats select-none"
            >
              寓 {d.stats.occupiedApartments}/{d.stats.totalApartments}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DistrictMapLayer({
  district,
  maxStreetActivity,
}: {
  district: Map2DDistrictData;
  maxStreetActivity: number;
}) {
  const { blocks, roads } = useMemo(
    () => getDistrictStreetLayout(district.streets),
    [district.streets],
  );

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className="mx-auto block h-auto w-full max-w-2xl"
      role="img"
      aria-label={`${district.nameZh}街道地图`}
    >
      <MapGridDefs />
      <rect x={0} y={0} width={VB} height={VB} fill={`url(#${MAP2D_PATTERN_ID})`} />

      {roads
        .filter((r) => !r.main)
        .map((r, i) => (
          <line
            key={`d-sec-${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={MAP2D.roadSecondary}
            strokeWidth={MAP2D.roadSecondaryWidth}
            strokeLinecap="square"
          />
        ))}

      {roads
        .filter((r) => r.main)
        .map((r, i) => (
          <line
            key={`d-main-${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={MAP2D.roadMain}
            strokeWidth={MAP2D.roadMainWidth}
            strokeLinecap="square"
          />
        ))}

      {blocks.map((block) => {
        const street = district.streets.find((s) => s.slug === block.slug);
        const activity = street ? streetActivity(street) : 0;
        const intensity = 0.2 + (activity / maxStreetActivity) * 0.5;
        const fill = map2dActivityFill(intensity);
        const lines = splitStreetLabel(block.nameZh);
        const href = `/street/${encodeRouteSlug(block.slug)}`;
        const statsLine = street ? formatStreetStatsLine(street) : "";
        const nameOffset = lines.length > 1 ? -2.2 : -1.2;

        return (
          <a key={block.slug} href={href} className="map-retro-block">
            <rect
              x={block.x}
              y={block.y}
              width={block.w}
              height={block.h}
              fill={fill}
              stroke={MAP2D.blockStroke}
              strokeWidth={0.35}
              rx={0.3}
            />
            {lines.map((line, li) => (
              <text
                key={li}
                x={block.x + block.w / 2}
                y={
                  block.y +
                  block.h / 2 +
                  nameOffset +
                  li * 3.2
                }
                textAnchor="middle"
                dominantBaseline="middle"
                className="map-retro-label pointer-events-none select-none"
                style={{ fontSize: lines.length > 1 ? "2.4px" : "2.8px" }}
              >
                {line}
              </text>
            ))}
            {statsLine && (
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 + 4.5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="map-retro-stats pointer-events-none select-none"
              >
                {statsLine}
              </text>
            )}
          </a>
        );
      })}
    </svg>
  );
}

export function CityMap2D({ districts }: { districts: Map2DDistrictData[] }) {
  const [level, setLevel] = useState<MapLevel>("city");
  const [districtSlug, setDistrictSlug] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const district = useMemo(
    () => districts.find((d) => d.slug === districtSlug) ?? null,
    [districts, districtSlug],
  );

  const maxStreetActivity = useMemo(() => {
    if (!district) return 1;
    return Math.max(1, ...district.streets.map(streetActivity));
  }, [district]);

  const goToCity = () => {
    setLevel("city");
    setDistrictSlug(null);
    setHoveredDistrict(null);
  };

  const selectDistrict = (slug: string) => {
    setDistrictSlug(slug);
    setLevel("district");
  };

  if (level === "district" && district) {
    const districtStats = computeDistrictStats(district);

    return (
      <div className="rounded-lg border border-stone-200 bg-[#F5F1E6] p-3">
        <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <button
            type="button"
            onClick={goToCity}
            className="hover:text-[#b84a2f] hover:underline"
          >
            城市
          </button>
          <span>/</span>
          <span className="font-medium text-stone-900">{district.nameZh}</span>
        </nav>
        <p className="mb-1 text-center text-xs font-medium text-stone-700">
          {formatDistrictStatsLine(districtStats)}
        </p>
        <p className="mb-2 text-center text-xs text-stone-500">
          点击街道进入街景 · 色块越深表示越热闹
        </p>
        <DistrictMapLayer
          district={district}
          maxStreetActivity={maxStreetActivity}
        />
        <div className="mt-2 text-center">
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
    <div className="rounded-lg border border-stone-200 bg-[#F5F1E6] p-3">
      <p className="mb-2 text-center text-xs text-stone-500">
        点击城区进入街道网格
      </p>
      <CityMapLayer
        districts={districts}
        hoveredSlug={hoveredDistrict}
        onHover={setHoveredDistrict}
        onSelectDistrict={selectDistrict}
      />
    </div>
  );
}
