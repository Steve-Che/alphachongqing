import Link from "next/link";
import { formatDate } from "@/lib/utils";

type ConversationRow = {
  id: string;
  updatedAt: Date;
  participants: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }[];
  lastMessage: {
    body: string;
    createdAt: Date;
    sender: { username: string; displayName: string | null };
  } | null;
  unread: boolean;
};

export function ConversationList({
  conversations,
}: {
  conversations: ConversationRow[];
}) {
  if (conversations.length === 0) {
    return (
      <p className="rounded border border-dashed border-stone-300 bg-paper px-4 py-8 text-center text-stone-500">
        还没有私信。在用户主页可以发起对话。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 rounded border border-stone-200 bg-paper">
      {conversations.map((c) => {
        const other = c.participants[0];
        const name = other?.displayName ?? other?.username ?? "未知用户";
        const preview = c.lastMessage?.body ?? "（暂无消息）";

        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              className={`flex items-start justify-between gap-3 px-4 py-3 transition hover:bg-stone-50 ${
                c.unread ? "bg-amber-50/40" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-stone-900">{name}</p>
                <p className="mt-0.5 truncate text-sm text-stone-500">{preview}</p>
              </div>
              <time className="shrink-0 text-xs text-stone-400">
                {formatDate(c.updatedAt)}
              </time>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
