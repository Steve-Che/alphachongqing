import { DISTRICTS, type DistrictGeo, type GeoPoint } from "./geo";

/** 射线法判断点是否在多边形内 */
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const zi = polygon[i].z;
    const xj = polygon[j].x;
    const zj = polygon[j].z;
    const intersect =
      zi > point.z !== zj > point.z &&
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonArea(polygon: GeoPoint[]): number {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += (polygon[j].x + polygon[i].x) * (polygon[j].z - polygon[i].z);
  }
  return Math.abs(area / 2);
}

/** 根据地面坐标查找所属区划；重叠时取面积最小者 */
export function findDistrictAt(x: number, z: number): DistrictGeo | null {
  const point = { x, z };
  const matches = DISTRICTS.filter((d) => pointInPolygon(point, d.boundary));
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  return matches.reduce((a, b) =>
    polygonArea(a.boundary) <= polygonArea(b.boundary) ? a : b,
  );
}

/** 街道在区内的布局坐标 */
export function getStreetWorldPosition(
  districtSlug: string,
  sortOrder: number,
): GeoPoint {
  const district = DISTRICTS.find((d) => d.slug === districtSlug);
  if (!district) return { x: 0, z: 0 };
  const cols = 4;
  const row = Math.floor(sortOrder / cols);
  const col = sortOrder % cols;
  return {
    x: district.center.x + (col - 1.5) * 7,
    z: district.center.z + (row - 1) * 6,
  };
}

const STREET_PICK_RADIUS = 3.2;

export function findStreetAt(
  x: number,
  z: number,
  streets: { slug: string; districtSlug: string; sortOrder: number }[],
): string | null {
  let best: { slug: string; dist: number } | null = null;
  for (const street of streets) {
    const pos = getStreetWorldPosition(street.districtSlug, street.sortOrder);
    const dist = Math.hypot(x - pos.x, z - pos.z);
    if (dist <= STREET_PICK_RADIUS && (!best || dist < best.dist)) {
      best = { slug: street.slug, dist };
    }
  }
  return best?.slug ?? null;
}
