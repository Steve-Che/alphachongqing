"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function createInviteCode(
  maxUses = 1,
  expiresInDays?: number,
): Promise<ActionResult<{ code: string }>> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "需要管理员权限" };
  }

  const code = generateCode();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null;

  await prisma.inviteCode.create({
    data: {
      code,
      maxUses,
      createdById: session.user.id,
      expiresAt,
    },
  });

  revalidatePath("/admin/invites");
  return { ok: true, data: { code } };
}

export async function revokeInviteCode(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "需要管理员权限" };
  }

  await prisma.inviteCode.update({
    where: { id },
    data: { revoked: true },
  });

  revalidatePath("/admin/invites");
  return { ok: true };
}
