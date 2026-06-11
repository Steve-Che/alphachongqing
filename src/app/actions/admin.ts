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
