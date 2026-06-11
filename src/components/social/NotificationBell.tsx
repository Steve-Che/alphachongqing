"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnread(data.count ?? 0);
      } catch {
        /* ignore */
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center hover:text-stone-900"
      aria-label="通知"
    >
      <span aria-hidden>🔔</span>
      {unread > 0 && (
        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
