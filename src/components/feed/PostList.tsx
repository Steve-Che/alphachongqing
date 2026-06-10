import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Post = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  coverUrl: string | null;
  createdAt: Date;
  images?: { url: string }[];
};

export function PostList({ posts }: { posts: Post[] }) {
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
            <h3 className="font-serif text-xl font-semibold">
              {post.title}
            </h3>
            <time className="mt-1 block text-xs text-stone-400">
              {formatDate(post.createdAt)}
            </time>
            {post.coverUrl && (
              <img
                src={post.coverUrl}
                alt=""
                className="mt-3 max-h-48 rounded object-cover"
              />
            )}
            <div
              className="prose-retro mt-3 text-stone-700"
              dangerouslySetInnerHTML={{
                __html: post.body.slice(0, 300) + (post.body.length > 300 ? "…" : ""),
              }}
            />
          </article>
        ) : (
          <article key={post.id} className="moment-card rounded-r px-4 py-3">
            <time className="text-xs text-stone-400">
              {formatDate(post.createdAt)}
            </time>
            <p className="mt-1 whitespace-pre-wrap text-stone-800">{post.body}</p>
            {post.images && post.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.images.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt=""
                    className="h-24 rounded object-cover"
                  />
                ))}
              </div>
            )}
          </article>
        ),
      )}
    </div>
  );
}
