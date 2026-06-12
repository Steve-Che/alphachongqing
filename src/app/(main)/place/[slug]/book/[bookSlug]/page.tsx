import Link from "next/link";
import { notFound } from "next/navigation";
import { getLibraryBookBySlug } from "@/lib/queries";
import { readLibraryBookHtml } from "@/lib/public-venues/read-book";

export const revalidate = 3600;

export default async function LibraryBookPage({
  params,
}: {
  params: Promise<{ slug: string; bookSlug: string }>;
}) {
  const { slug, bookSlug } = await params;
  const book = await getLibraryBookBySlug(bookSlug);
  if (!book || book.venue.slug !== slug) notFound();

  const html = await readLibraryBookHtml(book.contentPath);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <Link href="/places" className="hover:text-stone-800">
          公共区
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/place/${book.venue.slug}`} className="hover:text-stone-800">
          {book.venue.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{book.title}</span>
      </nav>

      <header className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          {book.title}
        </h1>
        <p className="mt-1 text-stone-600">{book.author}</p>
        <p className="mt-2 text-xs text-stone-500">
          来源：{book.source}
          {book.sourceUrl && (
            <>
              {" · "}
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                原文链接
              </a>
            </>
          )}
        </p>
      </header>

      <article
        className="prose-retro mx-auto max-w-prose text-stone-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <p className="text-center text-sm text-stone-500">
        <Link href={`/place/${book.venue.slug}`} className="text-accent hover:underline">
          ← 返回{book.venue.nameZh}
        </Link>
      </p>
    </div>
  );
}
