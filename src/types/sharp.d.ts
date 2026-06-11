declare module "sharp" {
  interface SharpInstance {
    rotate(): SharpInstance;
    resize(
      width: number,
      height: number,
      options?: { fit?: string; withoutEnlargement?: boolean },
    ): SharpInstance;
    flatten(options?: { background?: { r: number; g: number; b: number } }): SharpInstance;
    jpeg(options?: { quality?: number; mozjpeg?: boolean }): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }

  function sharp(
    input: Buffer,
    options?: { failOn?: "none" | "warning" | "error" },
  ): SharpInstance;

  export default sharp;
}
