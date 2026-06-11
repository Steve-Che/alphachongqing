"use client";

import { useCallback, useEffect, useState } from "react";
import { NOTIFICATIONS_UPDATED } from "@/lib/notification-events";

export function useUnreadNotificationCount() {
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") {
        setUnread(detail.count);
      } else {
        fetchUnread();
      }
    };
    window.addEventListener(NOTIFICATIONS_UPDATED, onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_UPDATED, onUpdate);
    };
  }, [fetchUnread]);

  return unread;
}
