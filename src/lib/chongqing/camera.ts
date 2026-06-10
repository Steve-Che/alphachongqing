import type { GeoPoint } from "./geo";

export type MapLevel = "city" | "district" | "street";

export type CameraPreset = {
  position: [number, number, number];
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
};

const CITY_PRESET: CameraPreset = {
  position: [0, 78, 78],
  target: [0, 0, 0],
  minDistance: 42,
  maxDistance: 130,
};

export function getCameraPreset(
  level: MapLevel,
  focus?: { center: GeoPoint } | { street: GeoPoint },
): CameraPreset {
  if (level === "city") return CITY_PRESET;

  if (level === "district" && focus && "center" in focus) {
    const { x, z } = focus.center;
    return {
      position: [x + 32, 44, z + 32],
      target: [x, 0, z],
      minDistance: 20,
      maxDistance: 58,
    };
  }

  if (level === "street" && focus && "street" in focus) {
    const { x, z } = focus.street;
    return {
      position: [x + 16, 24, z + 16],
      target: [x, 0, z],
      minDistance: 8,
      maxDistance: 32,
    };
  }

  return CITY_PRESET;
}
