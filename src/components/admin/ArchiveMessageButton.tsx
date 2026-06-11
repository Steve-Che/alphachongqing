"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveStreetMessage } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function ArchiveMessageButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("确定归档这条街道留言？")) return;
    setLoading(true);
    const result = await archiveStreetMessage(messageId);
    if (result.ok) {
      toast.success("已归档");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? "…" : "归档"}
    </Button>
  );
}
