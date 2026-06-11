export { MANUAL_CHAPTERS, getChapterMeta, getPublicChapters, getVisibleChapters } from "./chapters";
export { MANUAL_CONTENT, getChapterContent } from "./content";
export type { ManualChapterContent, ManualChapterMeta, ManualLink, ManualSection } from "./types";

export const PERMISSION_MATRIX = [
  { path: "地图、城区、街道", access: "公开浏览", login: false },
  { path: "店铺、公寓、文章、短文", access: "公开浏览", login: false },
  { path: "用户主页、搜索", access: "公开浏览", login: false },
  { path: "街坊手册", access: "公开浏览（admin 章除外）", login: false },
  { path: "开店、入住、搬家、释放", access: "需登录", login: true },
  { path: "写长文、发短文、评论、点赞", access: "需登录", login: true },
  { path: "关注、动态、通知", access: "需登录", login: true },
  { path: "个人设置", access: "需登录", login: true },
  { path: "管理后台", access: "仅 ADMIN", login: true },
] as const;

export const ROUTE_INDEX = [
  { path: "/", label: "首页 / 城市地图" },
  { path: "/guide", label: "街坊手册" },
  { path: "/district/[slug]", label: "城区页" },
  { path: "/street/[slug]", label: "街道页" },
  { path: "/shop/[slug]", label: "店铺首页" },
  { path: "/shop/[slug]/[room]", label: "店铺房间" },
  { path: "/apartment/[id]", label: "公寓页" },
  { path: "/article/[id]", label: "长文页" },
  { path: "/moment/[id]", label: "短文页" },
  { path: "/u/[username]", label: "用户主页" },
  { path: "/u/[username]/followers", label: "粉丝列表" },
  { path: "/u/[username]/following", label: "关注列表" },
  { path: "/search", label: "搜索" },
  { path: "/feed", label: "街坊动态" },
  { path: "/notifications", label: "通知" },
  { path: "/write/article", label: "写长文" },
  { path: "/write/moment", label: "发短文" },
  { path: "/settings", label: "个人设置" },
  { path: "/login", label: "登录" },
  { path: "/register", label: "注册" },
  { path: "/forgot-password", label: "忘记密码" },
  { path: "/reset-password", label: "重置密码" },
  { path: "/admin", label: "管理仪表盘" },
  { path: "/admin/invites", label: "邀请码管理" },
] as const;
