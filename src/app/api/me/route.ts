import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserResidence } from "@/lib/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null, residence: null });
  }

  const residence = await getUserResidence(session.user.id);

  return NextResponse.json({
    user: {
      username: session.user.username,
      role: session.user.role,
    },
    residence: residence
      ? {
          shop: residence.shop ? { slug: residence.shop.slug } : undefined,
          apartmentUnit: residence.apartmentUnit
            ? { id: residence.apartmentUnit.id }
            : undefined,
        }
      : null,
  });
}
