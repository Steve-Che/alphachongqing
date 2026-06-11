"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function StartConversationForm({
  targetUsername,
}: {
  targetUsername: string;
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
      const result = await startConversation(targetUsername, body);
      if (result.ok && result.data) {
        router.push(`/messages/${result.data.conversationId}`);
      } else {
        setError(result.ok ? "发送失败" : result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Textarea
        name="body"
        placeholder={`给 @${targetUsername} 发私信…`}
        rows={3}
        required
        maxLength={2000}
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "发起私信"}
      </Button>
    </form>
  );
}
