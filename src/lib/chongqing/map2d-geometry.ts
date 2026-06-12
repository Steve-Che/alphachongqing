import { RIVERS, SCENE_BOUNDS, type GeoPoint } from "./geo";
import { STREET_GRID_COLS } from "./district-street-grid";
import { MAP2D } from "./map2d-style";

export type SvgPoint = { sx: number; sy: number };
export type GridCell = { x: number; y: number; w: number; h: number };
export type RoadSegment = {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  main: boolean;
};

export type StreetBlockLayout = {
  slug: string;
  nameZh: string;
  sortOrder: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const VB = MAP2D.viewBox;
const PAD = MAP2D.pad;
const SPAN = SCENE_BOUNDS.max - SCENE_BOUNDS.min;

export function sceneToSvg(x: number, z: number): SvgPoint {
  const sx = PAD + ((x - SCENE_BOUNDS.min) / SPAN) * (VB - PAD * 2);
  const sy = PAD + ((SCENE_BOUNDS.max - z) / SPAN) * (VB - PAD * 2);
  return { sx, sy };
}

export function sceneSegmentToSvg(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const a = sceneToSvg(x1, z1);
  const b = sceneToSvg(x2, z2);
  return { x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy };
}

function pointInPolygon(x: number, z: number, boundary: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    const xi = boundary[i].x;
    const zi = boundary[i].z;
    const xj = boundary[j].x;
    const zj = boundary[j].z;
    const intersect =
      zi > z !== zj > z &&
      x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function sceneCellToSvgRect(
  sx: number,
  sz: number,
  size: number,
): GridCell {
  const tl = sceneToSvg(sx, sz + size);
  const br = sceneToSvg(sx + size, sz);
  return {
    x: tl.sx,
    y: tl.sy,
    w: br.sx - tl.sx,
    h: br.sy - tl.sy,
  };
}

/** 将城区边界栅格化为阶梯方块 */
export function boundaryToGridCells(boundary: GeoPoint[]): GridCell[] {
  if (boundary.length < 3) return [];

  const step = MAP2D.sceneGridStep;
  const cells: GridCell[] = [];

  for (let x = SCENE_BOUNDS.min; x < SCENE_BOUNDS.max; x += step) {
    for (let z = SCENE_BOUNDS.min; z < SCENE_BOUNDS.max; z += step) {
      const cx = x + step / 2;
      const cz = z + step / 2;
      if (pointInPolygon(cx, cz, boundary)) {
        cells.push(sceneCellToSvgRect(x, z, step));
      }
    }
  }

  return cells;
}

/** 全城主干道与支路（场景坐标） */
export function getCityRoadSegments(): RoadSegment[] {
  const xMin = SCENE_BOUNDS.min + 2;
  const xMax = SCENE_BOUNDS.max - 2;
  const zMin = SCENE_BOUNDS.min + 2;
  const zMax = SCENE_BOUNDS.max - 2;

  const mainH = [-32, -24, -6, 6, 18, 24, 38];
  const mainV = [-28, -12, 0, 14, 26, 32];
  const secH = [-36, -18, 0, 12, 32, 42];
  const secV = [-38, -20, -6, 8, 20, 36];

  const roads: RoadSegment[] = [];

  for (const z of mainH) {
    roads.push({ x1: xMin, z1: z, x2: xMax, z2: z, main: true });
  }
  for (const x of mainV) {
    roads.push({ x1: x, z1: zMin, x2: x, z2: zMax, main: true });
  }
  for (const z of secH) {
    if (!mainH.includes(z)) {
      roads.push({ x1: xMin, z1: z, x2: xMax, z2: z, main: false });
    }
  }
  for (const x of secV) {
    if (!mainV.includes(x)) {
      roads.push({ x1: x, z1: zMin, x2: x, z2: zMax, main: false });
    }
  }

  return roads;
}

/** 江河浅色河带路径 */
export function getRiverBandPaths(): { d: string; width: number }[] {
  const toPath = (points: GeoPoint[]) =>
    points
      .map((p, i) => {
        const { sx, sy } = sceneToSvg(p.x, p.z);
        return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
      })
      .join(" ");

  return [
    { d: toPath(RIVERS.yangtze), width: MAP2D.riverWidth },
    { d: toPath(RIVERS.jialing), width: MAP2D.riverWidth * 0.85 },
  ];
}

/** 城区内 2×4 街道块布局 */
export function getDistrictStreetLayout(
  streets: { slug: string; nameZh: string; sortOrder: number }[],
): {
  blocks: StreetBlockLayout[];
  roads: { x1: number; y1: number; x2: number; y2: number; main: boolean }[];
} {
  const vb = MAP2D.viewBox;
  const pad = MAP2D.districtPad;
  const road = MAP2D.districtRoad;
  const cols = STREET_GRID_COLS;
  const rows = MAP2D.districtRows;

  const innerW = vb - pad * 2;
  const innerH = vb - pad * 2;
  const blockW = (innerW - road * (cols - 1)) / cols;
  const blockH = (innerH - road * (rows - 1)) / rows;

  const blocks: StreetBlockLayout[] = streets
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((street) => {
      const col = street.sortOrder % cols;
      const row = Math.floor(street.sortOrder / cols);
      return {
        slug: street.slug,
        nameZh: street.nameZh,
        sortOrder: street.sortOrder,
        x: pad + col * (blockW + road),
        y: pad + row * (blockH + road),
        w: blockW,
        h: blockH,
      };
    });

  const roads: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    main: boolean;
  }[] = [];

  // 纵向主干道
  for (let c = 1; c < cols; c++) {
    const x = pad + c * blockW + (c - 0.5) * road;
    roads.push({ x1: x, y1: pad, x2: x, y2: vb - pad, main: true });
  }

  // 横向主干道
  for (let r = 1; r < rows; r++) {
    const y = pad + r * blockH + (r - 0.5) * road;
    roads.push({ x1: pad, y1: y, x2: vb - pad, y2: y, main: true });
  }

  // 外框支路
  roads.push({ x1: pad, y1: pad, x2: vb - pad, y2: pad, main: false });
  roads.push({
    x1: pad,
    y1: vb - pad,
    x2: vb - pad,
    y2: vb - pad,
    main: false,
  });
  roads.push({ x1: pad, y1: pad, x2: pad, y2: vb - pad, main: false });
  roads.push({
    x1: vb - pad,
    y1: pad,
    x2: vb - pad,
    y2: vb - pad,
    main: false,
  });

  return { blocks, roads };
}

/** 城区名简写（去掉「区」） */
export function districtShortName(nameZh: string): string {
  return nameZh.replace(/区$/, "");
}

/** 街道名折行（最多两行，每行最多 4 字） */
export function splitStreetLabel(name: string): string[] {
  if (name.length <= 4) return [name];
  return [name.slice(0, 4), name.slice(4)];
}
