"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function archiveStreetMessage(
  messageId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "无权操作" };

  const msg = await prisma.streetMessage.findUnique({
    where: { id: messageId },
    include: { street: { select: { slug: true } } },
  });
  if (!msg) return { ok: false, error: "留言不存在" };

  await prisma.streetMessage.update({
    where: { id: messageId },
    data: { archived: true },
  });

  revalidatePath(`/street/${msg.street.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function assignStreetChief(
  streetId: string,
  userId: string | null,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "无权操作" };

  const street = await prisma.street.findUnique({
    where: { id: streetId },
    select: { slug: true },
  });
  if (!street) return { ok: false, error: "街道不存在" };

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return { ok: false, error: "用户不存在" };
  }

  await prisma.street.update({
    where: { id: streetId },
    data: {
      serviceChiefId: userId,
      chiefSince: userId ? new Date() : null,
    },
  });

  revalidatePath(`/street/${street.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function pinStreetMessage(
  messageId: string,
  pinned: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "无权操作" };

  const msg = await prisma.streetMessage.findUnique({
    where: { id: messageId },
    include: { street: { select: { slug: true, serviceChiefId: true } } },
  });
  if (!msg) return { ok: false, error: "留言不存在" };

  const isChief = msg.street.serviceChiefId === admin.id;
  if (!isChief && admin.role !== "ADMIN") {
    return { ok: false, error: "仅管理员或服务长可置顶" };
  }

  await prisma.streetMessage.update({
    where: { id: messageId },
    data: { isPinned: pinned },
  });

  revalidatePath(`/street/${msg.street.slug}`);
  return { ok: true };
}
