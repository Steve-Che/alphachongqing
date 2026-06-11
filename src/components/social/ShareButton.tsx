"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${url}`
        : url;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        setLoading(false);
        return;
      } catch {
        // fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("链接已复制");
    } catch {
      toast.error("复制失败，请手动复制链接");
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={loading}
      aria-label="分享"
    >
      {loading ? "…" : "分享"}
    </Button>
  );
}
