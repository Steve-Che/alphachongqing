import Link from "next/link";
import { searchContent } from "@/lib/queries";
import { AuthorLink } from "@/components/social/AuthorLink";
import { SearchForm } from "@/components/search/SearchForm";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchContent(query) : { users: [], posts: [] };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">搜索</h1>
        <p className="mt-1 text-sm text-stone-500">查找街坊与长文、短文。</p>
      </header>

      <SearchForm initialQuery={query} />

      {query && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold">用户</h2>
            {results.users.length === 0 ? (
              <p className="text-stone-500">没有匹配的用户。</p>
            ) : (
              <ul className="space-y-2">
                {results.users.map((u) => (
                  <li key={u.username} className="rounded border border-stone-200 bg-paper px-4 py-3">
                    <AuthorLink author={u} showAvatar className="font-medium" />
                    {u.bio && <p className="mt-1 text-sm text-stone-500">{u.bio}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold">内容</h2>
            {results.posts.length === 0 ? (
              <p className="text-stone-500">没有匹配的内容。</p>
            ) : (
              <ul className="space-y-2">
                {results.posts.map((p) => (
                  <li key={p.id} className="rounded border border-stone-200 bg-paper px-4 py-3">
                    <Link
                      href={p.type === "ARTICLE" ? `/article/${p.id}` : `/moment/${p.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {p.type === "ARTICLE" ? p.title : p.body.slice(0, 80)}
                    </Link>
                    <p className="mt-1 text-xs text-stone-400">
                      <AuthorLink author={p.author} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
