/** 解码动态路由中的 slug（兼容中文街道名等） */
export function decodeRouteSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** 生成可安全用于 router.push 的路径段 */
export function encodeRouteSlug(slug: string): string {
  return encodeURIComponent(slug);
}
