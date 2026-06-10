import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/queries";
import { PostList } from "@/components/feed/PostList";
import { releaseResidenceAction } from "@/app/actions/shop";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUserByUsername(username),
    auth(),
  ]);
  if (!user) notFound();

  const isSelf = session?.user?.id === user.id;
  const articles = user.posts.filter((p) => p.type === "ARTICLE");
  const moments = user.posts.filter((p) => p.type === "MOMENT");

  return (
    <div className="space-y-8">
      <header className="rounded border border-stone-200 bg-paper p-6">
        <h1 className="font-serif text-3xl font-semibold">
          {user.displayName ?? user.username}
        </h1>
        <p className="text-sm text-stone-500">@{user.username}</p>
        {user.bio && <p className="mt-3 text-stone-600">{user.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {user.shop && (
            <Link href={`/shop/${user.shop.slug}`} className="text-accent hover:underline">
              店铺：{user.shop.name}（{user.shop.shopSlot.street.nameZh}）
            </Link>
          )}
          {user.apartmentUnit && (
            <Link
              href={`/apartment/${user.apartmentUnit.id}`}
              className="text-accent hover:underline"
            >
              公寓：{user.apartmentUnit.building.street.nameZh}{" "}
              {user.apartmentUnit.building.buildingNumber} 号楼
            </Link>
          )}
        </div>

        {isSelf && (user.shop || user.apartmentUnit) && (
          <form action={releaseResidenceAction} className="mt-4">
            <Button type="submit" variant="outline" size="sm">
              释放当前地盘（店铺或公寓）
            </Button>
          </form>
        )}
      </header>

      {isSelf && (
        <div className="flex gap-3 text-sm">
          <Link href="/write/article" className="text-accent hover:underline">
            写长文
          </Link>
          <Link href="/write/moment" className="text-accent hover:underline">
            发短文
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">长文</h2>
        <PostList posts={articles} />
        {articles.length === 0 && <p className="text-stone-500">还没有长文。</p>}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">短文</h2>
        <PostList posts={moments} />
        {moments.length === 0 && <p className="text-stone-500">还没有短文。</p>}
      </section>
    </div>
  );
}
