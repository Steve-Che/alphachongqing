import fs from "fs/promises";
import path from "path";
import { markdownToHtml } from "@/lib/markdown";

export async function readLibraryBookHtml(contentPath: string): Promise<string> {
  const fullPath = path.join(
    process.cwd(),
    "src/content/public-domain",
    contentPath,
  );
  const raw = await fs.readFile(fullPath, "utf-8");
  return markdownToHtml(raw);
}
