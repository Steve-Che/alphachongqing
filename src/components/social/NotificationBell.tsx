"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";
import { NotificationBadge } from "@/components/social/NotificationBadge";

export function NotificationBell() {
  const unread = useUnreadNotificationCount();

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center hover:text-stone-900"
      aria-label={unread > 0 ? `通知，${unread} 条未读` : "通知"}
    >
      <Icon icon={Bell} size={18} />
      <NotificationBadge count={unread} />
    </Link>
  );
}
