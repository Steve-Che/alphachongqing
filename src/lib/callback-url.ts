/** 仅允许站内相对路径，防止开放重定向 */
export function sanitizeCallbackUrl(url: string | null | undefined): string {
  if (!url) return "/";
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return "/";
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";
  if (decoded.includes("://")) return "/";
  return decoded;
}
