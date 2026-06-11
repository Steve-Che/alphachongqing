import { DISTRICTS, type GeoPoint } from "./geo";

/** 每区 8 条街：2 行 × 4 列对称网格 */
export const STREET_GRID_COLS = 4;
export const STREET_GRID_ROWS = 2;
export const STREET_GRID_SPACING_X = 6.2;
export const STREET_GRID_SPACING_Z = 5.2;

/** 街道块 3D 尺寸与拾取半径 */
export const STREET_MARKER_SIZE = { width: 4.2, height: 0.75, depth: 2 } as const;
export const STREET_PICK_RADIUS = 2.75;

export function getStreetWorldPosition(
  districtSlug: string,
  sortOrder: number,
): GeoPoint {
  const district = DISTRICTS.find((d) => d.slug === districtSlug);
  if (!district) return { x: 0, z: 0 };

  const col = sortOrder % STREET_GRID_COLS;
  const row = Math.floor(sortOrder / STREET_GRID_COLS);
  const offsetX = (col - (STREET_GRID_COLS - 1) / 2) * STREET_GRID_SPACING_X;
  const offsetZ = (row - (STREET_GRID_ROWS - 1) / 2) * STREET_GRID_SPACING_Z;

  return {
    x: district.center.x + offsetX,
    z: district.center.z + offsetZ,
  };
}
