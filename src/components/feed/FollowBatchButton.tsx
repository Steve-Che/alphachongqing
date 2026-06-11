"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { followRecommendedUsers } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

export function FollowBatchButton({ userIds }: { userIds: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await followRecommendedUsers(userIds);
    if (result.ok && result.data) {
      toast.success(`已关注 ${result.data.count} 位街坊`);
      router.refresh();
    } else if (!result.ok) {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Button type="button" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "关注中…" : "一键关注推荐街坊"}
    </Button>
  );
}
