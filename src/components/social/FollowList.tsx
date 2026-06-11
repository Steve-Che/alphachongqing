"use client";

import { useState } from "react";
import { AuthorLink } from "@/components/social/AuthorLink";
import { FollowButton } from "@/components/social/FollowButton";
import { LoadMoreFooter } from "@/components/ui/load-more-button";

type UserRow = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl?: string | null;
};

export function FollowList({
  users,
  initialCursor,
  loadMore,
  viewerId,
  followingMap,
}: {
  users: UserRow[];
  initialCursor: string | null;
  loadMore: (cursor: string) => Promise<{ items: UserRow[]; nextCursor: string | null }>;
  viewerId?: string;
  followingMap: Record<string, boolean>;
}) {
  const [items, setItems] = useState(users);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return <p className="text-stone-500">暂无用户。</p>;
  }

  return (
    <div>
      <ul className="space-y-3">
        {items.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded border border-stone-200 bg-paper px-4 py-3"
          >
            <AuthorLink author={u} showAvatar />
            {viewerId && viewerId !== u.id && (
              <FollowButton
                followingId={u.id}
                initialFollowing={followingMap[u.id] ?? false}
                isSelf={false}
              />
            )}
          </li>
        ))}
      </ul>
      <LoadMoreFooter
        hasMore={!!cursor}
        loading={loading}
        onLoadMore={async () => {
          if (!cursor) return;
          setLoading(true);
          const result = await loadMore(cursor);
          setItems((prev) => [...prev, ...result.items]);
          setCursor(result.nextCursor);
          setLoading(false);
        }}
      />
    </div>
  );
}
