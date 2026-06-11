"use client";

import { useState } from "react";
import Link from "next/link";
import { CommentThread, type CommentData } from "@/components/social/CommentThread";
import { CommentForm } from "@/components/social/CommentForm";
import { LoadMoreFooter } from "@/components/ui/load-more-button";
import { loadMorePostComments } from "@/app/actions/social";

export function PostCommentSection({
  postId,
  initialComments,
  initialCursor,
  currentUserId,
  currentUser,
  isAdmin,
  canReply,
  showComposeForm = false,
}: {
  postId: string;
  initialComments: CommentData[];
  initialCursor: string | null;
  currentUserId?: string;
  currentUser?: { id: string; username: string; displayName: string | null };
  isAdmin?: boolean;
  canReply?: boolean;
  showComposeForm?: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  function handleCommentAdded(data: {
    id: string;
    body: string;
    parentId?: string | null;
  }) {
    if (!currentUser) return;
    const now = new Date();
    if (data.parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === data.parentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    id: data.id,
                    body: data.body,
                    createdAt: now,
                    author: currentUser,
                  },
                ],
              }
            : c,
        ),
      );
    } else {
      setComments((prev) => [
        {
          id: data.id,
          body: data.body,
          createdAt: now,
          author: currentUser,
          replies: [],
        },
        ...prev,
      ]);
    }
  }

  function handleCommentDeleted(commentId: string) {
    setComments((prev) => {
      const withoutTop = prev.filter((c) => c.id !== commentId);
      if (withoutTop.length !== prev.length) return withoutTop;
      return prev.map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== commentId),
      }));
    });
  }

  return (
    <div>
      {showComposeForm && canReply && currentUser && (
        <CommentForm
          postId={postId}
          placeholder="写下你的评论…"
          onSuccess={handleCommentAdded}
        />
      )}

      {comments.length === 0 ? (
        <p className={`text-sm text-stone-500 ${showComposeForm ? "mt-6" : ""}`}>
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
      ) : (
        <div className={showComposeForm ? "mt-6" : ""}>
          <CommentThread
            comments={comments}
            postId={postId}
            currentUserId={currentUserId}
            currentUser={currentUser}
            isAdmin={isAdmin}
            canReply={canReply}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}

      <LoadMoreFooter
        hasMore={!!cursor}
        loading={loading}
        label="加载更多评论"
        onLoadMore={async () => {
          if (!cursor) return;
          setLoading(true);
          const result = await loadMorePostComments(postId, cursor);
          setComments((prev) => [...prev, ...result.items]);
          setCursor(result.nextCursor);
          setLoading(false);
        }}
      />
    </div>
  );
}
