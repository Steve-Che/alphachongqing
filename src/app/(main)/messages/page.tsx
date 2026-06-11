import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConversations } from "@/lib/queries";
import { ConversationList } from "@/components/messages/ConversationList";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await getConversations(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">私信</h1>
        <p className="mt-1 text-sm text-stone-500">与街坊一对一交流</p>
      </header>
      <ConversationList conversations={conversations} />
    </div>
  );
}
