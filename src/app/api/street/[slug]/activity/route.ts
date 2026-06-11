import { getStreetActivity } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const activity = await getStreetActivity(slug);
  if (!activity) {
    return NextResponse.json({ error: "街道不存在" }, { status: 404 });
  }
  return NextResponse.json(activity);
}
