"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { StreetScene, type StreetSlotData } from "./StreetScene";
import type { ApartmentBuildingData } from "./ApartmentTowers";
import { SketchupSceneLighting } from "./sketchup-materials";

type StreetViewProps = {
  streetName: string;
  streetSlug: string;
  slots: StreetSlotData[];
  apartmentBuildings?: ApartmentBuildingData[];
};

export function StreetView({
  streetName,
  streetSlug,
  slots,
  apartmentBuildings = [],
}: StreetViewProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);

  return (
    <div className="h-[40vh] min-h-[280px] w-full rounded-lg border border-stone-200 bg-[#d4ddd0]">
      <Canvas camera={{ position: [14, 12, 14], fov: 48 }}>
        <SketchupSceneLighting />
        <StreetScene
          slots={slots}
          apartmentBuildings={apartmentBuildings}
          selectedBuildingNumber={selectedBuilding}
          onBuildingSelect={setSelectedBuilding}
        />
        <OrbitControls
          enablePan
          enableZoom
          maxPolarAngle={Math.PI / 2.4}
          minDistance={10}
          maxDistance={35}
        />
      </Canvas>
      <p className="sr-only">
        街道三维视图：{streetName}，金色为店铺，蓝灰色后排为公寓楼
      </p>
      {selectedBuilding !== null && (
        <p className="px-3 py-2 text-xs text-stone-600">
          已选中 {selectedBuilding} 号楼 ·{" "}
          <a
            href={`/street/${encodeURIComponent(streetSlug)}#apartment`}
            className="text-accent hover:underline"
          >
            前往选室入住
          </a>
        </p>
      )}
    </div>
  );
}
