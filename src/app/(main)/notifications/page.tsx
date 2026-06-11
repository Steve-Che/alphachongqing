import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { AuthorLink } from "@/components/social/AuthorLink";
import { MarkAllReadButton } from "@/components/social/MarkAllReadButton";

const TYPE_LABELS: Record<string, string> = {
  COMMENT: "评论",
  REPLY: "回复",
  FOLLOW: "关注",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await getNotifications(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">通知</h1>
          <p className="mt-1 text-sm text-stone-500">有人回应你时的站内提醒。</p>
        </div>
        <MarkAllReadButton />
      </header>

      {notifications.length === 0 ? (
        <p className="text-stone-500">暂无通知。</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded border px-4 py-3 ${
                n.readAt
                  ? "border-stone-200 bg-paper text-stone-600"
                  : "border-accent/30 bg-amber-50/50"
              }`}
            >
              <Link href={n.href} className="block hover:text-accent">
                <span className="text-xs text-stone-400">
                  {TYPE_LABELS[n.type] ?? n.type}
                </span>
                <p className="mt-0.5">
                  <AuthorLink author={n.actor} />
                  {n.body ? ` ${n.body}` : ""}
                </p>
                <time className="mt-1 block text-xs text-stone-400">
                  {formatDate(n.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
