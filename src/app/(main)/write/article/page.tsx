import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPostById } from "@/lib/queries";
import { ArticleEditor } from "@/components/editor/ArticleEditor";

export default async function WriteArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await searchParams;

  if (id) {
    const post = await getPostById(id);
    if (!post || post.type !== "ARTICLE" || post.authorId !== session.user.id) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="font-serif text-2xl font-semibold">编辑长文</h1>
          <p className="mt-1 text-sm text-stone-500">修改标题、封面与正文。</p>
        </header>
        <ArticleEditor
          postId={post.id}
          initialTitle={post.title ?? ""}
          initialBody={post.body}
          initialCoverUrl={post.coverUrl ?? ""}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">写长文</h1>
        <p className="mt-1 text-sm text-stone-500">
          像轻博客那样，写一篇可以慢慢读的文章。
        </p>
      </header>
      <ArticleEditor />
    </div>
  );
}
