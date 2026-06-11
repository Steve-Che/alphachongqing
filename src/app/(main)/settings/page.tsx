import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">个人设置</h1>
        <p className="mt-1 text-sm text-stone-500">更新你在阿尔法重庆的身份信息。</p>
      </header>
      <ProfileSettingsForm user={user} />
    </div>
  );
}
