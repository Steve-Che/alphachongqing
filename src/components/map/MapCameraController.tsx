"use client";

import { useEffect, useRef } from "react";
import { MapControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import {
  getCameraPreset,
  type CameraPreset,
  type MapLevel,
} from "@/lib/chongqing/camera";
import type { GeoPoint } from "@/lib/chongqing/geo";

const LOCKED_POLAR = Math.PI / 3.2;
const LOCKED_AZIMUTH = Math.PI / 4;

type MapCameraControllerProps = {
  level: MapLevel;
  focusCenter?: GeoPoint | null;
  focusStreet?: GeoPoint | null;
};

function resolvePreset(
  level: MapLevel,
  focusCenter?: GeoPoint | null,
  focusStreet?: GeoPoint | null,
): CameraPreset {
  if (level === "street" && focusStreet) {
    return getCameraPreset("street", { street: focusStreet });
  }
  if (level === "district" && focusCenter) {
    return getCameraPreset("district", { center: focusCenter });
  }
  return getCameraPreset("city");
}

export function MapCameraController({
  level,
  focusCenter,
  focusStreet,
}: MapCameraControllerProps) {
  const controlsRef = useRef<MapControlsImpl>(null);
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3(4, 98, 102));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 4));
  const animating = useRef(false);

  const preset = resolvePreset(level, focusCenter, focusStreet);

  useEffect(() => {
    const next = resolvePreset(level, focusCenter, focusStreet);
    desiredPos.current.set(...next.position);
    desiredTarget.current.set(...next.target);
    animating.current = true;

    const controls = controlsRef.current;
    if (controls) {
      controls.minDistance = next.minDistance;
      controls.maxDistance = next.maxDistance;
    }
  }, [
    level,
    focusCenter?.x,
    focusCenter?.z,
    focusStreet?.x,
    focusStreet?.z,
  ]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !animating.current) return;

    camera.position.lerp(desiredPos.current, 0.08);
    controls.target.lerp(desiredTarget.current, 0.08);
    controls.update();

    const settled =
      camera.position.distanceTo(desiredPos.current) < 0.4 &&
      controls.target.distanceTo(desiredTarget.current) < 0.2;
    if (settled) animating.current = false;
  });

  return (
    <MapControls
      ref={controlsRef}
      enablePan={level !== "street"}
      enableZoom
      enableRotate={false}
      target={preset.target}
      minPolarAngle={LOCKED_POLAR}
      maxPolarAngle={LOCKED_POLAR}
      minAzimuthAngle={LOCKED_AZIMUTH}
      maxAzimuthAngle={LOCKED_AZIMUTH}
      minDistance={preset.minDistance}
      maxDistance={preset.maxDistance}
      screenSpacePanning
    />
  );
}
