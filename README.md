# 阿尔法重庆

一座三维山城地图上的文字生活社区。在虚拟重庆选区、选街、开店或入住公寓，以长文与短文记录生活——没有短视频，只有文字与图片。

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
| `DATABASE_URL_UNPOOLED` | （可选）Prisma 迁移用直连 URL，Neon 控制台提供 |
| `UPSTASH_REDIS_REST_URL` | （可选）登录/注册速率限制 |
| `UPSTASH_REDIS_REST_TOKEN` | （可选）与上配套 |

### 2. 数据库

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
```

> **警告**：`npm run db:seed` 会执行 `clearCityData()` 清空城区/街道/铺位等业务数据后重新写入，**切勿在生产环境随意执行**。首次部署或本地开发初始化时使用即可。

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

## 访问策略（策略 A）

| 功能 | 是否需要登录 |
|------|----------------|
| 浏览地图、区/街/店铺、文章、用户主页、公寓展示 | 否 |
| 注册（需邀请码）、登录、写作、开店、留言、管理后台 | 是 |
| `/api/health` 健康检查 | 否（供监控探测） |

3D 区划边界与街道坐标的**运行时真源**为 `src/lib/chongqing/geo.ts`；数据库 `boundaryPolygon` 仅用于种子同步。

## 功能概览

- 公开浏览 + 邀请制注册
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

## CI 与测试

推送至 `main` 时 GitHub Actions 会执行 `prisma validate`、`lint` 与 `build`（见 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)）。

本地冒烟测试（需数据库可用）：

```bash
npm run test:e2e
```

## 运维

- **健康检查**：`GET /api/health` 返回 `{ "status": "ok" }`，数据库不可用时 503
- **公开页缓存**：区划/店铺/文章等只读页 `revalidate = 60` 秒；开店/写作后通过 `revalidatePath` 失效首页等路径
- **速率限制**：未配置 Upstash 时开发环境跳过；生产使用进程内节流（推荐配置 Upstash）

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
