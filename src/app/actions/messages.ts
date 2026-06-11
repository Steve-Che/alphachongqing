"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { rateLimitSocialAction } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function sendDirectMessage(
  conversationId: string,
  body: string,
): Promise<ActionResult<{ messageId: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("dm", user.id);
  if (!limited.ok) return limited;

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "消息不能为空" };
  if (trimmed.length > 2000) return { ok: false, error: "消息不超过 2000 字" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: user.id },
    },
  });
  if (!participant) return { ok: false, error: "无权访问此对话" };

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.directMessage.create({
      data: { conversationId, senderId: user.id, body: trimmed },
    });
    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    await tx.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId: user.id },
      },
      data: { lastReadAt: new Date() },
    });
    return msg;
  });

  const recipients = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
    select: { userId: true },
  });

  await Promise.all(
    recipients.map(async (r) => {
      try {
        await createNotification({
          userId: r.userId,
          type: "MESSAGE",
          actorId: user.id,
          href: `/messages/${conversationId}`,
          body: trimmed.slice(0, 80),
        });
      } catch {
        /* 通知失败不影响私信发送 */
      }
    }),
  );

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, data: { messageId: message.id } };
}

export async function startConversation(
  targetUsername: string,
  body: string,
): Promise<ActionResult<{ conversationId: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const target = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  });
  if (!target) return { ok: false, error: "用户不存在" };
  if (target.id === user.id) return { ok: false, error: "不能给自己发私信" };

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: target.id } } },
      ],
    },
    select: { id: true },
  });

  if (existing) {
    const send = await sendDirectMessage(existing.id, body);
    if (!send.ok) return send;
    return { ok: true, data: { conversationId: existing.id } };
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: target.id }],
      },
    },
  });

  const send = await sendDirectMessage(conversation.id, body);
  if (!send.ok) return send;
  return { ok: true, data: { conversationId: conversation.id } };
}

export async function markConversationRead(
  conversationId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId, userId: user.id },
    },
    data: { lastReadAt: new Date() },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true };
}
