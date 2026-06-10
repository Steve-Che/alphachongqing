/** 街道铺位 3D 布局：两侧各 7 铺 + 街心，共 15 槽位（与 seed 一致） */
export const STREET_SHOPS_PER_SIDE = 7;
export const STREET_SLOT_SIDE_X = 4.2;
export const STREET_SLOT_Z_STEP = 3;
export const STREET_GROUND_SIZE: [number, number] = [36, 10];
export const STREET_ROAD_SIZE: [number, number] = [5, 34];

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
