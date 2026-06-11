import { getStreetActivity } from "@/lib/queries";
import { decodeRouteSlug } from "@/lib/route-slug";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: rawSlug } = await params;
  const activity = await getStreetActivity(decodeRouteSlug(rawSlug));
  if (!activity) {
    return NextResponse.json({ error: "街道不存在" }, { status: 404 });
  }
  return NextResponse.json(activity);
}
