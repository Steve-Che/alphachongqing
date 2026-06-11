"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { Button } from "@/components/ui/button";

export function BookmarkButton({
  postId,
  initialBookmarked,
}: {
  postId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await toggleBookmark(postId);
    if (result.ok && result.data) {
      setBookmarked(result.data.bookmarked);
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={bookmarked}
      className={bookmarked ? "text-[#b84a2f]" : undefined}
      title={bookmarked ? "取消收藏" : "收藏"}
    >
      <Heart
        className="mr-1 h-4 w-4"
        strokeWidth={2}
        fill={bookmarked ? "currentColor" : "none"}
      />
      {bookmarked ? "已收藏" : "收藏"}
    </Button>
  );
}
