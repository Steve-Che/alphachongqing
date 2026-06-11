import { prisma } from "@/lib/db";

/** 静默标记已读，供 RSC 渲染阶段调用（不 revalidate） */
export async function markConversationReadSilent(
  conversationId: string,
  userId: string,
): Promise<void> {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}
