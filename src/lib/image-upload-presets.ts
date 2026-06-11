export type ImagePurpose = "avatar" | "content";

export const IMAGE_UPLOAD_PRESETS = {
  /** 头像：清晰够用，体积小 */
  avatar: {
    maxDimension: 768,
    maxBytes: 250 * 1024,
    maxSourceBytes: 30 * 1024 * 1024,
  },
  /** 正文配图：支持 2K 长边，适配现代手机照片 */
  content: {
    maxDimension: 2560,
    maxBytes: 500 * 1024,
    maxSourceBytes: 50 * 1024 * 1024,
  },
} as const satisfies Record<
  ImagePurpose,
  { maxDimension: number; maxBytes: number; maxSourceBytes: number }
>;

/** Vercel Serverless 请求体上限约 4.5MB，留安全余量 */
export const SERVER_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
