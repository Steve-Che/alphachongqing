import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFollowingFeed, getRecommendedUsers } from "@/lib/queries";
import { FeedList } from "@/components/feed/FeedList";
import { FollowButton } from "@/components/social/FollowButton";
import { FollowBatchButton } from "@/components/feed/FollowBatchButton";
import { prisma } from "@/lib/db";
import { AuthorLink } from "@/components/social/AuthorLink";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/feed");

  const [{ items, nextCursor }, recommended] = await Promise.all([
    getFollowingFeed(session.user.id),
    getRecommendedUsers(5),
  ]);

  const likedRows = items.length
    ? await prisma.like.findMany({
        where: {
          userId: session.user.id,
          postId: { in: items.filter((p) => p.type === "MOMENT").map((p) => p.id) },
        },
        select: { postId: true },
      })
    : [];
  const likedPostIds = likedRows.map((r) => r.postId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">关注的街坊</h1>
        <p className="mt-1 text-sm text-stone-500">
          你关注的人发布的短文与长文，按时间倒序。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="space-y-6">
          <div className="rounded border border-dashed border-stone-300 bg-paper p-6 text-center text-stone-500">
            <p>还没有动态。可以先关注这些街坊：</p>
            {recommended.length > 0 && (
              <div className="mt-3">
                <FollowBatchButton userIds={recommended.map((u) => u.id)} />
              </div>
            )}
          </div>
          {recommended.length > 0 && (
            <ul className="space-y-3">
              {recommended.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded border border-stone-200 bg-paper px-4 py-3"
                >
                  <AuthorLink author={u} showAvatar />
                  <FollowButton
                    followingId={u.id}
                    initialFollowing={false}
                    isSelf={u.id === session.user.id}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="text-center text-sm text-stone-500">
            或去
            <Link href="/" className="text-accent hover:underline"> 城市地图 </Link>
            逛街道，在
            <Link href="/guide" className="text-accent hover:underline"> 入驻指南 </Link>
            了解街坊社交。
          </p>
        </div>
      ) : (
        <FeedList
          initialPosts={items}
          initialCursor={nextCursor}
          likedPostIds={likedPostIds}
        />
      )}
    </div>
  );
}
