"use client";

import { useState } from "react";
import { PostList } from "@/components/feed/PostList";
import { LoadMoreFooter } from "@/components/ui/load-more-button";
import { loadMoreFollowingFeed } from "@/app/actions/social";

type FeedPost = Parameters<typeof PostList>[0]["posts"][number];

export function FeedList({
  initialPosts,
  initialCursor,
  likedPostIds,
}: {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  likedPostIds?: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [likedSet, setLikedSet] = useState(new Set(likedPostIds ?? []));
  const [loading, setLoading] = useState(false);

  if (posts.length === 0) {
    return <p className="text-stone-500">还没有动态。</p>;
  }

  return (
    <div>
      <PostList posts={posts} likedPostIds={likedSet} />
      <LoadMoreFooter
        hasMore={!!cursor}
        loading={loading}
        onLoadMore={async () => {
          if (!cursor) return;
          setLoading(true);
          const result = await loadMoreFollowingFeed(cursor);
          setPosts((prev) => [...prev, ...result.items]);
          setCursor(result.nextCursor);
          if (result.likedPostIds?.length) {
            setLikedSet((prev) => {
              const next = new Set(prev);
              for (const id of result.likedPostIds) next.add(id);
              return next;
            });
          }
          setLoading(false);
        }}
      />
    </div>
  );
}
