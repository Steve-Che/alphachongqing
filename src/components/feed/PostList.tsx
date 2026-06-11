import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { AuthorLink } from "@/components/social/AuthorLink";
import { PostImage } from "@/components/ui/post-image";
import { DeletePostButton } from "@/components/feed/DeletePostButton";
import { LikeButton } from "@/components/social/LikeButton";
import { encodeRouteSlug } from "@/lib/route-slug";

type Post = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  coverUrl: string | null;
  createdAt: Date;
  author?: {
    username: string;
    displayName: string | null;
    avatarUrl?: string | null;
  };
  street?: { nameZh: string; slug: string } | null;
  images?: { url: string }[];
  _count?: { likes: number };
};

export function PostList({
  posts,
  showDelete,
  likedPostIds,
}: {
  posts: Post[];
  showDelete?: boolean;
  likedPostIds?: Set<string>;
}) {
  if (posts.length === 0) {
    return <p className="text-stone-500">还没有内容。</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) =>
        post.type === "ARTICLE" ? (
          <article
            key={post.id}
            className="rounded border border-stone-200 bg-paper p-5"
          >
            <Link
              href={`/article/${post.id}`}
              className="font-serif text-xl font-semibold hover:text-accent"
            >
              {post.title}
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-400">
              {post.author && (
                <AuthorLink author={post.author} showAvatar className="hover:text-accent" />
              )}
              <time>{formatDate(post.createdAt)}</time>
              {showDelete && <DeletePostButton postId={post.id} />}
            </p>
            {post.coverUrl && (
              <PostImage
                src={post.coverUrl}
                alt=""
                className="mt-3 max-h-48 rounded object-cover"
                width={600}
                height={300}
              />
            )}
            <div
              className="prose-retro mt-3 text-stone-700"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  post.body.slice(0, 300) + (post.body.length > 300 ? "…" : ""),
                ),
              }}
            />
          </article>
        ) : (
          <article key={post.id} className="moment-card rounded-r px-4 py-3">
            <p className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
              {post.author && (
                <AuthorLink author={post.author} showAvatar className="hover:text-accent" />
              )}
              <time>{formatDate(post.createdAt)}</time>
              {post.street && (
                <Link
                  href={`/street/${encodeRouteSlug(post.street.slug)}`}
                  className="text-stone-500 hover:text-accent"
                >
                  {post.street.nameZh}
                </Link>
              )}
              {showDelete && <DeletePostButton postId={post.id} />}
            </p>
            <Link href={`/moment/${post.id}`} className="mt-1 block hover:text-stone-900">
              <p className="whitespace-pre-wrap text-stone-800">{post.body}</p>
            </Link>
            {post.images && post.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.images.map((img) => (
                  <Link key={img.url} href={`/moment/${post.id}`}>
                    <PostImage
                      src={img.url}
                      alt=""
                      className="h-24 rounded object-cover"
                      width={96}
                      height={96}
                    />
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-2">
              <LikeButton
                postId={post.id}
                initialLiked={likedPostIds?.has(post.id) ?? false}
                initialCount={post._count?.likes ?? 0}
              />
            </div>
          </article>
        ),
      )}
    </div>
  );
}
