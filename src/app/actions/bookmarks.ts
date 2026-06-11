"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPostDetailPath } from "@/lib/post-path";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function toggleBookmark(
  postId: string,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "请先登录" };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, type: true },
  });
  if (!post) return { ok: false, error: "内容不存在" };

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId: session.user.id, postId },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: {
        userId_postId: { userId: session.user.id, postId },
      },
    });
    revalidatePath("/favorites");
    revalidatePath(getPostDetailPath(post.id, post.type));
    return { ok: true, data: { bookmarked: false } };
  }

  await prisma.bookmark.create({
    data: { userId: session.user.id, postId },
  });
  revalidatePath("/favorites");
  revalidatePath(getPostDetailPath(post.id, post.type));
  return { ok: true, data: { bookmarked: true } };
}
