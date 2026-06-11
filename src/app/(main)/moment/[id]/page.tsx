import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getMomentById,
  getPostBookmarkState,
  getPostComments,
  getPostLikeState,
} from "@/lib/queries";
import { BookmarkButton } from "@/components/social/BookmarkButton";
import { FormattedTime } from "@/components/ui/formatted-time";
import { siteName, siteUrl } from "@/lib/site";
import { AuthorLink } from "@/components/social/AuthorLink";
import { PostImage } from "@/components/ui/post-image";
import { LikeButton } from "@/components/social/LikeButton";
import { PostCommentSection } from "@/components/social/PostCommentSection";
import { ShareButton } from "@/components/social/ShareButton";
import { encodeRouteSlug } from "@/lib/route-slug";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getMomentById(id);
  if (!post) return { title: "短文未找到" };

  const description = post.body.slice(0, 120);
  const image = post.images[0]?.url ?? undefined;

  return {
    title: `${post.author.displayName ?? post.author.username} 的短文 · ${siteName}`,
    description,
    openGraph: {
      title: `${post.author.displayName ?? post.author.username} 的短文`,
      description,
      images: image ? [image] : undefined,
      url: `${siteUrl}/moment/${id}`,
    },
  };
}

export default async function MomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [post, commentResult, likeState, bookmarkState] = await Promise.all([
    getMomentById(id),
    getPostComments(id),
    getPostLikeState(id, session?.user?.id),
    getPostBookmarkState(id, session?.user?.id),
  ]);
  if (!post) notFound();
  const isAdmin = session?.user?.role === "ADMIN";

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <AuthorLink author={post.author} showAvatar className="font-medium text-stone-800" />
            <span>· <FormattedTime date={post.createdAt} /></span>
          </div>
          <div className="flex items-center gap-1">
            {session?.user && (
              <BookmarkButton
                postId={post.id}
                initialBookmarked={bookmarkState.bookmarked}
              />
            )}
            <ShareButton title="阿尔法重庆短文" url={`/moment/${post.id}`} />
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-lg text-stone-800">{post.body}</p>
        {post.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.images.map((img) => (
              <PostImage
                key={img.url}
                src={img.url}
                alt="用户配图"
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

      <section id="comments" className="rounded border border-stone-200 bg-paper p-5">
        <h2 className="mb-4 font-serif text-lg font-semibold">评论</h2>
        {!session?.user && (
          <p className="mb-4 text-sm text-stone-500">
            <Link href={`/login?callbackUrl=/moment/${post.id}`} className="text-accent hover:underline">
              登录
            </Link>{" "}
            后发表评论
          </p>
        )}
        <PostCommentSection
          postId={post.id}
          initialComments={commentResult.items}
          initialCursor={commentResult.nextCursor}
          currentUserId={session?.user?.id}
          currentUser={
            session?.user?.id && session.user.username
              ? {
                  id: session.user.id,
                  username: session.user.username,
                  displayName: session.user.name ?? null,
                }
              : undefined
          }
          isAdmin={isAdmin}
          canReply={!!session?.user}
          showComposeForm={!!session?.user}
        />
      </section>
    </article>
  );
}
