"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateShopSettings } from "@/app/actions/shop";
import { uploadImage } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ShopSettingsFormProps = {
  shop: {
    name: string;
    tagline: string | null;
    coverUrl: string | null;
  };
};

export function ShopSettingsForm({ shop }: ShopSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(shop.coverUrl);
  const [error, setError] = useState("");

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await uploadImage(file, "content");
      if (!result.ok) throw new Error(result.error);
      setCoverUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    const fd = new FormData(form);
    try {
      const result = await updateShopSettings({
        name: fd.get("name") as string,
        tagline: fd.get("tagline") as string,
        coverUrl,
      });
      if (result.ok) {
        toast.success("店铺信息已更新");
        router.refresh();
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-stone-200 bg-paper p-4">
      <h2 className="font-serif text-lg font-semibold">店铺设置</h2>
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm text-stone-600">门头封面</label>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="店铺封面"
            className="mb-2 h-32 w-full rounded object-cover"
          />
        )}
        <Input type="file" accept="image/*" onChange={handleCoverChange} disabled={loading} />
      </div>
      <Input name="name" defaultValue={shop.name} placeholder="店铺名称" required />
      <Textarea
        name="tagline"
        defaultValue={shop.tagline ?? ""}
        placeholder="一句话口号（显示在街景卡片上）"
        rows={2}
        maxLength={120}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "保存中…" : "保存店铺信息"}
      </Button>
    </form>
  );
}
