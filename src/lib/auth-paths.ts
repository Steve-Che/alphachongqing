/** 策略 A：公开浏览 + 邀请入驻 — 无需登录即可访问的路径 */

const EXACT_PUBLIC = new Set([
  "/",
  "/guide",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const PREFIX_PUBLIC = [
  "/district/",
  "/street/",
  "/shop/",
  "/article/",
  "/moment/",
  "/u/",
  "/apartment/",
  "/search",
  "/api/auth/",
  "/api/health",
];

export function isPublicPath(pathname: string): boolean {
  if (EXACT_PUBLIC.has(pathname)) return true;
  return PREFIX_PUBLIC.some((prefix) => pathname.startsWith(prefix));
}
