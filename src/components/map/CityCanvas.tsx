"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, Sky } from "@react-three/drei";
import { DISTRICTS } from "@/lib/chongqing/geo";
import { TerrainLayer } from "./TerrainLayer";
import { RiverLayer } from "./RiverLayer";
import { DistrictMesh } from "./DistrictMesh";

export function CityCanvas() {
  return (
    <div className="h-[60vh] min-h-[400px] w-full rounded-lg border border-stone-200 bg-[#c5d4e0]">
      <Canvas
        camera={{ position: [50, 45, 50], fov: 45, near: 0.1, far: 500 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[30, 50, 20]} intensity={1.2} castShadow />
          <TerrainLayer />
          <RiverLayer />
          {DISTRICTS.map((d) => (
            <DistrictMesh key={d.slug} district={d} />
          ))}
          <MapControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.2}
            minDistance={20}
            maxDistance={120}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
