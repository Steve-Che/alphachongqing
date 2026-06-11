import Link from "next/link";
import { PostList } from "@/components/feed/PostList";
import { prisma } from "@/lib/db";

type FeedPost = Parameters<typeof PostList>[0]["posts"][number];

export async function HomeFeedPreview({
  userId,
  posts,
}: {
  userId: string;
  posts: FeedPost[];
}) {
  if (posts.length === 0) return null;

  const momentIds = posts.filter((p) => p.type === "MOMENT").map((p) => p.id);
  const likedRows =
    momentIds.length > 0
      ? await prisma.like.findMany({
          where: { userId, postId: { in: momentIds } },
          select: { postId: true },
        })
      : [];
  const likedPostIds = new Set(likedRows.map((r) => r.postId));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">街坊动态</h2>
        <Link href="/feed" className="text-sm text-accent hover:underline">
          查看全部 →
        </Link>
      </div>
      <PostList posts={posts.slice(0, 5)} likedPostIds={likedPostIds} />
    </section>
  );
}
