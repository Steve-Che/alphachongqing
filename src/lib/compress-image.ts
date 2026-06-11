import sharp from "sharp";
import { IMAGE_UPLOAD_PRESETS, type ImagePurpose } from "@/lib/image-upload-presets";

export type { ImagePurpose } from "@/lib/image-upload-presets";

export type CompressedImage = {
  data: Buffer;
  contentType: string;
  ext: string;
  originalBytes: number;
  compressedBytes: number;
};

/** 服务端二次压缩为 JPEG（客户端已压缩时作为兜底） */
export async function compressImage(
  input: Buffer,
  purpose: ImagePurpose = "content",
): Promise<CompressedImage> {
  const { maxDimension, maxBytes } = IMAGE_UPLOAD_PRESETS[purpose];
  const originalBytes = input.length;

  let dimension: number = maxDimension;
  let quality = 82;
  let data: Buffer = Buffer.alloc(0);

  for (let attempt = 0; attempt < 8; attempt++) {
    const next = await sharp(input, { failOn: "none" })
      .rotate()
      .resize(dimension, dimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    data = Buffer.from(next);

    if (data.length <= maxBytes) break;

    if (quality > 50) {
      quality -= 8;
    } else if (dimension > 960) {
      dimension = Math.round(dimension * 0.85);
      quality = 78;
    } else {
      break;
    }
  }

  return {
    data,
    contentType: "image/jpeg",
    ext: "jpg",
    originalBytes,
    compressedBytes: data.length,
  };
}
