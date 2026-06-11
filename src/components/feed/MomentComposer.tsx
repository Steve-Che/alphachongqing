"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMoment } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type StreetOption = {
  id: string;
  nameZh: string;
  district: { nameZh: string };
};

export function MomentComposer({
  defaultStreetId,
  defaultStreetName,
  streets,
}: {
  defaultStreetId?: string;
  defaultStreetName?: string;
  streets?: StreetOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [streetId, setStreetId] = useState(defaultStreetId ?? "");

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setImages((prev) => [...prev, data.url].slice(0, 9));
    else setError(data.error || "上传失败");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await createMoment({
      body: fd.get("body") as string,
      imageUrls: images,
      streetId: streetId || undefined,
    });
    if (result.ok) {
      e.currentTarget.reset();
      setImages([]);
      router.refresh();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-stone-200 bg-paper p-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {streets && streets.length > 0 && (
        <label className="block text-sm text-stone-600">
          发布到街道
          <select
            value={streetId}
            onChange={(e) => setStreetId(e.target.value)}
            className="ml-2 rounded border border-stone-300 px-2 py-1"
          >
            <option value="">不关联街道</option>
            {streets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.district.nameZh} · {s.nameZh}
              </option>
            ))}
          </select>
        </label>
      )}
      {defaultStreetName && streetId === defaultStreetId && (
        <p className="text-xs text-stone-500">将发布到：{defaultStreetName}</p>
      )}
      <Textarea
        name="body"
        placeholder="写一条短文，像早期的微博那样…（不超过 500 字）"
        maxLength={500}
        rows={4}
        required
      />
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer text-sm text-stone-600 hover:text-stone-900">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading || images.length >= 9}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
            }}
          />
          {uploading ? "上传中…" : "添加图片"}
        </label>
        <span className="text-xs text-stone-400">{images.length}/9 张</span>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "发布中…" : "发布短文"}
        </Button>
      </div>
    </form>
  );
}
