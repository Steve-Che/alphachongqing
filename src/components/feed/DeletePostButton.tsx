"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这条内容？")) return;
    setLoading(true);
    const result = await deletePost(postId);
    if (result.ok) router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-600 hover:underline"
    >
      {loading ? "删除中…" : "删除"}
    </button>
  );
}
