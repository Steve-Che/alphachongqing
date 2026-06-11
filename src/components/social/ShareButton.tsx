"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function ShareButton({
  title,
  url,
  compact = false,
}: {
  title: string;
  url: string;
  compact?: boolean;
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

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        aria-label="分享"
        className={cn(
          "inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600",
        )}
      >
        <Icon icon={Share2} size={14} />
        分享
      </button>
    );
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
      <Icon icon={Share2} size={14} className="mr-1" />
      {loading ? "…" : "分享"}
    </Button>
  );
}
