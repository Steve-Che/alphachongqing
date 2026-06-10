import { ROOM_ORDER } from "@/lib/chongqing/geo";

const SLUG_MAP: Record<string, string> = {
  "front-hall": "FRONT_HALL",
  "left-wing": "LEFT_WING",
  "right-wing": "RIGHT_WING",
  "main-hall": "MAIN_HALL",
  "back-garden": "BACK_GARDEN",
  "side-room": "SIDE_ROOM",
};

export function roomSlugToType(slug: string): string | null {
  return SLUG_MAP[slug] ?? null;
}

export function roomTypeToSlug(type: string): string {
  return type.toLowerCase().replace(/_/g, "-");
}

export function isValidRoomSlug(slug: string): boolean {
  return slug in SLUG_MAP;
}

export { ROOM_ORDER };
