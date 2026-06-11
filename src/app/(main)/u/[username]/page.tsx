import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserByUsername, isFollowing, getFollowCounts } from "@/lib/queries";
import { PostList } from "@/components/feed/PostList";
import { auth } from "@/lib/auth";
import { ReleaseResidenceButton } from "@/components/residence/ReleaseResidenceButton";
import { FollowButton } from "@/components/social/FollowButton";
import { Avatar } from "@/components/social/Avatar";

export const revalidate = 60;

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
  const [following, followCounts] = await Promise.all([
    session?.user?.id && !isSelf
      ? isFollowing(session.user.id, user.id)
      : Promise.resolve(false),
    getFollowCounts(user.id),
  ]);

  const author = {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
  const articles = user.posts
    .filter((p) => p.type === "ARTICLE")
    .map((p) => ({ ...p, author }));
  const moments = user.posts
    .filter((p) => p.type === "MOMENT")
    .map((p) => ({ ...p, author }));

  return (
    <div className="space-y-8">
      <header className="rounded border border-stone-200 bg-paper p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <Avatar
              username={user.username}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              size="lg"
            />
            <div>
              <h1 className="font-serif text-3xl font-semibold">
                {user.displayName ?? user.username}
              </h1>
              <p className="text-sm text-stone-500">@{user.username}</p>
              <p className="mt-1 text-sm text-stone-500">
                {followCounts.followers} 粉丝 · {followCounts.following} 关注
              </p>
            </div>
          </div>
          {session?.user && (
            <FollowButton
              followingId={user.id}
              initialFollowing={following}
              isSelf={isSelf}
            />
          )}
        </div>
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

        {isSelf && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/settings" className="text-accent hover:underline">
              编辑资料
            </Link>
            {(user.shop || user.apartmentUnit) && <ReleaseResidenceButton />}
          </div>
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
        <PostList posts={articles} showDelete={isSelf} />
        {articles.length === 0 && <p className="text-stone-500">还没有长文。</p>}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">短文</h2>
        <PostList posts={moments} showDelete={isSelf} />
        {moments.length === 0 && <p className="text-stone-500">还没有短文。</p>}
      </section>
    </div>
  );
}
