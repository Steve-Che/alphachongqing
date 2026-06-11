"use client";

import { useState } from "react";
import { PostList } from "@/components/feed/PostList";
import { LoadMoreFooter } from "@/components/ui/load-more-button";
import { loadMoreUserPosts } from "@/app/actions/social";

type Post = Parameters<typeof PostList>[0]["posts"][number];

export function UserPostsList({
  username,
  initialPosts,
  initialCursor,
  showDelete,
  postType,
  emptyMessage = "还没有内容。",
}: {
  username: string;
  initialPosts: Post[];
  initialCursor: string | null;
  showDelete?: boolean;
  postType?: "ARTICLE" | "MOMENT";
  emptyMessage?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  if (posts.length === 0) {
    return <p className="text-stone-500">{emptyMessage}</p>;
  }

  return (
    <div>
      <PostList posts={posts} showDelete={showDelete} />
      <LoadMoreFooter
        hasMore={!!cursor}
        loading={loading}
        onLoadMore={async () => {
          if (!cursor) return;
          setLoading(true);
          const result = await loadMoreUserPosts(username, cursor, postType);
          setPosts((prev) => [...prev, ...result.items]);
          setCursor(result.nextCursor);
          setLoading(false);
        }}
      />
    </div>
  );
}
