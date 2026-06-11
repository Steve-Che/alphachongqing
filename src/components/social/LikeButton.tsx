"use client";

import { useState } from "react";
import { toggleLike } from "@/app/actions/social";
import { dispatchNotificationsUpdated } from "@/lib/notification-events";
import { toast } from "sonner";

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    const result = await toggleLike(postId);
    if (result.ok && result.data) {
      setLiked(result.data.liked);
      setCount(result.data.count);
      if (result.data.liked) dispatchNotificationsUpdated();
    } else {
      setLiked(prevLiked);
      setCount(prevCount);
      if (!result.ok) toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={liked ? "取消点赞" : "点赞"}
      className={`text-xs ${liked ? "text-red-600" : "text-stone-400 hover:text-stone-600"}`}
    >
      {liked ? "♥" : "♡"} {count > 0 ? count : ""}
    </button>
  );
}
