import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAdminDashboardStats,
  getRecentAdminActivity,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { ArchiveMessageButton } from "@/components/admin/ArchiveMessageButton";
import { getPostDetailPath } from "@/lib/post-path";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [stats, activity] = await Promise.all([
    getAdminDashboardStats(),
    getRecentAdminActivity(8),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold">运营仪表盘</h1>
        <p className="mt-1 text-sm text-stone-500">
          只读概览 ·{" "}
          <Link href="/admin/invites" className="text-accent hover:underline">
            邀请码管理
          </Link>
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "注册用户", value: stats.users },
          { label: "店铺数", value: stats.shops },
          { label: "公寓入住", value: stats.apartmentResidents },
          { label: "已发布内容", value: stats.posts },
          { label: "邀请码使用", value: stats.inviteUsed },
          { label: "入驻率", value: `${stats.settleRate}%` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded border border-stone-200 bg-paper px-4 py-3"
          >
            <dt className="text-xs text-stone-500">{item.label}</dt>
            <dd className="mt-1 font-serif text-2xl font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">最近评论</h2>
        <ul className="space-y-2 text-sm">
          {activity.comments.map((c) => (
            <li key={c.id} className="rounded border border-stone-200 bg-paper px-3 py-2">
              <span className="text-stone-500">
                {c.author.displayName ?? c.author.username}
              </span>
              ：{c.body.slice(0, 80)}
              {c.post && (
                <>
                  {" "}
                  <Link
                    href={getPostDetailPath(c.post.id, c.post.type)}
                    className="text-accent hover:underline"
                  >
                    查看
                  </Link>
                </>
              )}
              <time className="ml-2 text-xs text-stone-400">
                {formatDate(c.createdAt)}
              </time>
            </li>
          ))}
          {activity.comments.length === 0 && (
            <li className="text-stone-500">暂无评论</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">街道留言（可归档）</h2>
        <ul className="space-y-2 text-sm">
          {activity.messages.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded border border-stone-200 bg-paper px-3 py-2"
            >
              <div>
                <span className="text-stone-500">
                  {m.street.nameZh} · {m.author.displayName ?? m.author.username}
                </span>
                <p className="text-stone-800">{m.content.slice(0, 120)}</p>
                <time className="text-xs text-stone-400">{formatDate(m.createdAt)}</time>
              </div>
              {!m.archived && <ArchiveMessageButton messageId={m.id} />}
              {m.archived && (
                <span className="text-xs text-stone-400">已归档</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
