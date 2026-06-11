"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleFollow } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

export function FollowButton({
  followingId,
  initialFollowing,
  isSelf,
}: {
  followingId: string;
  initialFollowing: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isSelf) return null;

  async function handleClick() {
    const prev = following;
    setFollowing(!following);
    setLoading(true);

    const result = await toggleFollow(followingId);
    if (result.ok && result.data) {
      setFollowing(result.data.following);
      toast.success(result.data.following ? "已关注" : "已取消关注");
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
    >
      {following ? "已关注" : "关注"}
    </Button>
  );
}
