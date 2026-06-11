import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const BLOB_HOST = "public.blob.vercel-storage.com";

function avatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = ["#8B7355", "#6B8E7B", "#7B6B8E", "#8E7B6B", "#5B7B8E"];
  return hues[Math.abs(hash) % hues.length];
}

export function Avatar({
  username,
  displayName,
  avatarUrl,
  size = "md",
  className,
  linkToProfile,
}: {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  linkToProfile?: boolean;
}) {
  const label = (displayName ?? username).slice(0, 1).toUpperCase();
  const dim = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm";

  const inner = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={displayName ?? username}
      width={dim}
      height={dim}
      className={cn("rounded-full object-cover", className)}
      unoptimized={!avatarUrl.includes(BLOB_HOST)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white",
        textSize,
        className,
      )}
      style={{
        width: dim,
        height: dim,
        backgroundColor: avatarColor(username),
      }}
    >
      {label}
    </span>
  );

  if (linkToProfile) {
    return (
      <Link href={`/u/${username}`} className="shrink-0 hover:opacity-90">
        {inner}
      </Link>
    );
  }

  return <span className="shrink-0">{inner}</span>;
}
