import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMomentById, getPostLikeState } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { AuthorLink } from "@/components/social/AuthorLink";
import { PostImage } from "@/components/ui/post-image";
import { LikeButton } from "@/components/social/LikeButton";
import { encodeRouteSlug } from "@/lib/route-slug";

export const revalidate = 60;

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session] = await Promise.all([getMomentById(id), auth()]);
  if (!post) notFound();

  const likeState = await getPostLikeState(post.id, session?.user?.id);

  return (
    <article className="mx-auto max-w-xl space-y-4">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        {post.street && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/street/${encodeRouteSlug(post.street.slug)}`}
              className="hover:text-stone-800"
            >
              {post.street.nameZh}
            </Link>
          </>
        )}
      </nav>

      <header className="rounded border border-stone-200 bg-paper p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <AuthorLink author={post.author} showAvatar className="font-medium text-stone-800" />
          <span>· {formatDate(post.createdAt)}</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-lg text-stone-800">{post.body}</p>
        {post.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.images.map((img) => (
              <PostImage
                key={img.url}
                src={img.url}
                alt=""
                className="max-h-80 rounded object-cover"
                width={400}
                height={400}
              />
            ))}
          </div>
        )}
        <div className="mt-4">
          <LikeButton
            postId={post.id}
            initialLiked={likeState.liked}
            initialCount={likeState.count}
          />
        </div>
      </header>

      {!session?.user && (
        <p className="text-sm text-stone-500">
          <Link href="/login" className="text-accent hover:underline">登录</Link> 后可点赞
        </p>
      )}
    </article>
  );
}
