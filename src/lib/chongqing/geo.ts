/**
 * 3D 城市渲染的地理真源：区划边界、街道坐标、颜色等均由此文件定义。
 * 数据库 `District.boundaryPolygon` 仅用于种子同步，运行时以本文件为准。
 */
export type GeoPoint = { x: number; z: number };

export type DistrictGeo = {
  slug: string;
  nameZh: string;
  summary: string;
  center: GeoPoint;
  elevation: number;
  color: string;
  boundary: GeoPoint[];
};

/** 抽象场景坐标，保持渝中居中、江北在北、南岸在南的相对关系 */
export const SCENE_BOUNDS = { min: -50, max: 50 } as const;

/** 全城视角相机注视点（略偏南以平衡八区分布） */
export const CITY_MAP_FOCUS: GeoPoint = { x: 0, z: 4 };

export const DISTRICTS: DistrictGeo[] = [
  {
    slug: "yuzhong",
    nameZh: "渝中区",
    summary: "两江交汇之城心，解放碑与洪崖洞灯火可亲。",
    center: { x: 0, z: 0 },
    elevation: 8,
    color: "#C4A574",
    boundary: [
      { x: -7, z: -6 },
      { x: 7, z: -6 },
      { x: 8, z: 0 },
      { x: 7, z: 6 },
      { x: -7, z: 6 },
      { x: -8, z: 0 },
    ],
  },
  {
    slug: "jiangbei",
    nameZh: "江北区",
    summary: "嘉陵江北岸，观音桥与北滨路遥望渝中。",
    center: { x: 0, z: -24 },
    elevation: 5,
    color: "#7B9E8A",
    boundary: [
      { x: -15, z: -38 },
      { x: 15, z: -38 },
      { x: 16, z: -24 },
      { x: 15, z: -12 },
      { x: -15, z: -12 },
      { x: -16, z: -24 },
    ],
  },
  {
    slug: "nanan",
    nameZh: "南岸区",
    summary: "长江南岸，南滨路与南山俯瞰全城。",
    center: { x: 0, z: 24 },
    elevation: 6,
    color: "#8B9EB5",
    boundary: [
      { x: -12, z: 14 },
      { x: 15, z: 14 },
      { x: 16, z: 18 },
      { x: 15, z: 32 },
      { x: -12, z: 32 },
      { x: -14, z: 18 },
    ],
  },
  {
    slug: "shapingba",
    nameZh: "沙坪坝区",
    summary: "嘉陵江西岸文教重镇，磁器口古巷悠长。",
    center: { x: -28, z: -12 },
    elevation: 4,
    color: "#A68B6B",
    boundary: [
      { x: -42, z: -24 },
      { x: -16, z: -24 },
      { x: -14, z: -10 },
      { x: -16, z: -3 },
      { x: -42, z: -3 },
      { x: -44, z: -12 },
    ],
  },
  {
    slug: "jiulongpo",
    nameZh: "九龙坡区",
    summary: "西城工业记忆与黄桷坪涂鸦交织。",
    center: { x: -28, z: 20 },
    elevation: 3,
    color: "#9A8B7A",
    boundary: [
      { x: -42, z: 14 },
      { x: -13, z: 14 },
      { x: -11, z: 18 },
      { x: -13, z: 30 },
      { x: -42, z: 30 },
      { x: -44, z: 20 },
    ],
  },
  {
    slug: "dadukou",
    nameZh: "大渡口区",
    summary: "长江之滨，工业遗址上的慢生活。",
    center: { x: 26, z: 20 },
    elevation: 2,
    color: "#8A7B6B",
    boundary: [
      { x: 16, z: 14 },
      { x: 38, z: 14 },
      { x: 40, z: 18 },
      { x: 38, z: 30 },
      { x: 16, z: 30 },
      { x: 14, z: 20 },
    ],
  },
  {
    slug: "yubei",
    nameZh: "渝北区",
    summary: "两江新区北岸，空港新城与龙溪商圈并立。",
    center: { x: 30, z: -30 },
    elevation: 4,
    color: "#7A9E9A",
    boundary: [
      { x: 16, z: -42 },
      { x: 42, z: -42 },
      { x: 44, z: -28 },
      { x: 42, z: -13 },
      { x: 16, z: -13 },
      { x: 14, z: -28 },
    ],
  },
  {
    slug: "banan",
    nameZh: "巴南区",
    summary: "主城南端，花溪河畔与鱼洞老城相依。",
    center: { x: -12, z: 43 },
    elevation: 3,
    color: "#8B9A7B",
    boundary: [
      { x: -28, z: 36 },
      { x: 10, z: 36 },
      { x: 12, z: 40 },
      { x: 10, z: 50 },
      { x: -28, z: 50 },
      { x: -30, z: 43 },
    ],
  },
];

export const STREET_NAMES: Record<string, string[]> = {
  yuzhong: [
    "解放碑大道",
    "洪崖洞巷",
    "朝天门街",
    "十八梯路",
    "较场口巷",
    "民生路",
    "邹容路",
    "枇杷山道",
  ],
  jiangbei: [
    "观音桥步行街",
    "北滨路",
    "洋河巷",
    "鎏嘉码头街",
    "五里店路",
    "花卉园道",
    "石子山巷",
    "鸿恩寺道",
  ],
  nanan: [
    "南滨路",
    "南山道",
    "弹子石街",
    "海棠溪巷",
    "涂山路",
    "学府大道",
    "融侨半岛路",
    "慈母山道",
  ],
  shapingba: [
    "磁器口巷",
    "三峡广场大道",
    "沙正街",
    "烈士墓路",
    "歌乐山道",
    "大学城街",
    "陈家桥巷",
    "井口路",
  ],
  jiulongpo: [
    "杨家坪步行街",
    "黄桷坪涂鸦街",
    "石桥铺大道",
    "谢家湾路",
    "二郎巷",
    "华岩寺道",
    "中梁山巷",
    "铜罐驿街",
  ],
  dadukou: [
    "九宫庙老街",
    "义渡古镇巷",
    "茄子溪路",
    "春晖路",
    "建胜街",
    "跳磴巷",
    "新山村道",
    "钢铁大道",
  ],
  yubei: [
    "龙溪大道",
    "回兴街",
    "两路巷",
    "照母山道",
    "鸳鸯路",
    "悦来新城街",
    "空港大道",
    "木耳巷",
  ],
  banan: [
    "鱼洞老街",
    "花溪大道",
    "李家沱街",
    "界石巷",
    "南泉路",
    "木洞古镇巷",
    "龙洲湾大道",
    "一品街",
  ],
};

export const ROOM_LABELS: Record<string, string> = {
  FRONT_HALL: "前厅",
  LEFT_WING: "左厢",
  RIGHT_WING: "右厢",
  MAIN_HALL: "正厅",
  BACK_GARDEN: "后花园",
  SIDE_ROOM: "侧室",
};

export const DEFAULT_ROOM_NAMES: Record<string, string> = {
  FRONT_HALL: "前厅",
  LEFT_WING: "左厢",
  RIGHT_WING: "右厢",
  MAIN_HALL: "正厅",
  BACK_GARDEN: "后花园",
  SIDE_ROOM: "留言板",
};

export const ROOM_ORDER = [
  "FRONT_HALL",
  "LEFT_WING",
  "RIGHT_WING",
  "MAIN_HALL",
  "BACK_GARDEN",
  "SIDE_ROOM",
] as const;

/** 长江与嘉陵江简化走向 */
export const RIVERS = {
  yangtze: [
    { x: -45, z: 10 },
    { x: -20, z: 8 },
    { x: 0, z: 6 },
    { x: 20, z: 10 },
    { x: 45, z: 14 },
  ],
  jialing: [
    { x: -40, z: -5 },
    { x: -15, z: -3 },
    { x: 0, z: -2 },
    { x: 15, z: -6 },
    { x: 40, z: -12 },
  ],
};
