"use client";

import { useState } from "react";
import Link from "next/link";
import { CommentThread } from "@/components/social/CommentThread";
import { Button } from "@/components/ui/button";
import { loadMorePostComments } from "@/app/actions/social";
import type { CommentData } from "@/components/social/CommentThread";

export function PostCommentSection({
  postId,
  initialComments,
  initialCursor,
  currentUserId,
  isAdmin,
  canReply,
}: {
  postId: string;
  initialComments: CommentData[];
  initialCursor: string | null;
  currentUserId?: string;
  isAdmin?: boolean;
  canReply?: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  if (comments.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        还没有评论。来做第一个评论吧！
        {!canReply && (
          <>
            {" "}
            <Link href="/login" className="text-accent hover:underline">
              登录
            </Link>
            后参与讨论
          </>
        )}
      </p>
    );
  }

  return (
    <div>
      <CommentThread
        comments={comments}
        postId={postId}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        canReply={canReply}
      />
      {cursor && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await loadMorePostComments(postId, cursor);
              setComments((prev) => [...prev, ...result.items]);
              setCursor(result.nextCursor);
              setLoading(false);
            }}
          >
            {loading ? "加载中…" : "加载更多评论"}
          </Button>
        </div>
      )}
    </div>
  );
}
