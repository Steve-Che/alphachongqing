import { revalidatePath } from "next/cache";
import { streetPath } from "@/lib/route-slug";

/** 使街道页缓存失效（slug 含中文时需编码路径） */
export function revalidateStreet(slug: string) {
  revalidatePath(streetPath(slug));
}
