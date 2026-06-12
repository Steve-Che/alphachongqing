"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createVenueMoment } from "@/app/actions/public-venues";
import { uploadImage } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function VenueMomentComposer({
  venueId,
  venueName,
}: {
  venueId: string;
  venueName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    const result = await uploadImage(file, "content");
    setUploading(false);
    if (result.ok) {
      setImages((prev) => [...prev, result.url].slice(0, 9));
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    const fd = new FormData(form);
    try {
      const result = await createVenueMoment(
        venueId,
        fd.get("body") as string,
        images,
      );
      if (result.ok) {
        form.reset();
        setImages([]);
        toast.success("短文已发布");
        router.refresh();
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded border border-stone-200 bg-paper p-4"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-stone-500">将发布到：{venueName}</p>
      <Textarea
        name="body"
        placeholder="写一条场馆动态…（不超过 500 字）"
        maxLength={500}
        rows={3}
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
              if (f) handleImageUpload(f);
            }}
          />
          {uploading ? "上传中…" : "添加图片"}
        </label>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "发布中…" : "发布短文"}
        </Button>
      </div>
    </form>
  );
}
