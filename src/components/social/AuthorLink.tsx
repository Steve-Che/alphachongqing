import Link from "next/link";

type Author = {
  username: string;
  displayName?: string | null;
};

export function AuthorLink({
  author,
  className = "text-accent hover:underline",
}: {
  author: Author;
  className?: string;
}) {
  const label = author.displayName ?? author.username;
  return (
    <Link href={`/u/${author.username}`} className={className}>
      {label}
    </Link>
  );
}
