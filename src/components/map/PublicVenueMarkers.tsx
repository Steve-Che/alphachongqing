"use client";

import Link from "next/link";
import { Html } from "@react-three/drei";
import type { PublicVenueMapItem } from "@/lib/queries";
import { ToonFaceMaterial } from "./sketchup-materials";

const TYPE_COLORS: Record<string, string> = {
  LIBRARY: "#6b8e9f",
  CONCERT_HALL: "#9f6b8e",
  GALLERY: "#8e9f6b",
  TEAHOUSE: "#9f8e6b",
  SQUARE: "#b84a2f",
  COMMUNITY_HALL: "#a89985",
};

export function PublicVenueMarkers({
  venues,
}: {
  venues: PublicVenueMapItem[];
}) {
  return (
    <group>
      {venues.map((v) => {
        const isCommunity = v.tier === "COMMUNITY";
        const h = isCommunity ? 3 : 5;
        const w = isCommunity ? 2.5 : 4;
        const color = TYPE_COLORS[v.type] ?? "#a89985";

        return (
          <group key={v.slug} position={[v.mapX, h / 2, v.mapZ]}>
            <mesh>
              <boxGeometry args={[w, h, w]} />
              <ToonFaceMaterial color={color} />
            </mesh>
            <Html
              center
              distanceFactor={80}
              position={[0, h / 2 + 1.5, 0]}
              style={{ pointerEvents: "auto" }}
            >
              <Link
                href={`/place/${v.slug}`}
                className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-stone-800 shadow hover:bg-white"
              >
                {v.nameZh}
              </Link>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
