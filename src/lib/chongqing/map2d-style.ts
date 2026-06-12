/** 2D 复古城市地图视觉 token（参考阿尔法城平面风格） */
export const MAP2D = {
  viewBox: 100,
  pad: 4,
  gridCellSize: 2,
  sceneGridStep: 4,

  bg: "#F5F1E6",
  block: "#FFFEF9",
  blockHover: "#F0EBE3",
  blockStroke: "#E0D8CC",
  blockActive: "#E8DCC8",

  roadMain: "#F5E66A",
  roadSecondary: "#FFFFFF",
  roadMainWidth: 2.8,
  roadSecondaryWidth: 1.2,

  river: "#B8D4E8",
  riverWidth: 3.5,

  label: "#4D3D38",
  labelMuted: "#7A6A5A",
  tag: "#E67E22",
  tagText: "#FFFFFF",

  districtPad: 6,
  districtRoad: 2.5,
  districtCols: 4,
  districtRows: 2,
} as const;

/** 按活跃度 0–1 混合 block 与 blockActive */
export function map2dActivityFill(intensity: number): string {
  const t = Math.min(1, Math.max(0, intensity));
  const from = { r: 232, g: 220, b: 200 };
  const to = { r: 255, g: 254, b: 249 };
  const r = Math.round(to.r + (from.r - to.r) * t);
  const g = Math.round(to.g + (from.g - to.g) * t);
  const b = Math.round(to.b + (from.b - to.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export const MAP2D_PATTERN_ID = "map2d-grid";
