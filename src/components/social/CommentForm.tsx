"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  postId,
  guestbookEntryId,
  streetMessageId,
  parentId,
  placeholder = "写下评论…",
  compact = false,
}: {
  postId?: string;
  guestbookEntryId?: string;
  streetMessageId?: string;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await addComment({
      body: fd.get("body") as string,
      postId,
      guestbookEntryId,
      streetMessageId,
      parentId,
    });
    if (result.ok) {
      e.currentTarget.reset();
      router.refresh();
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
