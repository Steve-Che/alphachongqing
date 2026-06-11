import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPostById, getPostComments } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { AuthorLink } from "@/components/social/AuthorLink";
import { CommentForm } from "@/components/social/CommentForm";
import { CommentThread } from "@/components/social/CommentThread";
import { PostImage } from "@/components/ui/post-image";

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session, comments] = await Promise.all([
    getPostById(id),
    auth(),
    getPostComments(id),
  ]);
  if (!post || post.type !== "ARTICLE") notFound();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <article className="mx-auto max-w-prose">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <AuthorLink author={post.author} className="hover:text-stone-800" />
      </nav>

      <header>
        <h1 className="font-serif text-3xl font-semibold leading-tight text-stone-900">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          <AuthorLink author={post.author} className="hover:text-accent" />
          {" · "}
          {formatDate(post.createdAt)}
        </p>
        {post.coverUrl && (
          <PostImage
            src={post.coverUrl}
            alt=""
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

      <section className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="mb-4 font-serif text-lg font-semibold">评论</h2>
        {session?.user ? (
          <CommentForm postId={post.id} placeholder="写下你的评论…" />
        ) : (
          <p className="mb-4 text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">登录</Link> 后发表评论
          </p>
        )}
        <div className="mt-6">
          <CommentThread
            comments={comments}
            postId={post.id}
            currentUserId={session?.user?.id}
            isAdmin={isAdmin}
            canReply={!!session?.user}
          />
        </div>
      </section>
    </article>
  );
}
