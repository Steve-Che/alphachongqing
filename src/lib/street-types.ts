export type ShopActivityBubble = {
  shopId: string;
  authorName: string;
  text: string;
} | null;

export type StreetPathBubble = {
  id: string;
  authorName: string;
  content: string;
  isOfficial: boolean;
  isPinned: boolean;
  createdAt: string;
};

export type StreetStripSlot = {
  id: string;
  slotIndex: number;
  isCenter: boolean;
  status: string;
  shop?: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    coverUrl: string | null;
    owner: { username: string; displayName: string | null };
  } | null;
  activity: ShopActivityBubble;
};

export type ApartmentRangeSummary = {
  start: number;
  end: number;
  label: string;
  totalUnits: number;
  occupiedUnits: number;
  buildings: {
    id: string;
    buildingNumber: number;
    occupiedCount: number;
    totalUnits: number;
  }[];
};

export type StreetActivityPayload = {
  pathBubbles: StreetPathBubble[];
  shopActivities: Record<string, ShopActivityBubble>;
};
