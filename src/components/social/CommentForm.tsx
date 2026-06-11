"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addComment } from "@/app/actions/social";
import { dispatchNotificationsUpdated } from "@/lib/notification-events";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  postId,
  guestbookEntryId,
  streetMessageId,
  parentId,
  placeholder = "写下评论…",
  compact = false,
  onSuccess,
}: {
  postId?: string;
  guestbookEntryId?: string;
  streetMessageId?: string;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
  onSuccess?: (data: { id: string; body: string; parentId?: string | null }) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = fd.get("body") as string;
    const result = await addComment({
      body,
      postId,
      guestbookEntryId,
      streetMessageId,
      parentId,
    });
    if (result.ok) {
      e.currentTarget.reset();
      toast.success(parentId ? "回复已发送" : "评论已发表");
      dispatchNotificationsUpdated();
      if (onSuccess && result.data) {
        onSuccess({ id: result.data.id, body: body.trim(), parentId: parentId ?? null });
      } else {
        router.refresh();
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-2 space-y-1" : "space-y-2"}>
      {error && (
        <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>
      )}
      <Textarea
        name="body"
        placeholder={placeholder}
        aria-label={parentId ? "回复内容" : "评论内容"}
        required
        rows={compact ? 2 : 3}
        maxLength={500}
        className={compact ? "text-sm" : undefined}
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : parentId ? "回复" : "发表"}
      </Button>
    </form>
  );
}
