import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getVisibleChapters } from "@/content/manual";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { WelcomeBanner } from "@/components/guide/WelcomeBanner";
import { ManualLayout } from "@/components/guide/ManualLayout";
import { ManualHub } from "@/components/guide/ManualHub";

export const metadata: Metadata = {
  title: "街坊手册",
  description: "阿尔法重庆平台全量操作说明：地图、入驻、店铺、内容、社交与管理后台。",
};

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  const { welcome } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";
  const chapters = getVisibleChapters(isAdmin);

  return (
    <ManualLayout chapters={chapters}>
      {welcome === "1" && session?.user && <WelcomeBanner />}
      {session?.user && <ResidenceBanner userId={session.user.id} />}

      <ManualHub chapters={chapters} />

      <p className="mt-8 text-sm text-stone-500">
        建议新街坊从
        <Link href="/guide/overview" className="text-accent hover:underline">
          产品全貌
        </Link>
        读起，或按上方章节卡片逐项查阅。
      </p>
    </ManualLayout>
  );
}
