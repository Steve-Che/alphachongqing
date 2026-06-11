"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateStreet } from "@/lib/revalidate-street";
import { sanitizeHtml } from "@/lib/sanitize-html";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const MOMENT_MAX_LENGTH = 500;
const MOMENT_MAX_IMAGES = 9;

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function createArticle(data: {
  title: string;
  body: string;
  coverUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const title = data.title.trim();
  const body = sanitizeHtml(data.body.trim());
  if (!title || !body) return { ok: false, error: "标题和正文不能为空" };

  const post = await prisma.post.create({
    data: {
      type: "ARTICLE",
      title,
      body,
      coverUrl: data.coverUrl || null,
      authorId: user.id,
    },
  });

  revalidatePath(`/u/${user.username}`);
  return { ok: true, data: { id: post.id } };
}

export async function createMoment(data: {
  body: string;
  imageUrls?: string[];
  streetId?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const body = data.body.trim();
  if (!body) return { ok: false, error: "内容不能为空" };
  if (body.length > MOMENT_MAX_LENGTH) {
    return { ok: false, error: `短文不超过 ${MOMENT_MAX_LENGTH} 字` };
  }

  const images = data.imageUrls?.slice(0, MOMENT_MAX_IMAGES) ?? [];

  const post = await prisma.post.create({
    data: {
      type: "MOMENT",
      body,
      authorId: user.id,
      streetId: data.streetId || null,
      images: {
        create: images.map((url) => ({ url, userId: user.id })),
      },
    },
  });

  revalidatePath(`/u/${user.username}`);
  if (data.streetId) {
    const street = await prisma.street.findUnique({
      where: { id: data.streetId },
      select: { slug: true },
    });
    if (street) revalidateStreet(street.slug);
  }
  return { ok: true, data: { id: post.id } };
}

export async function updateArticle(data: {
  id: string;
  title: string;
  body: string;
  coverUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const post = await prisma.post.findUnique({ where: { id: data.id } });
  if (!post || post.authorId !== user.id || post.type !== "ARTICLE") {
    return { ok: false, error: "无权编辑" };
  }

  const title = data.title.trim();
  const body = sanitizeHtml(data.body.trim());
  if (!title || !body) return { ok: false, error: "标题和正文不能为空" };

  await prisma.post.update({
    where: { id: data.id },
    data: {
      title,
      body,
      coverUrl: data.coverUrl || null,
    },
  });

  revalidatePath(`/article/${data.id}`);
  revalidatePath(`/u/${user.username}`);
  return { ok: true, data: { id: data.id } };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== user.id) {
    return { ok: false, error: "无权删除" };
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath(`/u/${user.username}`);
  return { ok: true };
}
