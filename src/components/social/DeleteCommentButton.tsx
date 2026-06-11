"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComment } from "@/app/actions/social";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这条评论？")) return;
    setLoading(true);
    const result = await deleteComment(commentId);
    if (result.ok) router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline"
    >
      {loading ? "删除中…" : "删除"}
    </button>
  );
}
