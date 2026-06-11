"use client";

import { NotificationItem } from "@/components/social/NotificationItem";
import { LoadMoreButton } from "@/components/ui/load-more-button";
import { loadMoreNotifications } from "@/app/actions/social";

type NotificationRow = {
  id: string;
  href: string;
  type: string;
  body: string | null;
  createdAt: Date;
  readAt: Date | null;
  actor: { username: string; displayName: string | null };
};

export function NotificationList({
  initialItems,
  initialCursor,
}: {
  initialItems: NotificationRow[];
  initialCursor: string | null;
}) {
  return (
    <LoadMoreButton
      initialItems={initialItems}
      initialCursor={initialCursor}
      loadMore={loadMoreNotifications}
      renderItem={(n) => (
        <NotificationItem
          key={n.id}
          id={n.id}
          href={n.href}
          type={n.type}
          body={n.body}
          createdAt={n.createdAt}
          readAt={n.readAt}
          actor={n.actor}
        />
      )}
      listClassName="space-y-2"
      emptyMessage="暂无通知。有人关注你、评论或点赞时会收到提醒。"
    />
  );
}
