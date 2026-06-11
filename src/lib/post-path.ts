import type { PostType } from "@/generated/prisma/client";

export function getPostDetailPath(postId: string, type: PostType): string {
  return type === "MOMENT" ? `/moment/${postId}` : `/article/${postId}`;
}
