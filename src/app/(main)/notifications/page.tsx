import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";
import { MarkAllReadButton } from "@/components/social/MarkAllReadButton";
import { NotificationList } from "@/components/social/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { items, nextCursor } = await getNotifications(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">通知</h1>
          <p className="mt-1 text-sm text-stone-500">有人回应你时的站内提醒。</p>
        </div>
        <MarkAllReadButton />
      </header>

      <NotificationList initialItems={items} initialCursor={nextCursor} />
    </div>
  );
}
