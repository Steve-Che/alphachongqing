"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const displayName = data.displayName?.trim();
  const bio = data.bio?.trim();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName !== undefined ? { displayName: displayName || null } : {}),
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
    },
  });

  revalidatePath(`/u/${user.username}`);
  revalidatePath("/settings");
  return { ok: true };
}
