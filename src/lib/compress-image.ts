import sharp from "sharp";

export type ImagePurpose = "avatar" | "content";

const PRESETS: Record<ImagePurpose, { maxDimension: number; maxBytes: number }> = {
  avatar: { maxDimension: 512, maxBytes: 200 * 1024 },
  content: { maxDimension: 1920, maxBytes: 400 * 1024 },
};

export type CompressedImage = {
  data: Buffer;
  contentType: string;
  ext: string;
  originalBytes: number;
  compressedBytes: number;
};

/** 将图片压缩为 JPEG，目标体积约几百 KB 以内 */
export async function compressImage(
  input: Buffer,
  purpose: ImagePurpose = "content",
): Promise<CompressedImage> {
  const { maxDimension, maxBytes } = PRESETS[purpose];
  const originalBytes = input.length;

  let dimension = maxDimension;
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
    } else if (dimension > 640) {
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
