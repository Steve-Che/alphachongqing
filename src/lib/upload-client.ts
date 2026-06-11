import { compressImageClient } from "@/lib/compress-image-client";
import type { ImagePurpose } from "@/lib/image-upload-presets";

export type UploadResult =
  | { ok: true; url: string; size?: number }
  | { ok: false; error: string };

async function parseUploadResponse(res: Response): Promise<{ url?: string; error?: string; size?: number }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (res.status === 413) {
      return { error: "图片体积过大，请换一张较小的照片" };
    }
    if (res.status >= 500) {
      return { error: "服务器处理图片失败，请稍后重试" };
    }
    return { error: `上传失败（错误 ${res.status}）` };
  }

  try {
    return await res.json();
  } catch {
    return { error: "服务器返回异常，请稍后重试" };
  }
}

/** 上传图片：浏览器先压缩，服务端再兜底处理 */
export async function uploadImage(
  file: File,
  purpose: ImagePurpose = "content",
): Promise<UploadResult> {
  let compressed: File;
  try {
    compressed = await compressImageClient(file, purpose);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "图片无法处理，请换一张试试",
    };
  }

  const fd = new FormData();
  fd.append("file", compressed);
  fd.append("purpose", purpose);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: fd });
  } catch {
    return { ok: false, error: "网络异常，请检查连接后重试" };
  }

  const data = await parseUploadResponse(res);

  if (!res.ok || !data.url) {
    return { ok: false, error: data.error || "上传失败" };
  }

  return { ok: true, url: data.url, size: data.size };
}
