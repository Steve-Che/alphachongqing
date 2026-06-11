import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookmarkedPosts } from "@/lib/queries";
import { getPostDetailPath } from "@/lib/post-path";
import { formatDate } from "@/lib/utils";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const posts = await getBookmarkedPosts(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">我的收藏</h1>
        <p className="mt-1 text-sm text-stone-500">收藏的长文与短文</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded border border-dashed border-stone-300 bg-paper px-4 py-8 text-center text-stone-500">
          还没有收藏内容。在动态或文章页点击「收藏」即可加入这里。
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded border border-stone-200 bg-paper px-4 py-3"
            >
              <Link
                href={getPostDetailPath(post.id, post.type)}
                className="font-medium text-stone-900 hover:text-[#b84a2f]"
              >
                {post.type === "ARTICLE"
                  ? post.title || "无标题长文"
                  : post.body.slice(0, 60)}
              </Link>
              <p className="mt-1 text-xs text-stone-500">
                {post.author.displayName ?? post.author.username} ·{" "}
                {formatDate(post.createdAt)} · {post._count.likes} 赞 ·{" "}
                {post._count.comments} 评论
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
