import Link from "next/link";

type Book = {
  slug: string;
  title: string;
  author: string;
  source: string;
  sourceUrl?: string | null;
};

export function LibraryShelf({
  books,
  venueSlug,
  compact = false,
}: {
  books: Book[];
  venueSlug: string;
  compact?: boolean;
}) {
  if (books.length === 0) {
    return <p className="text-sm text-stone-500">书架暂无藏书。</p>;
  }

  const display = compact ? books.slice(0, 3) : books;

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
      {display.map((book) => (
        <Link
          key={book.slug}
          href={`/place/${venueSlug}/book/${book.slug}`}
          className="group rounded border border-stone-200 bg-paper p-4 hover:border-[#b84a2f]/40 hover:shadow-sm"
        >
          <h3 className="font-serif font-semibold text-stone-900 group-hover:text-[#b84a2f]">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-stone-600">{book.author}</p>
          <p className="mt-2 text-xs text-stone-400">{book.source}</p>
          <p className="mt-2 text-xs text-accent">免费阅读 →</p>
        </Link>
      ))}
    </div>
  );
}
