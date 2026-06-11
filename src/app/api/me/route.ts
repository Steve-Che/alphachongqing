import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserResidence, getUserStats } from "@/lib/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null, residence: null, stats: null });
  }

  const [residence, stats] = await Promise.all([
    getUserResidence(session.user.id),
    getUserStats(session.user.id),
  ]);

  return NextResponse.json({
    user: {
      username: session.user.username,
      role: session.user.role,
      displayName: session.user.name,
    },
    residence: residence
      ? {
          shop: residence.shop ? { slug: residence.shop.slug } : undefined,
          apartmentUnit: residence.apartmentUnit
            ? { id: residence.apartmentUnit.id }
            : undefined,
        }
      : null,
    stats: {
      hasResidence: stats.hasResidence,
      postCount: stats.postCount,
      followers: stats.followers,
      following: stats.following,
    },
    onboarding: {
      hasResidence: stats.hasResidence,
      postCount: stats.postCount,
      followingCount: stats.following,
      completedSteps: [
        true,
        stats.hasResidence,
        stats.postCount > 0,
        stats.following > 0,
      ].filter(Boolean).length,
    },
  });
}
