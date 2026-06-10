"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { StreetScene, type StreetSlotData } from "./StreetScene";

type StreetViewProps = {
  streetName: string;
  slots: StreetSlotData[];
};

export function StreetView({ streetName, slots }: StreetViewProps) {
  return (
    <div className="h-[40vh] min-h-[280px] w-full rounded-lg border border-stone-200 bg-[#d4ddd0]">
      <Canvas camera={{ position: [12, 8, 12], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 5]} intensity={1} />
        <StreetScene slots={slots} showSlotLabels={false} />
        <OrbitControls
          enablePan
          enableZoom
          maxPolarAngle={Math.PI / 2.5}
          minDistance={8}
          maxDistance={25}
        />
      </Canvas>
      <p className="sr-only">街道三维视图：{streetName}</p>
    </div>
  );
}
