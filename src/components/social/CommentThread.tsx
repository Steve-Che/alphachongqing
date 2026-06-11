"use client";

import { useState } from "react";
import { AuthorLink } from "@/components/social/AuthorLink";
import { CommentForm } from "@/components/social/CommentForm";
import { DeleteCommentButton } from "@/components/social/DeleteCommentButton";
import { FormattedTime } from "@/components/ui/formatted-time";

export type CommentData = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; username: string; displayName: string | null };
  replies: {
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; username: string; displayName: string | null };
  }[];
};

export function CommentThread({
  comments,
  postId,
  guestbookEntryId,
  streetMessageId,
  currentUserId,
  currentUser,
  isAdmin,
  canReply,
  onCommentAdded,
  onCommentDeleted,
}: {
  comments: CommentData[];
  postId?: string;
  guestbookEntryId?: string;
  streetMessageId?: string;
  currentUserId?: string;
  currentUser?: { id: string; username: string; displayName: string | null };
  isAdmin?: boolean;
  canReply?: boolean;
  onCommentAdded?: (data: {
    id: string;
    body: string;
    parentId?: string | null;
  }) => void;
  onCommentDeleted?: (commentId: string) => void;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (comments.length === 0) {
    return <p className="text-sm text-stone-500">还没有评论。</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded border border-stone-200 bg-paper px-4 py-3">
          <p className="text-stone-800">{comment.body}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            <AuthorLink author={comment.author} className="text-stone-500 hover:text-accent" />
            <span>· <FormattedTime date={comment.createdAt} /></span>
            {(comment.author.id === currentUserId || isAdmin) && (
              <DeleteCommentButton
                commentId={comment.id}
                onDeleted={onCommentDeleted}
              />
            )}
            {canReply && (
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
              >
                回复
              </button>
            )}
          </p>

          {comment.replies.length > 0 && (
            <ul className="mt-3 space-y-2 border-l-2 border-stone-200 pl-4">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <p className="text-sm text-stone-800">{reply.body}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                    <AuthorLink
                      author={reply.author}
                      className="text-stone-500 hover:text-accent"
                    />
                    <span>· <FormattedTime date={reply.createdAt} /></span>
                    {(reply.author.id === currentUserId || isAdmin) && (
                      <DeleteCommentButton
                        commentId={reply.id}
                        onDeleted={onCommentDeleted}
                      />
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {canReply && replyingTo === comment.id && currentUser && (
            <CommentForm
              postId={postId}
              guestbookEntryId={guestbookEntryId}
              streetMessageId={streetMessageId}
              parentId={comment.id}
              placeholder="回复…"
              compact
              onSuccess={(data) => {
                onCommentAdded?.(data);
                setReplyingTo(null);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
