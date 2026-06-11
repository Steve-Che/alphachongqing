"use client";

import { PostList } from "@/components/feed/PostList";
import { LoadMoreButton } from "@/components/ui/load-more-button";
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
  const likedSet = new Set(likedPostIds ?? []);

  return (
    <LoadMoreButton
      initialItems={initialPosts}
      initialCursor={initialCursor}
      loadMore={loadMoreFollowingFeed}
      renderItem={(post) => (
        <PostList
          key={post.id}
          posts={[post]}
          likedPostIds={likedSet}
        />
      )}
      listClassName="space-y-6"
      emptyMessage="还没有动态。"
    />
  );
}
