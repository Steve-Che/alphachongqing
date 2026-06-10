"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { rateLimitAuthAction } from "@/lib/rate-limit";
import { AuthError } from "next-auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const limited = await rateLimitAuthAction("register");
  if (!limited.ok) return limited;

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const inviteCode = (formData.get("inviteCode") as string)?.trim();

  if (!email || !username || !password || !inviteCode) {
    return { ok: false, error: "请填写所有必填项" };
  }

  if (password.length < 6) {
    return { ok: false, error: "密码至少 6 位" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const code = await tx.inviteCode.findUnique({ where: { code: inviteCode } });

      if (!code || code.revoked) {
        throw new Error("邀请码无效");
      }
      if (code.expiresAt && code.expiresAt < new Date()) {
        throw new Error("邀请码已过期");
      }
      if (code.usedCount >= code.maxUses) {
        throw new Error("邀请码已用完");
      }

      const existing = await tx.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        throw new Error("邮箱或用户名已存在");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await tx.user.create({
        data: { email, username, passwordHash, displayName: username },
      });

      const updated = await tx.inviteCode.updateMany({
        where: {
          id: code.id,
          revoked: false,
          usedCount: { lt: code.maxUses },
        },
        data: { usedCount: { increment: 1 } },
      });
      if (updated.count === 0) {
        throw new Error("邀请码已用完");
      }
    });

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signInResult?.error) {
      return { ok: false, error: "注册成功但登录失败，请手动登录" };
    }
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "注册成功但登录失败，请手动登录" };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "注册失败",
    };
  }
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const limited = await rateLimitAuthAction("login");
  if (!limited.ok) return limited;

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { ok: false, error: "请填写邮箱和密码" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { ok: false, error: "邮箱或密码错误" };
    }

    return { ok: true };
  } catch (e) {
    console.error("[auth] login failed:", e);
    return { ok: false, error: "登录服务暂时不可用，请稍后再试" };
  }
}
