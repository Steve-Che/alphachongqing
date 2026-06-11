import type { ShopActivityBubble } from "@/lib/street-types";

export function truncateBubbleText(text: string, max = 28): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max)}…`;
}

export function formatShopBubble(
  authorName: string,
  text: string,
): NonNullable<ShopActivityBubble> {
  return {
    shopId: "",
    authorName,
    text: truncateBubbleText(text),
  };
}

export function formatPathBubbleLabel(
  authorName: string,
  content: string,
  isOfficial: boolean,
): string {
  const prefix = isOfficial ? `${authorName}（服务长）说：` : `${authorName} 说：`;
  return `${prefix}${truncateBubbleText(content, 36)}`;
}
