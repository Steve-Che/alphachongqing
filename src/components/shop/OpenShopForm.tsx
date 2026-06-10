"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openShop } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OpenShopForm({ shopSlotId }: { shopSlotId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const tagline = fd.get("tagline") as string;
    const result = await openShop(shopSlotId, name, tagline);
    if (result.ok && result.data) {
      router.push(`/shop/${result.data.slug}`);
      router.refresh();
    } else {
      setError(result.ok ? "开店失败" : result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded border border-dashed border-accent bg-paper p-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input name="name" placeholder="店铺名称" required />
      <Input name="tagline" placeholder="一句话介绍（可选）" />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "开店中…" : "在此开店"}
      </Button>
    </form>
  );
}
