# 阿尔法重庆

一座致敬豆瓣 [阿尔法城](https://www.thepaper.cn/newsDetail_forward_1314256) 的 3D 虚拟城市社交平台。在类百度地图的三维山城地图上，选区、选街、开店或入住公寓，以长文与短文记录生活——没有短视频，只有文字与图片。

## 技术栈

- **Next.js 16** App Router + TypeScript
- **Three.js** / React Three Fiber — 3D 城市与街景
- **Prisma 7** + PostgreSQL (Neon)
- **Auth.js** — 邮箱密码 + 邀请码注册
- **Vercel Blob** — 图片上传
- **Tiptap** — 长文编辑

## 本地开发

### 1. 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

填写：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串（推荐 [Neon](https://neon.tech)） |
| `AUTH_SECRET` | `openssl rand -base64 32` 生成 |
| `AUTH_URL` | `http://localhost:3000` |
| `RESEND_API_KEY` | （可选）找回密码邮件，[Resend](https://resend.com) |
| `EMAIL_FROM` | （可选）发件人，如 `阿尔法重庆 <noreply@yourdomain.com>` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 令牌（图片上传，可选） |

### 2. 数据库

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
```

### 3. 启动

```bash
npm run dev
```

访问 http://localhost:3000

### 种子账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@alphachongqing.local | admin123 |
| 演示用户 | demo@alphachongqing.local | demo1234 |

邀请码示例：`ALPHA2026`、`CHONGQING`、`WELCOME99`

## 部署到 Vercel

项目已包含 [`vercel.json`](vercel.json)，构建时会自动执行 `prisma generate`、`prisma migrate deploy` 与 `next build`。

### 方式一：Git 集成（推荐）

1. 推送至 GitHub
2. 在 [Vercel Dashboard](https://vercel.com/new) 导入仓库
3. 通过 Marketplace 连接 **Neon Postgres** 与 **Blob Storage**
4. 在 Vercel 项目设置中添加环境变量：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon 自动注入，或手动填写 |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | 生产域名，如 `https://your-app.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Blob 集成自动注入 |

5. 首次部署成功后，在本地或 Vercel Shell 执行种子数据：

```bash
npm run db:seed
```

### 方式二：Vercel CLI

```bash
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```

## 功能概览

- 邀请制注册
- 6 个核心区域 3D 地图（渝中、江北、南岸、沙坪坝、九龙坡、大渡口）
- 区 → 街 → 店铺（六房间）/ 公寓选位
- 长文（轻博客）与短文（微博式）
- 街道留言、店铺留言板
- 管理员邀请码后台 `/admin/invites`

## 找回密码

1. 登录页点击「忘记密码？」
2. 输入注册邮箱，收到重置链接（需配置 `RESEND_API_KEY` 与 `EMAIL_FROM`）
3. 打开链接设置新密码

本地开发未配置邮件时，重置链接会打印在服务端终端日志中。

## 常见问题

### 控制台出现 `content.js` / `page-events.js` 报错

多为浏览器扩展（如 **Bardeen**）注入脚本导致，与本站无关，可忽略或在扩展管理中限制对本站的访问。

### 控制台出现 `page-events.js` / `handleKeyDown` 报错

这通常来自浏览器扩展 **Bardeen**（或其他自动化类扩展）注入的 `page-events.js`，并非本站代码。扩展在 `keydown` 时读取 `event.key.length`，遇到 `event.key` 为空会抛错。

**处理方式（任选其一）：**

1. 在 Chrome 扩展管理里，将 Bardeen 设为「点击时启用」，或对本站 `alphachongqing.vercel.app` 关闭站点访问权限
2. 忽略该控制台报错（不影响地图与开店功能）

本站已对 3D 画布做了焦点隔离，可降低触发概率。

## 项目结构

```
src/
  app/(auth)/       登录、注册
  app/(main)/       地图、街道、店铺、用户主页、写作
  components/map/   3D 城市与街景
  components/shop/  店铺与入驻
  lib/chongqing/    地理坐标数据
prisma/             数据模型与种子
```

## License

MIT
