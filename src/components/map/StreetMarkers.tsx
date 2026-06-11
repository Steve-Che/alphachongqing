"use client";

import { getStreetWorldPosition } from "@/lib/chongqing/pick";
import { STREET_MARKER_SIZE } from "@/lib/chongqing/district-street-grid";
import { SketchEdges, ToonFaceMaterial } from "./sketchup-materials";

export type StreetMarkerData = {
  slug: string;
  nameZh: string;
  districtSlug: string;
  sortOrder: number;
  occupiedCount: number;
  vacantCount: number;
  apartmentOccupied?: number;
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
        const hasShops = street.occupiedCount > 0;
        const hasApts = (street.apartmentOccupied ?? 0) > 0;

        return (
          <group key={street.slug} position={[pos.x, 2.5, pos.z]}>
            <mesh position={[0, STREET_MARKER_SIZE.height / 2, 0]}>
              <boxGeometry
                args={[
                  STREET_MARKER_SIZE.width,
                  STREET_MARKER_SIZE.height,
                  STREET_MARKER_SIZE.depth,
                ]}
              />
              <ToonFaceMaterial
                color={
                  active
                    ? "#6b5b4f"
                    : hasShops
                      ? "#c4a574"
                      : hasApts
                        ? "#8aa0b8"
                        : "#a89985"
                }
                emissive={active ? "#4a3f35" : "#000000"}
                emissiveIntensity={active ? 0.3 : 0}
              />
              <SketchEdges />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[STREET_MARKER_SIZE.width + 0.6, STREET_MARKER_SIZE.depth + 0.6]} />
              <ToonFaceMaterial color="#8a9a7a" />
              <SketchEdges threshold={5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
