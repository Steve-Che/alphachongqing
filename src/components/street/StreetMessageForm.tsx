"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addStreetMessage } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function StreetMessageForm({
  streetId,
  streetSlug,
  canPostOfficial = false,
}: {
  streetId: string;
  streetSlug: string;
  canPostOfficial?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    const fd = new FormData(form);
    try {
      const asOfficial = fd.get("asOfficial") === "on";
      const result = await addStreetMessage(
        streetId,
        fd.get("content") as string,
        { asOfficial },
      );
      if (result.ok) {
        form.reset();
        toast.success("街道留言已发布");
        window.dispatchEvent(
          new CustomEvent("street-activity-refresh", {
            detail: { streetSlug },
          }),
        );
        router.refresh();
      } else {
        setError(result.error);
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
        name="content"
        placeholder="在街道上留言，像当年的大字报…"
        rows={2}
        required
        maxLength={500}
      />
      {canPostOfficial && (
        <label className="flex items-center gap-2 text-xs text-stone-600">
          <input type="checkbox" name="asOfficial" className="rounded" />
          作为街道服务长官方公告发布
        </label>
      )}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "街道留言"}
      </Button>
    </form>
  );
}
