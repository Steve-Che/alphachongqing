/**
 * 标准化 PostgreSQL 连接串，避免 pg v8 对 sslmode=require 的弃用警告。
 * Neon / Vercel 等云数据库应显式使用 sslmode=verify-full。
 * @see https://www.postgresql.org/docs/current/libpq-ssl.html
 */
export function getDatabaseUrl(): string {
  // Neon + Prisma 适配器在 Serverless 上宜用非池化连接，避免登录等查询失败
  const url =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocal =
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("@host.docker.internal");

  if (isLocal) return url;

  if (/[?&]sslmode=verify-full(?:&|$)/.test(url)) return url;

  if (/[?&]sslmode=(require|prefer|verify-ca)(?:&|$)/.test(url)) {
    return url.replace(
      /sslmode=(require|prefer|verify-ca)/,
      "sslmode=verify-full",
    );
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}sslmode=verify-full`;
}
