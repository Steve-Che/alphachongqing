"use client";

import { getStreetWorldPosition } from "@/lib/chongqing/pick";

export type StreetMarkerData = {
  slug: string;
  nameZh: string;
  districtSlug: string;
  sortOrder: number;
  occupiedCount: number;
  vacantCount: number;
};

type StreetMarkersProps = {
  streets: StreetMarkerData[];
  districtSlug: string;
  hoveredSlug: string | null;
};

export function StreetMarkers({
  streets,
  districtSlug,
  hoveredSlug,
}: StreetMarkersProps) {
  const scoped = streets.filter((s) => s.districtSlug === districtSlug);

  return (
    <group>
      {scoped.map((street) => {
        const pos = getStreetWorldPosition(districtSlug, street.sortOrder);
        const active = hoveredSlug === street.slug;

        return (
          <group key={street.slug} position={[pos.x, 2.5, pos.z]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[4.5, 0.8, 2.2]} />
              <meshStandardMaterial
                color={active ? "#6b5b4f" : "#a89985"}
                emissive={active ? "#4a3f35" : "#000000"}
                emissiveIntensity={active ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 2.8]} />
              <meshStandardMaterial color="#8a9a7a" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
