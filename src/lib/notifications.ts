import { prisma } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  actorId: string;
  href: string;
  body?: string;
}) {
  if (data.userId === data.actorId) return;
  await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      actorId: data.actorId,
      href: data.href,
      body: data.body ?? null,
    },
  });
}
