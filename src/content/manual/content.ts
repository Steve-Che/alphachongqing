import type { ManualChapterContent } from "./types";

export const MANUAL_CONTENT: Record<string, ManualChapterContent> = {
  overview: {
    slug: "overview",
    intro:
      "阿尔法重庆是一座虚拟山城社区：以文字与图片为主，没有短视频。任何人可浏览地图与店铺；入驻、写作与社交互动需邀请码注册后登录。",
    sections: [
      {
        title: "六个城区",
        paragraphs: [
          "首页三维地图划分为六个彩色区域，每个区域有 8 条街道：",
          "渝中区（城心）、江北区（北岸）、南岸区（长江南岸）、沙坪坝区（西岸文教）、九龙坡区（西城）、大渡口区（工业记忆）。",
        ],
        links: [
          { href: "/", label: "打开城市地图" },
          { href: "/district/yuzhong", label: "示例：渝中区" },
        ],
      },
      {
        title: "一人一地盘",
        paragraphs: [
          "每位街坊同一时间只能拥有一间店铺或一间公寓，二者不可兼得。",
          "若想从开店改为入住公寓（或反之），需先在个人主页「释放」当前地盘，再重新选择业态。",
          "搬家是在同一业态内换地址，不会变成另一种业态。",
        ],
      },
      {
        title: "权限矩阵",
        paragraphs: ["下表说明哪些页面无需登录、哪些需要登录后才能操作。"],
        note: "未登录用户可浏览地图、街道、店铺、公寓、文章、短文与用户主页；写文、开店、关注、通知等需登录。",
      },
      {
        title: "全站路由索引",
        paragraphs: ["平台当前主要页面如下，便于你快速跳转验证："],
        links: [
          { href: "/", label: "首页 / 城市地图" },
          { href: "/guide", label: "街坊手册目录" },
          { href: "/district/yuzhong", label: "城区页" },
          { href: "/street/yuzhong-解放碑大道", label: "街道页" },
          { href: "/shop/shudong-coffee", label: "店铺页" },
          { href: "/apartment/1", label: "公寓页（示例 ID）" },
          { href: "/article/1", label: "长文页" },
          { href: "/moment/1", label: "短文页" },
          { href: "/u/demo", label: "用户主页" },
          { href: "/search", label: "搜索" },
          { href: "/feed", label: "街坊动态" },
          { href: "/notifications", label: "通知" },
          { href: "/write/article", label: "写长文" },
          { href: "/write/moment", label: "发短文" },
          { href: "/settings", label: "个人设置" },
          { href: "/login", label: "登录" },
          { href: "/register", label: "注册" },
          { href: "/forgot-password", label: "忘记密码" },
          { href: "/admin", label: "管理后台（仅管理员）" },
        ],
      },
    ],
    relatedLinks: [
      { href: "/register", label: "邀请码注册" },
      { href: "/guide/account", label: "下一章：账号与登录" },
    ],
  },

  account: {
    slug: "account",
    intro: "新街坊需凭邀请码注册。登录后可写作、开店与社交；系统会记住你来自的页面并在登录后自动跳回。",
    sections: [
      {
        title: "邀请码注册",
        steps: [
          "向已有街坊或管理员索取邀请码。",
          "打开注册页，填写邮箱、昵称、密码与邀请码。",
          "提交成功后跳转到街坊手册目录，顶部会显示欢迎横幅与四步入驻清单。",
        ],
        links: [{ href: "/register", label: "去注册" }],
      },
      {
        title: "登录与回跳",
        paragraphs: [
          "从地图、动态等需登录的入口点「登录」，系统会带上 callbackUrl 参数。",
          "登录成功后会自动回到你刚才想去的页面，无需重新找路。",
        ],
        links: [{ href: "/login", label: "去登录" }],
      },
      {
        title: "忘记密码",
        steps: [
          "在登录页点击「忘记密码」。",
          "输入注册邮箱，按提示完成重置（开发环境请查看邮件日志或控制台）。",
          "用新密码重新登录。",
        ],
        links: [{ href: "/forgot-password", label: "忘记密码" }],
      },
      {
        title: "退出登录",
        paragraphs: ["点击 Header 右侧头像菜单中的「退出登录」即可安全登出。"],
      },
    ],
    relatedLinks: [
      { href: "/guide/map", label: "下一章：城市地图" },
      { href: "/guide", label: "返回手册目录" },
    ],
  },

  map: {
    slug: "map",
    intro: "城市地图是阿尔法重庆的主入口。你可以在三维街景中漫游，也可以切换到列表模式浏览。",
    sections: [
      {
        title: "首页三维地图",
        steps: [
          "滚轮缩放视野，拖拽平移（移动端单指滑动）。",
          "点击六个彩色区域块，下钻到对应城区页。",
          "在城区或街道的三维街景中，点击前排金色铺面或后排公寓楼进行选位。",
        ],
        links: [{ href: "/#map", label: "打开地图" }],
      },
      {
        title: "3D 与列表浏览切换",
        paragraphs: [
          "地图区域右上角可切换「3D 街景」与「列表浏览」。",
          "若浏览器不支持 WebGL 或显卡驱动异常，系统会自动降级为列表模式，功能不受影响。",
        ],
      },
      {
        title: "街心广场与可租铺位",
        paragraphs: [
          "每条街道前排有若干金色「招租中」铺位，以及中间的街心广场（不可租）。",
          "后排为 30 栋蓝灰色公寓塔楼，每栋有多间可入住房间。",
          "已租铺面与已入住公寓会显示店主/住户信息，可点击进入详情。",
        ],
      },
      {
        title: "城区页与街道页",
        paragraphs: [
          "城区页展示本区 8 条街道的入口与简介。",
          "街道页提供三维街景、空铺/空房列表、本街动态与街道留言。",
        ],
        links: [
          { href: "/district/yuzhong", label: "渝中区" },
          { href: "/street/yuzhong-解放碑大道", label: "解放碑大道" },
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/settle", label: "下一章：入驻与搬家" },
      { href: "/", label: "回到城市地图" },
    ],
  },

  settle: {
    slug: "settle",
    intro: "入驻是成为街坊的关键一步：开店面向公众展示与经营，公寓适合安静发短文。选定后还可搬家换址，或释放后改选业态。",
    sections: [
      {
        title: "开店",
        steps: [
          "确认你尚未拥有店铺或公寓（一人一地盘）。",
          "在地图街景或街道页找到「招租中」铺位，点击后填写店名。",
          "提交后店铺立即开业，获得独立链接与六个房间。",
        ],
        links: [{ href: "/street/yuzhong-解放碑大道", label: "去街道选铺" }],
      },
      {
        title: "入住公寓",
        steps: [
          "在街道页或地图街景点击后排公寓楼。",
          "选择楼栋与室号（仅显示空置房间）。",
          "确认入住后获得公寓主页链接。",
        ],
      },
      {
        title: "搬家（换址）",
        paragraphs: [
          "店主可把店铺迁到另一空铺，住户可搬到另一空房。店铺会保留名称、链接、房间布置与留言板；公寓链接会更新为新房间号。",
          "在地图选中空铺/空楼，或去街道页点击「搬到此铺 / 搬到此间」。",
        ],
        note: "每 24 小时可搬家一次。搬家不等于释放，业态不变。",
      },
      {
        title: "释放（退租/关店）",
        paragraphs: [
          "在个人主页或地盘横幅点击「释放」。",
          "店铺将被删除（含留言与房间内容）；公寓将退租。",
          "释放后才可以重新选择另一种业态（开店或入住）。",
        ],
        note: "释放与搬家不同：释放是放弃当前地盘，搬家是保留内容只换地址。",
      },
      {
        title: "业态不可互转",
        paragraphs: [
          "有店不能租公寓，有公寓不能开店。必须先释放，再选新业态。",
          "平台暂不支持店铺与公寓之间的直接转换。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/shop", label: "下一章：店铺经营" },
      { href: "/u/demo", label: "查看演示用户主页" },
    ],
  },

  shop: {
    slug: "shop",
    intro: "店铺是你在阿尔法重庆的公开门面：平面图展示六个房间，可挂载自己的长文，留言板供访客互动。",
    sections: [
      {
        title: "店铺首页与平面图",
        paragraphs: [
          "进入店铺页可看到平面布局：前厅、左厢、右厢、正厅、后花园与留言板侧室。",
          "点击房间名称进入对应房间页，查看已挂载的长文或店主布置。",
        ],
        links: [{ href: "/shop/shudong-coffee", label: "示例：树洞咖啡" }],
      },
      {
        title: "房间改名与挂载长文",
        steps: [
          "以店主身份进入某房间页。",
          "可修改房间显示名称。",
          "从自己已发布的长文中选择一篇挂载到该房间（每房间一篇）。",
        ],
        note: "仅店主可改名与挂载；访客只能阅读。",
      },
      {
        title: "店铺留言板",
        paragraphs: [
          "留言板侧室供访客留言，店主与访客均可回复，但仅支持一层回复（不能回复的回复）。",
          "店主可删除自己店铺内的留言。",
        ],
      },
      {
        title: "访客与店主权限",
        paragraphs: [
          "访客：浏览所有房间、阅读挂载长文、在留言板留言与一层回复。",
          "店主：改名、挂载/更换长文、删除留言、搬家、释放。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/content", label: "下一章：内容创作" },
      { href: "/shop/shudong-coffee", label: "参观树洞咖啡" },
    ],
  },

  content: {
    slug: "content",
    intro: "阿尔法重庆支持长文（深度文章）与短文（微博式动态）。长文可挂到店铺房间，短文可关联街道并在动态流中展示。",
    sections: [
      {
        title: "写长文",
        steps: [
          "登录后点击 Header「写作」或底栏「写作」，选择写长文。",
          "使用编辑器撰写正文，可插入图片。",
          "发布后获得独立文章链接，可分享到站外。",
        ],
        links: [{ href: "/write/article", label: "写长文" }],
      },
      {
        title: "编辑与删除长文",
        paragraphs: [
          "在文章页或你的个人主页找到该长文，作者可见编辑入口。",
          "编辑页地址为 /write/article?id=文章ID。",
          "删除后不可恢复，已从店铺房间挂载的关联也会解除。",
        ],
      },
      {
        title: "发短文",
        steps: [
          "进入写短文页或在街道页使用 inline 发文框。",
          "正文限 500 字，最多 9 张配图。",
          "可选择关联某条街道，便于在本街动态中聚合展示。",
        ],
        links: [{ href: "/write/moment", label: "发短文" }],
      },
      {
        title: "街道留言",
        paragraphs: [
          "在街道页底部可发表街道留言，类似公共布告栏。",
          "管理员可将历史留言归档（普通用户不可见归档操作）。",
        ],
      },
      {
        title: "街道页 inline 发短文",
        paragraphs: [
          "已登录用户在街道页可直接用发文框发短文，无需跳转写作页。",
          "适合记录「今天在这条街上发生了什么」。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/social", label: "下一章：街坊社交" },
      { href: "/write/moment", label: "发一条短文" },
    ],
  },

  social: {
    slug: "social",
    intro: "关注邻居、刷街坊动态、评论点赞与接收通知，构成阿尔法重庆的社交闭环。",
    sections: [
      {
        title: "关注与粉丝",
        steps: [
          "进入用户主页，点击「关注」按钮。",
          "互相关注会显示「互关」；对方关注你而你没有回关时，可点「回关」。",
          "在用户主页或粉丝/关注列表页查看完整名单。",
        ],
        links: [
          { href: "/u/demo/followers", label: "粉丝列表示例" },
          { href: "/u/demo/following", label: "关注列表示例" },
        ],
      },
      {
        title: "街坊动态 Feed",
        paragraphs: [
          "动态页展示你所关注用户的短文、长文与入驻动态。",
          "若尚未关注任何人，会推荐一批邻居供你一键关注。",
        ],
        links: [{ href: "/feed", label: "街坊动态" }],
      },
      {
        title: "评论与点赞",
        paragraphs: [
          "短文与长文均支持评论，评论仅支持一层回复。",
          "短文可点赞；作者会收到点赞通知。",
        ],
      },
      {
        title: "通知",
        steps: [
          "点击 Header 铃铛图标进入通知页。",
          "可查看评论、回复、关注与点赞等提醒。",
          "支持「全部标为已读」。",
        ],
        links: [{ href: "/notifications", label: "通知中心" }],
      },
      {
        title: "搜索",
        paragraphs: [
          "搜索页可同时检索用户昵称与内容标题，快速找到邻居或文章。",
        ],
        links: [{ href: "/search", label: "搜索" }],
      },
      {
        title: "分享与外链预览",
        paragraphs: [
          "文章、短文、店铺等页面提供分享按钮，可复制链接。",
          "站外打开时会显示 Open Graph 预览图与摘要。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/profile", label: "下一章：个人主页与设置" },
      { href: "/feed", label: "刷街坊动态" },
    ],
  },

  profile: {
    slug: "profile",
    intro: "个人主页是你的街坊名片：展示长文与短文、粉丝关注数，以及当前店铺或公寓地盘。",
    sections: [
      {
        title: "用户主页",
        paragraphs: [
          "地址为 /u/你的昵称，展示头像、简介、长文列表、短文列表。",
          "显示粉丝数与关注数，可点击进入列表页。",
          "若该用户有店铺或公寓，会显示地盘入口。",
        ],
        links: [{ href: "/u/demo", label: "演示用户主页" }],
      },
      {
        title: "地盘横幅与搬家",
        paragraphs: [
          "登录后，手册目录页与个人主页会显示 ResidenceBanner：当前店铺或公寓、快捷入口与「搬家」按钮。",
          "也可从横幅跳转查看本手册入驻章节。",
        ],
      },
      {
        title: "个人设置",
        steps: [
          "进入设置页修改头像、昵称与个人简介。",
          "昵称变更后用户主页 URL 会随之更新。",
        ],
        links: [{ href: "/settings", label: "个人设置" }],
      },
      {
        title: "新街坊欢迎清单",
        paragraphs: [
          "注册成功跳转到手册目录时，WelcomeBanner 会列出四步：注册、入驻、发短文、关注邻居。",
          "完成后可收起横幅，不再显示。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/mobile", label: "下一章：移动端" },
      { href: "/settings", label: "去设置" },
    ],
  },

  mobile: {
    slug: "mobile",
    intro: "在手机浏览器中，底栏提供地图、动态、写作与我的四个主入口，与桌面 Header 互补。",
    sections: [
      {
        title: "底栏四 Tab",
        paragraphs: [
          "地图：回到首页城市地图。",
          "动态：街坊 Feed；未登录点击会引导登录并回跳。",
          "写作：快捷进入长文/短文写作入口。",
          "我的：进入个人主页或登录页。",
        ],
      },
      {
        title: "未登录点动态",
        paragraphs: [
          "底栏「动态」需要登录。未登录时会跳转到登录页，并带上 callbackUrl=/feed。",
          "登录成功后自动回到动态页。",
        ],
      },
      {
        title: "地图触控",
        paragraphs: [
          "城市地图区域支持纵向滚动手势（pan-y），避免与页面滚动冲突。",
          "街景三维画布内触控会拦截手势（touchAction: none），用于旋转与缩放街景。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide/faq", label: "下一章：常见问题" },
      { href: "/", label: "打开地图" },
    ],
  },

  admin: {
    slug: "admin",
    intro: "管理员（role=ADMIN）可访问运营后台：查看平台指标、发放邀请码、归档街道留言。本章仅管理员可见。",
    sections: [
      {
        title: "运营仪表盘",
        paragraphs: [
          "仪表盘展示用户、店铺、公寓、文章与短文等核心计数。",
          "用于快速了解平台运行状况。",
        ],
        links: [{ href: "/admin", label: "管理仪表盘" }],
      },
      {
        title: "邀请码管理",
        steps: [
          "进入邀请码页面。",
          "创建新邀请码（可设置备注与有效期）。",
          "将邀请码发给新用户；可随时吊销未使用的码。",
        ],
        links: [{ href: "/admin/invites", label: "邀请码管理" }],
      },
      {
        title: "街道留言归档",
        paragraphs: [
          "管理员可在街道页对留言执行归档，保持街道布告栏整洁。",
          "归档后普通用户不再看到该条留言。",
        ],
      },
      {
        title: "访问限制",
        paragraphs: [
          "非管理员访问 /admin 会被重定向。",
          "本手册 admin 章节同样仅管理员可阅读，其他用户访问会回到手册目录。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/admin", label: "进入管理后台" },
      { href: "/guide", label: "返回手册目录" },
    ],
  },

  faq: {
    slug: "faq",
    intro: "演示账号、示例链接与常见疑问，帮你快速体验整座虚拟山城。",
    sections: [
      {
        title: "演示账号",
        paragraphs: [
          "管理员：admin@alphachongqing.local / admin123",
          "演示店主：demo@alphachongqing.local / demo1234（树洞咖啡）",
          "演示住户：apt@alphachongqing.local / apt1234（洪崖洞巷公寓）",
        ],
        links: [{ href: "/login", label: "去登录" }],
      },
      {
        title: "示例链接",
        links: [
          { href: "/shop/shudong-coffee", label: "树洞咖啡（解放碑大道）" },
          { href: "/street/yuzhong-解放碑大道", label: "解放碑大道" },
          { href: "/u/demo", label: "演示用户主页" },
        ],
      },
      {
        title: "浏览器扩展报错",
        paragraphs: [
          "若控制台出现 content.js 相关报错，通常来自浏览器翻译或广告屏蔽扩展，与本站无关，可忽略或暂时关闭扩展。",
        ],
      },
      {
        title: "搬家冷却",
        paragraphs: [
          "搬家后 24 小时内不能再次搬家，请提前选好目标铺位或房间。",
        ],
      },
      {
        title: "公寓 URL 变更",
        paragraphs: [
          "搬家后公寓主页链接会变为新房间 ID，旧链接将失效。店铺 slug 搬家后保持不变。",
        ],
      },
    ],
    relatedLinks: [
      { href: "/guide", label: "返回手册目录" },
      { href: "/register", label: "邀请码注册" },
    ],
  },
};

export function getChapterContent(slug: string): ManualChapterContent | undefined {
  return MANUAL_CONTENT[slug];
}
