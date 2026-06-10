"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { attachPostToRoom } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";

type Post = { id: string; title: string | null; type: string };

export function AttachPostForm({
  roomId,
  articles,
}: {
  roomId: string;
  articles: Post[];
}) {
  const router = useRouter();
  const [postId, setPostId] = useState("");
  const [loading, setLoading] = useState(false);

  if (articles.length === 0) return null;

  async function handleAttach() {
    if (!postId) return;
    setLoading(true);
    await attachPostToRoom(roomId, postId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex items-center gap-2 rounded border border-dashed border-stone-300 bg-stone-50 p-3">
      <select
        value={postId}
        onChange={(e) => setPostId(e.target.value)}
        className="flex-1 rounded border border-stone-300 px-2 py-1 text-sm"
      >
        <option value="">选择要挂载的长文…</option>
        {articles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title ?? "无标题"}
          </option>
        ))}
      </select>
      <Button type="button" size="sm" onClick={handleAttach} disabled={loading || !postId}>
        {loading ? "挂载中…" : "挂载到房间"}
      </Button>
    </div>
  );
}
