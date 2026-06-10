import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post || post.type !== "ARTICLE") notFound();

  return (
    <article className="mx-auto max-w-prose">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <Link href={`/u/${post.author.username}`} className="hover:text-stone-800">
          {post.author.displayName ?? post.author.username}
        </Link>
      </nav>

      <header>
        <h1 className="font-serif text-3xl font-semibold leading-tight text-stone-900">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          <Link href={`/u/${post.author.username}`} className="hover:text-accent">
            {post.author.displayName ?? post.author.username}
          </Link>
          {" · "}
          {formatDate(post.createdAt)}
        </p>
        {post.coverUrl && (
          <img
            src={post.coverUrl}
            alt=""
            className="mt-6 w-full rounded-lg object-cover"
          />
        )}
      </header>

      <div
        className="prose-retro mt-8 text-stone-800"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
      />
    </article>
  );
}
