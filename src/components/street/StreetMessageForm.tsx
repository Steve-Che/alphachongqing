"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addStreetMessage } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function StreetMessageForm({ streetId }: { streetId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await addStreetMessage(streetId, fd.get("content") as string);
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        name="content"
        placeholder="在街道上留言，像当年的大字报…"
        rows={2}
        required
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "街道留言"}
      </Button>
    </form>
  );
}
