"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendDirectMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function DirectMessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    const body = (new FormData(form).get("body") as string) ?? "";
    try {
      const result = await sendDirectMessage(conversationId, body);
      if (result.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t border-stone-200 pt-4">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Textarea name="body" placeholder="写私信…" rows={3} required maxLength={2000} />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "发送"}
      </Button>
    </form>
  );
}
