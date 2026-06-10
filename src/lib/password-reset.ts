import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 小时

export function createResetToken() {
  const raw = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return { raw, hash, expiresAt };
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function getResetPasswordUrl(rawToken: string): string {
  const base =
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}
