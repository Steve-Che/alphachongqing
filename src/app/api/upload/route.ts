import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "未选择文件" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "仅支持图片" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "图片不超过 5MB" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "未配置 BLOB_READ_WRITE_TOKEN" },
      { status: 500 },
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const pathname = `uploads/${session.user.id}/${Date.now()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    token,
  });

  return NextResponse.json({ url: blob.url });
}
