"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { MapControls, Sky } from "@react-three/drei";
import { DISTRICTS } from "@/lib/chongqing/geo";
import { TerrainLayer } from "./TerrainLayer";
import { RiverLayer } from "./RiverLayer";
import { DistrictMesh } from "./DistrictMesh";

export type DistrictMeta = {
  slug: string;
  nameZh: string;
  summary: string | null;
};

type CityCanvasProps = {
  districts?: DistrictMeta[];
};

export function CityCanvas({ districts = [] }: CityCanvasProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const activeSlug = hoveredSlug ?? selectedSlug;
  const geo = DISTRICTS.find((d) => d.slug === activeSlug);
  const meta = districts.find((d) => d.slug === activeSlug);

  return (
    <div className="relative">
      <div className="h-[60vh] min-h-[420px] w-full rounded-lg border border-stone-200 bg-[#c5d4e0]">
        <Canvas
          camera={{ position: [0, 55, 55], fov: 42, near: 0.1, far: 500 }}
          gl={{ antialias: true }}
          style={{ touchAction: "none" }}
        >
          <Suspense fallback={null}>
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[30, 50, 20]} intensity={1.1} />
            <TerrainLayer />
            <RiverLayer />
            {DISTRICTS.map((d) => (
              <DistrictMesh
                key={d.slug}
                district={d}
                onHover={setHoveredSlug}
                onSelect={setSelectedSlug}
              />
            ))}
            <MapControls
              enablePan
              enableZoom
              enableRotate
              target={[0, 0, 0]}
              maxPolarAngle={Math.PI / 2.1}
              minDistance={25}
              maxDistance={100}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="rounded bg-white/90 px-3 py-2 text-xs text-stone-600 shadow-sm backdrop-blur-sm">
          拖动旋转 · 滚轮缩放 · <strong>点击彩色区域</strong>进入对应城区
        </div>

        {activeSlug && geo && (
          <div className="pointer-events-auto max-w-sm rounded-lg border border-stone-200 bg-paper/95 p-4 shadow-md backdrop-blur-sm">
            <p className="text-xs text-stone-400">选中区域</p>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              {meta?.nameZh ?? geo.nameZh}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              {meta?.summary ?? geo.summary}
            </p>
            <Link
              href={`/district/${activeSlug}`}
              className="mt-3 inline-block rounded bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
            >
              进入{meta?.nameZh ?? geo.nameZh} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
