"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addVenueMessage } from "@/app/actions/public-venues";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function VenueMessageForm({
  venueId,
  venueSlug,
}: {
  venueId: string;
  venueSlug: string;
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
      const result = await addVenueMessage(
        venueId,
        fd.get("content") as string,
      );
      if (result.ok) {
        form.reset();
        toast.success("留言已发布");
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
        placeholder="在场馆留言板上写点什么…"
        rows={2}
        required
        maxLength={500}
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "发送中…" : "发布留言"}
      </Button>
    </form>
  );
}
