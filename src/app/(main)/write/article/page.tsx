import { ArticleEditor } from "@/components/editor/ArticleEditor";

export default function WriteArticlePage() {
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
