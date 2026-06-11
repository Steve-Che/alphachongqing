import Link from "next/link";
import { Avatar } from "@/components/social/Avatar";

type Author = {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function AuthorLink({
  author,
  className = "text-accent hover:underline",
  showAvatar = false,
  avatarSize = "sm" as const,
}: {
  author: Author;
  className?: string;
  showAvatar?: boolean;
  avatarSize?: "sm" | "md" | "lg";
}) {
  const label = author.displayName ?? author.username;

  if (showAvatar) {
    return (
      <Link
        href={`/u/${author.username}`}
        className={`inline-flex items-center gap-2 hover:text-accent ${className}`}
      >
        <Avatar
          username={author.username}
          displayName={author.displayName}
          avatarUrl={author.avatarUrl}
          size={avatarSize}
        />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link href={`/u/${author.username}`} className={className}>
      {label}
    </Link>
  );
}
