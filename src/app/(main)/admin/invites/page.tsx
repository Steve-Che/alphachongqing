import { getInviteCodes } from "@/lib/queries";
import { InviteManager } from "@/components/admin/InviteManager";

export const dynamic = "force-dynamic";

export default async function AdminInvitesPage() {
  const invites = await getInviteCodes();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">邀请码管理</h1>
        <p className="mt-1 text-sm text-stone-500">
          生成和管理阿尔法重庆的邀请码。
        </p>
      </header>
      <InviteManager invites={invites} />
    </div>
  );
}
