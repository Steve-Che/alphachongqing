"use client";

import { useState } from "react";
import { toast } from "sonner";
import { openShop } from "@/app/actions/shop";
import { shopPath } from "@/lib/route-slug";
import { SettleSuccessModal } from "@/components/residence/SettleSuccessModal";
import { ShopCoverPresetPicker } from "@/components/shop/ShopCoverPresetPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OpenShopForm({
  shopSlotId,
  compact = false,
  onSuccess,
}: {
  shopSlotId: string;
  compact?: boolean;
  onSuccess?: (slug: string) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shopSlug, setShopSlug] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    const fd = new FormData(form);
    const name = fd.get("name") as string;
    const tagline = fd.get("tagline") as string;
    try {
      const result = await openShop(shopSlotId, name, tagline, coverUrl);
      if (result.ok && result.data) {
        setShopSlug(result.data.slug);
        setModalOpen(true);
        toast.success("店铺开业啦！");
        onSuccess?.(result.data.slug);
        form.reset();
      } else {
        setError(result.ok ? "开店失败" : result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={
          compact
            ? "mt-2 space-y-2"
            : "mt-2 space-y-2 rounded border border-dashed border-accent bg-paper p-3"
        }
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input name="name" placeholder="店铺名称" required />
        {!compact && (
          <>
            <Input name="tagline" placeholder="一句话介绍（可选）" />
            <ShopCoverPresetPicker
              value={coverUrl}
              onChange={setCoverUrl}
              disabled={loading}
            />
          </>
        )}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "开店中…" : "在此开店"}
        </Button>
      </form>
      <SettleSuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type="shop"
        links={{
          primary: { href: shopPath(shopSlug), label: "进入我的店铺" },
          secondary: { href: "/write/article", label: "写第一篇长文" },
          tertiary: { href: "/feed", label: "去街坊动态看看 →" },
        }}
      />
    </>
  );
}
