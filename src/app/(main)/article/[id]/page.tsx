import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPostById, getPostBookmarkState, getPostComments } from "@/lib/queries";
import { BookmarkButton } from "@/components/social/BookmarkButton";
import { FormattedTime } from "@/components/ui/formatted-time";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { siteName, siteUrl } from "@/lib/site";
import { AuthorLink } from "@/components/social/AuthorLink";
import { PostCommentSection } from "@/components/social/PostCommentSection";
import { PostImage } from "@/components/ui/post-image";
import { ShareButton } from "@/components/social/ShareButton";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post || post.type !== "ARTICLE") return { title: "文章未找到" };

  const description = post.body.replace(/<[^>]+>/g, "").slice(0, 120);

  return {
    title: `${post.title ?? "无题"} · ${siteName}`,
    description,
    openGraph: {
      title: post.title ?? "无题",
      description,
      images: post.coverUrl ? [post.coverUrl] : undefined,
      url: `${siteUrl}/article/${id}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [post, commentResult, bookmarkState] = await Promise.all([
    getPostById(id),
    getPostComments(id),
    getPostBookmarkState(id, session?.user?.id),
  ]);
  if (!post || post.type !== "ARTICLE") notFound();

  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthor = session?.user?.id === post.authorId;

  return (
    <article className="mx-auto max-w-prose">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <AuthorLink author={post.author} className="hover:text-stone-800" />
      </nav>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-stone-900">
            {post.title}
          </h1>
          <div className="flex gap-2">
            {isAuthor && (
              <Link
                href={`/write/article?id=${post.id}`}
                className="text-sm text-accent hover:underline"
              >
                编辑
              </Link>
            )}
            <ShareButton title={post.title ?? "阿尔法重庆长文"} url={`/article/${post.id}`} />
            {session?.user && (
              <BookmarkButton
                postId={post.id}
                initialBookmarked={bookmarkState.bookmarked}
              />
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-500">
          <AuthorLink author={post.author} className="hover:text-accent" />
          {" · "}
          <FormattedTime date={post.createdAt} />
        </p>
        {post.coverUrl && (
          <PostImage
            src={post.coverUrl}
            alt="文章封面"
            className="mt-6 w-full rounded-lg object-cover"
            width={800}
            height={450}
          />
        )}
      </header>

      <div
        className="prose-retro mt-8 text-stone-800"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
      />

      <section id="comments" className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="mb-4 font-serif text-lg font-semibold">评论</h2>
        {!session?.user && (
          <p className="mb-4 text-sm text-stone-500">
            <Link href={`/login?callbackUrl=/article/${post.id}`} className="text-accent hover:underline">
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
