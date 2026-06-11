"use client";

import Link from "next/link";
import { useState } from "react";
import { markNotificationRead } from "@/app/actions/social";
import { AuthorLink } from "@/components/social/AuthorLink";
import { dispatchNotificationsUpdated } from "@/lib/notification-events";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  COMMENT: "评论",
  REPLY: "回复",
  FOLLOW: "关注",
  LIKE: "点赞",
};

export function NotificationItem({
  id,
  href,
  type,
  body,
  createdAt,
  readAt,
  actor,
}: {
  id: string;
  href: string;
  type: string;
  body: string | null;
  createdAt: Date;
  readAt: Date | null;
  actor: { username: string; displayName: string | null };
}) {
  const [read, setRead] = useState(!!readAt);

  function handleClick() {
    if (!read) {
      setRead(true);
      markNotificationRead(id).then(() => {
        dispatchNotificationsUpdated();
      });
    }
  }

  return (
    <li
      className={`rounded border px-4 py-3 ${
        read
          ? "border-stone-200 bg-paper text-stone-600"
          : "border-accent/30 bg-amber-50/50"
      }`}
    >
      <Link href={href} className="block hover:text-accent" onClick={handleClick}>
        <span className="text-xs text-stone-400">{TYPE_LABELS[type] ?? type}</span>
        <p className="mt-0.5">
          <AuthorLink author={actor} />
          {body ? ` ${body}` : ""}
        </p>
        <time className="mt-1 block text-xs text-stone-400">
          {formatDate(createdAt)}
        </time>
      </Link>
    </li>
  );
}
