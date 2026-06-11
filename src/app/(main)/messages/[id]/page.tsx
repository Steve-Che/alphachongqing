import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDirectMessages } from "@/lib/queries";
import { markConversationRead } from "@/app/actions/messages";
import { DirectMessageComposer } from "@/components/messages/DirectMessageComposer";
import { formatDate } from "@/lib/utils";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  await markConversationRead(id);

  const data = await getDirectMessages(id, session.user.id);
  if (!data) notFound();

  const other = data.participants[0];
  const title = other?.displayName ?? other?.username ?? "对话";

  return (
    <div className="space-y-4">
      <nav className="text-sm text-stone-500">
        <Link href="/messages" className="hover:text-stone-800">
          私信
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{title}</span>
      </nav>

      <div className="rounded border border-stone-200 bg-paper">
        <ul className="max-h-[50vh] space-y-3 overflow-y-auto p-4">
          {data.messages.map((msg) => {
            const mine = msg.senderId === session.user!.id;
            return (
              <li
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    mine
                      ? "bg-[#c45c3e] text-white"
                      : "border border-stone-200 bg-stone-50 text-stone-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  <time className="mt-1 block text-[10px] opacity-70">
                    {formatDate(msg.createdAt)}
                  </time>
                </div>
              </li>
            );
          })}
          {data.messages.length === 0 && (
            <li className="text-center text-sm text-stone-500">开始对话吧</li>
          )}
        </ul>
        <div className="p-4">
          <DirectMessageComposer conversationId={id} />
        </div>
      </div>
    </div>
  );
}
