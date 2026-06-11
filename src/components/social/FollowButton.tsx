"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [error, setError] = useState("");

  if (isSelf) return null;

  async function handleClick() {
    setLoading(true);
    setError("");
    const result = await toggleFollow(followingId);
    if (result.ok && result.data) {
      setFollowing(result.data.following);
      router.refresh();
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={following ? "outline" : "default"}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "…" : following ? "已关注" : "关注"}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
