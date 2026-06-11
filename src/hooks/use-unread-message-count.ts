"use client";

import { useCallback, useEffect, useState } from "react";

export function useUnreadMessageCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    fetch("/api/messages/unread-count")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((data: { count: number }) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, [enabled]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { count, refresh };
}
