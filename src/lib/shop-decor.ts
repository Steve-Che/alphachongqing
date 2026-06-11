const GRADIENTS = [
  "linear-gradient(145deg, #e8d5c4 0%, #c9a882 100%)",
  "linear-gradient(145deg, #d4e4ed 0%, #7a9ab8 100%)",
  "linear-gradient(145deg, #e8e0d0 0%, #a68b6b 100%)",
  "linear-gradient(145deg, #f0e6d8 0%, #c45c3e 100%)",
  "linear-gradient(145deg, #dce8d4 0%, #7b9e8a 100%)",
  "linear-gradient(145deg, #ede4f0 0%, #8b7a9e 100%)",
  "linear-gradient(145deg, #f5ecd8 0%, #d4a84b 100%)",
  "linear-gradient(145deg, #e0e8f0 0%, #5a7a9a 100%)",
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export type ShopDecor = {
  background: string;
  initial: string;
  accent: string;
};

export function getShopDecor(shopId: string, name: string): ShopDecor {
  const h = hashString(shopId || name);
  const initial = (name.trim()[0] ?? "店").toUpperCase();
  const accents = ["#b84a2f", "#7a5c3e", "#5a7a9a", "#7b9e8a", "#8b7355"];
  return {
    background: GRADIENTS[h % GRADIENTS.length]!,
    initial,
    accent: accents[h % accents.length]!,
  };
}

/** 内置预设门头（SVG data URL，无需静态文件） */
export const SHOP_COVER_PRESETS: { id: string; label: string; url: string }[] = [
  {
    id: "awning-red",
    label: "红檐小店",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#faf6ee" width="400" height="300"/><rect fill="#c45c3e" y="0" width="400" height="80"/><path fill="#b84a2f" d="M0 80 L50 100 L100 80 L150 100 L200 80 L250 100 L300 80 L350 100 L400 80 L400 0 L0 0Z"/><rect fill="#e8dfd0" x="140" y="120" width="120" height="140" rx="4"/><rect fill="#8b7355" x="175" y="200" width="50" height="60"/></svg>`,
    ),
  },
  {
    id: "tea-house",
    label: "茶馆",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#e8e0d0" width="400" height="300"/><rect fill="#7b9e8a" y="180" width="400" height="120"/><rect fill="#a68b6b" x="80" y="60" width="240" height="160" rx="6"/><text x="200" y="150" text-anchor="middle" fill="#faf6ee" font-size="48" font-family="serif">茶</text></svg>`,
    ),
  },
  {
    id: "bookstore",
    label: "书屋",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#d4e4ed" width="400" height="300"/><rect fill="#5a7a9a" x="60" y="40" width="280" height="220" rx="4"/><rect fill="#faf6ee" x="90" y="70" width="50" height="160"/><rect fill="#e8d5c4" x="150" y="70" width="50" height="160"/><rect fill="#c9a882" x="210" y="70" width="50" height="160"/><rect fill="#a68b6b" x="270" y="70" width="40" height="160"/></svg>`,
    ),
  },
  {
    id: "night-lamp",
    label: "夜灯铺",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#2c2825" width="400" height="300"/><circle fill="#f5d76e" cx="200" cy="120" r="50" opacity="0.9"/><rect fill="#8b7355" x="185" y="170" width="30" height="80"/><rect fill="#5a4a3a" x="100" y="220" width="200" height="60"/></svg>`,
    ),
  },
  {
    id: "flower",
    label: "花店",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f0ebe3" width="400" height="300"/><circle fill="#e07a3a" cx="120" cy="100" r="30"/><circle fill="#c45c3e" cx="200" cy="80" r="35"/><circle fill="#d4a84b" cx="280" cy="110" r="28"/><rect fill="#7b9e8a" x="0" y="200" width="400" height="100"/></svg>`,
    ),
  },
  {
    id: "retro-sign",
    label: "复古招牌",
    url: "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#faf6ee" width="400" height="300"/><rect fill="#c45c3e" x="50" y="60" width="300" height="100" rx="8"/><rect fill="#8b7355" x="80" y="180" width="240" height="90" rx="4"/><text x="200" y="125" text-anchor="middle" fill="#fff" font-size="36" font-family="serif">OPEN</text></svg>`,
    ),
  },
];

export function resolveShopCoverUrl(
  coverUrl: string | null | undefined,
  shopId: string,
  name: string,
): string | null {
  if (coverUrl) return coverUrl;
  return null;
}

export function getShopDisplayStyle(
  coverUrl: string | null | undefined,
  shopId: string,
  name: string,
): { type: "image"; url: string } | { type: "decor"; decor: ShopDecor } {
  if (coverUrl) return { type: "image", url: coverUrl };
  return { type: "decor", decor: getShopDecor(shopId, name) };
}
