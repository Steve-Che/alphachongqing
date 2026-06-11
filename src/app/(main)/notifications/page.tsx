import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/queries";
import { MarkAllReadButton } from "@/components/social/MarkAllReadButton";
import { NotificationList } from "@/components/social/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [{ items, nextCursor }, unreadCount] = await Promise.all([
    getNotifications(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">通知</h1>
          <p className="mt-1 text-sm text-stone-500">
            关注、评论、回复与点赞会出现在这里。
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </header>

      <NotificationList initialItems={items} initialCursor={nextCursor} />
    </div>
  );
}
