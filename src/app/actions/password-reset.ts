"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  createResetToken,
  getResetPasswordUrl,
  hashResetToken,
} from "@/lib/password-reset";

export type ActionResult = { ok: true } | { ok: false; error: string };

const GENERIC_SENT_MESSAGE =
  "若该邮箱已注册，我们已发送重置链接，请查收邮件（1 小时内有效）。";

export async function requestPasswordReset(
  formData: FormData,
): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "请填写注册邮箱" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const { raw, hash, expiresAt } = createResetToken();

      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hash,
            expiresAt,
          },
        }),
      ]);

      const resetUrl = getResetPasswordUrl(raw);
      const emailResult = await sendEmail({
        to: email,
        subject: "阿尔法重庆 — 重置密码",
        html: `
          <p>你好，${user.displayName ?? user.username}：</p>
          <p>我们收到了重置密码的请求。请点击下方链接设置新密码（1 小时内有效）：</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>如非本人操作，请忽略此邮件。</p>
        `,
      });

      if (!emailResult.sent && process.env.NODE_ENV === "development") {
        console.info("[password-reset] dev reset link:", resetUrl);
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("[password-reset] request failed:", e);
    return { ok: false, error: "发送失败，请稍后再试" };
  }
}

export async function resetPassword(
  formData: FormData,
): Promise<ActionResult> {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token) {
    return { ok: false, error: "重置链接无效" };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "新密码至少 6 位" };
  }
  if (password !== confirm) {
    return { ok: false, error: "两次输入的密码不一致" };
  }

  try {
    const tokenHash = hashResetToken(token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return { ok: false, error: "链接已失效，请重新申请重置" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: record.userId,
          usedAt: null,
          id: { not: record.id },
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true };
  } catch (e) {
    console.error("[password-reset] reset failed:", e);
    return { ok: false, error: "重置失败，请稍后再试" };
  }
}

export { GENERIC_SENT_MESSAGE };
