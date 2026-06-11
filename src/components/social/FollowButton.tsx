"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleFollow } from "@/app/actions/social";
import { dispatchNotificationsUpdated } from "@/lib/notification-events";
import { Button } from "@/components/ui/button";

export function FollowButton({
  followingId,
  initialFollowing,
  initialFollowedBy = false,
  isSelf,
}: {
  followingId: string;
  initialFollowing: boolean;
  initialFollowedBy?: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followedBy] = useState(initialFollowedBy);
  const [loading, setLoading] = useState(false);

  if (isSelf) return null;

  const label = following
    ? followedBy
      ? "互相关注"
      : "已关注"
    : followedBy
      ? "回关"
      : "关注";

  async function handleClick() {
    const prev = following;
    setFollowing(!following);
    setLoading(true);

    const result = await toggleFollow(followingId);
    if (result.ok && result.data) {
      setFollowing(result.data.following);
      toast.success(result.data.following ? "已关注" : "已取消关注");
      if (result.data.following) dispatchNotificationsUpdated();
      router.refresh();
    } else {
      setFollowing(prev);
      if (!result.ok) toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={following}
      aria-label={label}
    >
      {label}
    </Button>
  );
}
