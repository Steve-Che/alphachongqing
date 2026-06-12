"use client";

import { sceneToSvg } from "@/lib/chongqing/map2d-geometry";
import type { PublicVenueMapItem } from "@/lib/queries";

const TYPE_SYMBOL: Record<string, string> = {
  LIBRARY: "书",
  CONCERT_HALL: "♪",
  GALLERY: "展",
  TEAHOUSE: "茶",
  SQUARE: "场",
  COMMUNITY_HALL: "社",
};

export function PublicVenueMapMarkers2D({
  venues,
}: {
  venues: PublicVenueMapItem[];
}) {
  return (
    <g className="public-venue-markers">
      {venues.map((v) => {
        const { sx, sy } = sceneToSvg(v.mapX, v.mapZ);
        const isCommunity = v.tier === "COMMUNITY";
        const size = isCommunity ? 2.8 : 3.6;
        const symbol = TYPE_SYMBOL[v.type] ?? "·";

        return (
          <a key={v.slug} href={`/place/${v.slug}`}>
            <g className="cursor-pointer">
              <rect
                x={sx - size / 2}
                y={sy - size / 2}
                width={size}
                height={size}
                rx={0.5}
                fill={isCommunity ? "#e8dfd0" : "#b84a2f"}
                stroke="#5c4033"
                strokeWidth={0.25}
                opacity={0.92}
              />
              <text
                x={sx}
                y={sy + 0.8}
                textAnchor="middle"
                className="select-none fill-white text-[2px] font-semibold"
                style={{ fontSize: isCommunity ? "1.8px" : "2.2px" }}
              >
                {symbol}
              </text>
              <title>{v.nameZh}</title>
            </g>
          </a>
        );
      })}
    </g>
  );
}
