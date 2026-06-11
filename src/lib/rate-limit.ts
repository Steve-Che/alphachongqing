import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const AUTH_LIMIT = 10;
const WINDOW_MS = 60_000;

type MemoryEntry = { count: number; resetAt: number };
const memoryStore = new Map<string, MemoryEntry>();

let upstashRatelimit: Ratelimit | null = null;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  upstashRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(AUTH_LIMIT, "1 m"),
    prefix: "alphacq",
  });
  return upstashRatelimit;
}

function checkMemoryLimit(key: string): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= AUTH_LIMIT) return false;
  entry.count++;
  return true;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

const SOCIAL_LIMIT = 20;

let socialRatelimit: Ratelimit | null = null;

function getSocialRatelimit(): Ratelimit | null {
  if (socialRatelimit) return socialRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  socialRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(SOCIAL_LIMIT, "1 m"),
    prefix: "alphacq:social",
  });
  return socialRatelimit;
}

/** 评论/留言等社交 Server Action 速率限制 */
export async function rateLimitSocialAction(
  action: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.UPSTASH_REDIS_REST_URL
  ) {
    return { ok: true };
  }

  const key = `social:${action}:${userId}`;
  const rl = getSocialRatelimit();

  if (rl) {
    const { success } = await rl.limit(key);
    if (!success) {
      return { ok: false, error: "操作过于频繁，请稍后再试" };
    }
    return { ok: true };
  }

  if (process.env.NODE_ENV === "production" && !checkMemoryLimit(key)) {
    return { ok: false, error: "操作过于频繁，请稍后再试" };
  }

  return { ok: true };
}

/** 登录/注册/找回密码等敏感 Server Action 速率限制 */
export async function rateLimitAuthAction(
  action: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.UPSTASH_REDIS_REST_URL
  ) {
    return { ok: true };
  }

  const ip = await getClientIp();
  const key = `${action}:${ip}`;
  const rl = getUpstashRatelimit();

  if (rl) {
    const { success } = await rl.limit(key);
    if (!success) {
      return { ok: false, error: "操作过于频繁，请稍后再试" };
    }
    return { ok: true };
  }

  if (process.env.NODE_ENV === "production" && !checkMemoryLimit(key)) {
    return { ok: false, error: "操作过于频繁，请稍后再试" };
  }

  return { ok: true };
}
