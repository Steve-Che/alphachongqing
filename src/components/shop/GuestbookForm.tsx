"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGuestbookEntry } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function GuestbookForm({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await addGuestbookEntry(shopId, fd.get("content") as string);
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea name="content" placeholder="留下你的留言…" required rows={3} />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "留言"}
      </Button>
    </form>
  );
}
