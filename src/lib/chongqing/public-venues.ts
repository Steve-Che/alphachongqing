import { DISTRICTS } from "./geo";

export type PublicVenueConfig = {
  slug: string;
  nameZh: string;
  summary: string;
  tier: "FLAGSHIP" | "COMMUNITY";
  type:
    | "LIBRARY"
    | "CONCERT_HALL"
    | "GALLERY"
    | "TEAHOUSE"
    | "SQUARE"
    | "COMMUNITY_HALL";
  districtSlug: string;
  mapX: number;
  mapZ: number;
  sortOrder: number;
};

const FLAGSHIP_VENUES: PublicVenueConfig[] = [
  {
    slug: "city-library",
    nameZh: "市立图书馆",
    summary:
      "山城公共书架，收藏公版经典，街坊可免费阅读。安静、免费、向所有人开放。",
    tier: "FLAGSHIP",
    type: "LIBRARY",
    districtSlug: "yuzhong",
    mapX: -4,
    mapZ: 2,
    sortOrder: 0,
  },
  {
    slug: "mountain-hall",
    nameZh: "山城音乐厅",
    summary: "两江交汇处的声学空间，定期举办小型演奏会与读诗会，可在线报名参与。",
    tier: "FLAGSHIP",
    type: "CONCERT_HALL",
    districtSlug: "yuzhong",
    mapX: 4,
    mapZ: -2,
    sortOrder: 1,
  },
  {
    slug: "two-rivers-gallery",
    nameZh: "两江美术馆",
    summary: "展出街坊长文与图像，像一座慢速更新的线上展厅。",
    tier: "FLAGSHIP",
    type: "GALLERY",
    districtSlug: "yuzhong",
    mapX: 6,
    mapZ: 4,
    sortOrder: 2,
  },
  {
    slug: "citizen-teahouse",
    nameZh: "市民茶室",
    summary: "不必急着赶路，坐下来聊聊今日见闻。留言与短文，是茶室里的背景音。",
    tier: "FLAGSHIP",
    type: "TEAHOUSE",
    districtSlug: "yuzhong",
    mapX: -6,
    mapZ: -4,
    sortOrder: 3,
  },
  {
    slug: "jiefangbei-square",
    nameZh: "解放碑城市广场",
    summary: "全城的公告栏与露天舞台，大型活动与集会在此发布。",
    tier: "FLAGSHIP",
    type: "SQUARE",
    districtSlug: "yuzhong",
    mapX: 0,
    mapZ: 8,
    sortOrder: 4,
  },
];

const COMMUNITY_SUMMARIES: Record<string, string> = {
  yuzhong: "渝中城心的社区客厅，连接市立图书馆与广场活动。",
  jiangbei: "江北岸的邻里空间，可了解北岸近期公共活动。",
  nanan: "南岸江边的社区馆，南滨路街坊常在此碰面。",
  shapingba: "沙坪坝文教区的社区角，适合慢读与短聚。",
  jiulongpo: "西城涂鸦与工业记忆旁的社区交流点。",
  dadukou: "长江边的社区小馆，工业遗址旁的慢生活据点。",
  yubei: "空港新城侧的社区馆，龙溪与回兴街坊的公共客厅。",
  banan: "花溪河畔的社区空间，鱼洞老城的新邻居。",
};

function communityVenue(districtSlug: string, sortOrder: number): PublicVenueConfig {
  const district = DISTRICTS.find((d) => d.slug === districtSlug);
  const name = district?.nameZh.replace("区", "") ?? districtSlug;
  return {
    slug: `community-${districtSlug}`,
    nameZh: `${name}社区馆`,
    summary: COMMUNITY_SUMMARIES[districtSlug] ?? `${name}区的公共交流空间。`,
    tier: "COMMUNITY",
    type: "COMMUNITY_HALL",
    districtSlug,
    mapX: (district?.center.x ?? 0) + 3,
    mapZ: (district?.center.z ?? 0) + 3,
    sortOrder: 10 + sortOrder,
  };
}

export const COMMUNITY_VENUES: PublicVenueConfig[] = DISTRICTS.map((d, i) =>
  communityVenue(d.slug, i),
);

export const PUBLIC_VENUES: PublicVenueConfig[] = [
  ...FLAGSHIP_VENUES,
  ...COMMUNITY_VENUES,
];

export const FLAGSHIP_VENUE_SLUGS = FLAGSHIP_VENUES.map((v) => v.slug);

export function getPublicVenueConfig(slug: string): PublicVenueConfig | undefined {
  return PUBLIC_VENUES.find((v) => v.slug === slug);
}

export function venueTypeLabel(type: PublicVenueConfig["type"]): string {
  const labels: Record<PublicVenueConfig["type"], string> = {
    LIBRARY: "图书馆",
    CONCERT_HALL: "音乐厅",
    GALLERY: "美术馆",
    TEAHOUSE: "茶室",
    SQUARE: "城市广场",
    COMMUNITY_HALL: "社区馆",
  };
  return labels[type];
}
