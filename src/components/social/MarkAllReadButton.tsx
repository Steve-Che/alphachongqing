"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markAllNotificationsRead } from "@/app/actions/social";
import { dispatchNotificationsUpdated } from "@/lib/notification-events";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await markAllNotificationsRead();
    dispatchNotificationsUpdated(0);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "处理中…" : "全部标为已读"}
    </Button>
  );
}
