import { auth } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
