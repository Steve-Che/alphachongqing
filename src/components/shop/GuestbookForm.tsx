"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addGuestbookEntry } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function GuestbookForm({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await addGuestbookEntry(shopId, fd.get("content") as string);
    if (result.ok) {
      e.currentTarget.reset();
      toast.success("留言已发送");
      router.refresh();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Textarea name="content" placeholder="留下你的留言…" required rows={3} maxLength={500} />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "留言"}
      </Button>
    </form>
  );
}
