import { formatDate } from "@/lib/utils";
import { AuthorLink } from "@/components/social/AuthorLink";
import { CommentThread, type CommentData } from "@/components/social/CommentThread";
import { CommentForm } from "@/components/social/CommentForm";

export function MessageWithReplies({
  content,
  author,
  createdAt,
  comments,
  guestbookEntryId,
  streetMessageId,
  currentUserId,
  isAdmin,
  canReply,
}: {
  content: string;
  author: { id: string; username: string; displayName: string | null };
  createdAt: Date;
  comments: CommentData[];
  guestbookEntryId?: string;
  streetMessageId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  canReply?: boolean;
}) {
  return (
    <div>
      <p className="text-stone-800">{content}</p>
      <p className="mt-1 text-xs text-stone-400">
        <AuthorLink author={author} className="text-stone-500 hover:text-accent" />
        {" · "}
        {formatDate(createdAt)}
      </p>
      {comments.length > 0 && (
        <div className="mt-3">
          <CommentThread
            comments={comments}
            guestbookEntryId={guestbookEntryId}
            streetMessageId={streetMessageId}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            canReply={canReply}
          />
        </div>
      )}
      {canReply && (
        <CommentForm
          guestbookEntryId={guestbookEntryId}
          streetMessageId={streetMessageId}
          placeholder="回复这条留言…"
          compact
        />
      )}
    </div>
  );
}
