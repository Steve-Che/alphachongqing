import type { ManualChapterMeta } from "./types";

export const MANUAL_CHAPTERS: ManualChapterMeta[] = [
  {
    slug: "overview",
    title: "产品全貌",
    summary: "定位、六个城区、权限矩阵与全站路由索引",
    order: 1,
  },
  {
    slug: "account",
    title: "账号与登录",
    summary: "邀请码注册、登录回跳、找回密码与退出",
    order: 2,
  },
  {
    slug: "map",
    title: "城市地图",
    summary: "3D/2D 浏览、城区下钻、街景选铺与选楼",
    order: 3,
  },
  {
    slug: "settle",
    title: "入驻与搬家",
    summary: "开店、公寓、搬家、释放与业态限制",
    order: 4,
  },
  {
    slug: "shop",
    title: "店铺经营",
    summary: "六房间、挂载长文、留言板与访客权限",
    order: 5,
  },
  {
    slug: "content",
    title: "内容创作",
    summary: "长文、短文、街道留言与编辑删除",
    order: 6,
  },
  {
    slug: "social",
    title: "街坊社交",
    summary: "关注、动态、评论、点赞、通知、搜索与分享",
    order: 7,
  },
  {
    slug: "profile",
    title: "个人主页与设置",
    summary: "用户主页、粉丝关注、地盘横幅与资料设置",
    order: 8,
  },
  {
    slug: "mobile",
    title: "移动端",
    summary: "底栏四 Tab、未登录引导与地图触控",
    order: 9,
  },
  {
    slug: "admin",
    title: "管理员后台",
    summary: "运营仪表盘、邀请码与街道留言归档",
    order: 10,
    adminOnly: true,
  },
  {
    slug: "faq",
    title: "常见问题",
    summary: "演示账号、示例链接与浏览器报错说明",
    order: 11,
  },
];

export function getChapterMeta(slug: string): ManualChapterMeta | undefined {
  return MANUAL_CHAPTERS.find((c) => c.slug === slug);
}

export function getPublicChapters(): ManualChapterMeta[] {
  return MANUAL_CHAPTERS.filter((c) => !c.adminOnly);
}

export function getVisibleChapters(isAdmin: boolean): ManualChapterMeta[] {
  return MANUAL_CHAPTERS.filter((c) => !c.adminOnly || isAdmin);
}
