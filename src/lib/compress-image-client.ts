import { IMAGE_UPLOAD_PRESETS, type ImagePurpose } from "@/lib/image-upload-presets";

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("图片处理失败"))),
      "image/jpeg",
      quality,
    );
  });
}

/** 浏览器端压缩：先缩小再上传，避免触发 Vercel 413 */
export async function compressImageClient(
  file: File,
  purpose: ImagePurpose = "content",
): Promise<File> {
  const preset = IMAGE_UPLOAD_PRESETS[purpose];

  if (!file.type.startsWith("image/")) {
    throw new Error("仅支持图片文件（JPG、PNG、WebP 等）");
  }

  const maxSourceMb = Math.round(preset.maxSourceBytes / 1024 / 1024);
  if (file.size > preset.maxSourceBytes) {
    throw new Error(`原图过大，请选择 ${maxSourceMb}MB 以内的照片`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("无法读取该图片，请换用 JPG、PNG 或 WebP，或关闭 iCloud 原图后再试");
  }

  let width = bitmap.width;
  let height = bitmap.height;
  const maxDim = preset.maxDimension;

  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("当前浏览器无法处理图片");
  }

  let quality = 0.85;
  let blob: Blob | null = null;

  try {
    for (let attempt = 0; attempt < 12; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      blob = await canvasToJpegBlob(canvas, quality);
      if (blob.size <= preset.maxBytes) break;

      if (quality > 0.52) {
        quality -= 0.07;
      } else if (Math.max(width, height) > 960) {
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
        quality = 0.8;
      } else {
        break;
      }
    }
  } finally {
    bitmap.close();
  }

  if (!blob) {
    throw new Error("图片压缩失败，请换一张试试");
  }

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "image";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
