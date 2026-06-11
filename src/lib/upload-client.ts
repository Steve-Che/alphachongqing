import type { ImagePurpose } from "@/lib/compress-image";

export type UploadResult =
  | { ok: true; url: string; size?: number }
  | { ok: false; error: string };

/** 上传图片（服务端自动压缩） */
export async function uploadImage(
  file: File,
  purpose: ImagePurpose = "content",
): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("purpose", purpose);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok || !data.url) {
    return { ok: false, error: data.error || "上传失败" };
  }

  return { ok: true, url: data.url, size: data.size };
}
