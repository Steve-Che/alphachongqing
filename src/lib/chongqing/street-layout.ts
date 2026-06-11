/** 街道铺位 3D 布局：两侧各 7 铺 + 街心，共 15 槽位（与 seed 一致） */
export const STREET_SHOPS_PER_SIDE = 7;
export const STREET_SLOT_SIDE_X = 4.2;
export const STREET_SLOT_Z_STEP = 2.8;
export const STREET_GROUND_SIZE: [number, number] = [44, 30];
export const STREET_ROAD_SIZE: [number, number] = [5, 22];

/** 公寓塔楼：2 排 × 15 列 = 30 栋 */
export const APARTMENT_BUILDING_COUNT = 30;
export const APARTMENT_TOWER_COLS = 15;
export const APARTMENT_TOWER_ROWS = 2;
export const APARTMENT_TOWER_BASE_Z = -15;
export const APARTMENT_TOWER_ROW_Z_STEP = 4.5;
export const APARTMENT_TOWER_COL_X_STEP = 2.4;

/** 非街心铺位在 shopSlots 数组中的索引 → 世界坐标 */
export function getStreetSlotPosition(
  shopSlotIndex: number,
): [number, number, number] {
  const side = shopSlotIndex < STREET_SHOPS_PER_SIDE ? -1 : 1;
  const index =
    shopSlotIndex < STREET_SHOPS_PER_SIDE
      ? shopSlotIndex
      : shopSlotIndex - STREET_SHOPS_PER_SIDE;
  const x = side * STREET_SLOT_SIDE_X;
  const z = (index - 3) * STREET_SLOT_Z_STEP;
  return [x, 0, z];
}

/** 楼栋号 1–30 → 后排塔楼坐标 */
export function getApartmentTowerPosition(
  buildingNumber: number,
): [number, number, number] {
  const idx = buildingNumber - 1;
  const row = Math.floor(idx / APARTMENT_TOWER_COLS);
  const col = idx % APARTMENT_TOWER_COLS;
  const z = APARTMENT_TOWER_BASE_Z - row * APARTMENT_TOWER_ROW_Z_STEP;
  const x = (col - (APARTMENT_TOWER_COLS - 1) / 2) * APARTMENT_TOWER_COL_X_STEP;
  return [x, 0, z];
}

export function getApartmentTowerHeight(
  occupiedCount: number,
  totalUnits: number,
): number {
  if (occupiedCount <= 0) return 1.6;
  const ratio = Math.min(occupiedCount / Math.max(totalUnits, 1), 1);
  return 1.6 + ratio * 4.5;
}

export function getApartmentTowerColor(occupiedCount: number): string {
  if (occupiedCount <= 0) return "#a8b4c4";
  if (occupiedCount < 10) return "#7a9ab8";
  return "#5a7a9a";
}
