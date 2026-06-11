import { auth } from "@/lib/auth";
import {
  IMAGE_UPLOAD_PRESETS,
  SERVER_MAX_UPLOAD_BYTES,
  type ImagePurpose,
} from "@/lib/image-upload-presets";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

  if (file.size > SERVER_MAX_UPLOAD_BYTES) {
    const maxMb = Math.round(SERVER_MAX_UPLOAD_BYTES / 1024 / 1024);
    return NextResponse.json(
      { error: `上传数据超过 ${maxMb}MB，请刷新页面后重试（浏览器会自动压缩）` },
      { status: 400 },
    );
  }

  const preset = IMAGE_UPLOAD_PRESETS[purpose];
  if (file.size > preset.maxBytes * 1.2) {
    return NextResponse.json(
      { error: "图片体积异常，请刷新页面后重新选择照片" },
      { status: 400 },
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "未配置 BLOB_READ_WRITE_TOKEN" },
      { status: 500 },
    );
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const pathname = `uploads/${session.user.id}/${Date.now()}.jpg`;

    const blob = await put(pathname, data, {
      access: "public",
      token,
      contentType: "image/jpeg",
    });

    return NextResponse.json({
      url: blob.url,
      size: data.length,
      maxBytes: preset.maxBytes,
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "图片上传失败，请稍后重试" },
      { status: 500 },
    );
  }
}
