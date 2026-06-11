import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFollowingFeed } from "@/lib/queries";
import { PostList } from "@/components/feed/PostList";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const posts = await getFollowingFeed(session.user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">关注的街坊</h1>
        <p className="mt-1 text-sm text-stone-500">
          你关注的人发布的短文与长文，按时间倒序。
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded border border-dashed border-stone-300 bg-paper p-6 text-center text-stone-500">
          <p>还没有动态。去</p>
          <Link href="/" className="text-accent hover:underline">
            城市地图
          </Link>
          <p className="mt-1">逛逛，关注感兴趣的街坊吧。</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}
