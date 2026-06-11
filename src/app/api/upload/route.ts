import { auth } from "@/lib/auth";
import { compressImage, type ImagePurpose } from "@/lib/compress-image";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_INPUT_BYTES = 15 * 1024 * 1024;

function parsePurpose(value: FormDataEntryValue | null): ImagePurpose {
  return value === "avatar" ? "avatar" : "content";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const purpose = parsePurpose(formData.get("purpose"));

  if (!file) {
    return NextResponse.json({ error: "未选择文件" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "仅支持图片" }, { status: 400 });
  }

  if (file.size > MAX_INPUT_BYTES) {
    return NextResponse.json({ error: "原图不超过 15MB" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "未配置 BLOB_READ_WRITE_TOKEN" },
      { status: 500 },
    );
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImage(input, purpose);
    const pathname = `uploads/${session.user.id}/${Date.now()}.${compressed.ext}`;

    const blob = await put(pathname, compressed.data, {
      access: "public",
      token,
      contentType: compressed.contentType,
    });

    return NextResponse.json({
      url: blob.url,
      size: compressed.compressedBytes,
      originalSize: compressed.originalBytes,
    });
  } catch {
    return NextResponse.json({ error: "图片处理失败，请换一张试试" }, { status: 400 });
  }
}
