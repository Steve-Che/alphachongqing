"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rsvpPublicEvent, cancelRsvp } from "@/app/actions/public-venues";
import { Button } from "@/components/ui/button";

export function RsvpButton({
  eventId,
  initialRsvped,
  isLoggedIn,
}: {
  eventId: string;
  initialRsvped: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [rsvped, setRsvped] = useState(initialRsvped);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="inline-flex h-8 items-center rounded border border-stone-300 px-3 text-sm text-stone-700 hover:bg-stone-50"
      >
        登录后报名
      </a>
    );
  }

  async function toggle() {
    setLoading(true);
    try {
      const result = rsvped
        ? await cancelRsvp(eventId)
        : await rsvpPublicEvent(eventId);
      if (result.ok) {
        setRsvped(!rsvped);
        toast.success(rsvped ? "已取消报名" : "报名成功");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={rsvped ? "outline" : "default"}
      disabled={loading}
      onClick={toggle}
    >
      {loading ? "处理中…" : rsvped ? "已报名 · 取消" : "报名参加"}
    </Button>
  );
}
