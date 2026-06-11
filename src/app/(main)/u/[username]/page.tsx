import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getUserByUsername,
  getFollowRelation,
  getFollowCounts,
  getUserPosts,
} from "@/lib/queries";
import { UserPostsList } from "@/components/feed/UserPostsList";
import { auth } from "@/lib/auth";
import { siteName, siteUrl } from "@/lib/site";
import { ReleaseResidenceButton } from "@/components/residence/ReleaseResidenceButton";
import { FollowButton } from "@/components/social/FollowButton";
import { ShareButton } from "@/components/social/ShareButton";
import { Avatar } from "@/components/social/Avatar";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "用户未找到" };

  const name = user.displayName ?? user.username;
  return {
    title: `${name} · ${siteName}`,
    description: user.bio ?? `${name} 在阿尔法重庆的主页`,
    openGraph: {
      title: name,
      description: user.bio ?? undefined,
      images: user.avatarUrl ? [user.avatarUrl] : undefined,
      url: `${siteUrl}/u/${username}`,
    },
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, session, articlesResult, momentsResult] = await Promise.all([
    getUserByUsername(username),
    auth(),
    getUserPosts(username, 20, undefined, "ARTICLE"),
    getUserPosts(username, 20, undefined, "MOMENT"),
  ]);
  if (!user) notFound();

  const isSelf = session?.user?.id === user.id;
  const [relation, followCounts] = await Promise.all([
    session?.user?.id && !isSelf
      ? getFollowRelation(session.user.id, user.id)
      : Promise.resolve({ following: false, followedBy: false, mutual: false }),
    getFollowCounts(user.id),
  ]);

  const author = {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
  const articles = articlesResult.items.map((p) => ({ ...p, author }));
  const moments = momentsResult.items.map((p) => ({ ...p, author }));

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
                <Link
                  href={`/u/${user.username}/followers`}
                  className="hover:text-accent"
                >
                  {followCounts.followers} 粉丝
                </Link>
                {" · "}
                <Link
                  href={`/u/${user.username}/following`}
                  className="hover:text-accent"
                >
                  {followCounts.following} 关注
                </Link>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {session?.user && (
              <FollowButton
                followingId={user.id}
                initialFollowing={relation.following}
                initialFollowedBy={relation.followedBy}
                isSelf={isSelf}
              />
            )}
            <ShareButton
              title={`${user.displayName ?? user.username} 的主页`}
              url={`/u/${user.username}`}
            />
          </div>
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
        <UserPostsList
          username={username}
          initialPosts={articles}
          initialCursor={articlesResult.nextCursor}
          showDelete={isSelf}
          postType="ARTICLE"
          emptyMessage={
            isSelf
              ? "还没有长文。去写一篇吧 →"
              : "还没有长文。"
          }
        />
        {isSelf && articles.length === 0 && (
          <Link href="/write/article" className="mt-2 inline-block text-sm text-accent hover:underline">
            写长文
          </Link>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">短文</h2>
        <UserPostsList
          username={username}
          initialPosts={moments}
          initialCursor={momentsResult.nextCursor}
          showDelete={isSelf}
          postType="MOMENT"
          emptyMessage={
            isSelf
              ? "还没有短文。发一条吧 →"
              : "还没有短文。"
          }
        />
        {isSelf && moments.length === 0 && (
          <Link href="/write/moment" className="mt-2 inline-block text-sm text-accent hover:underline">
            发短文
          </Link>
        )}
      </section>
    </div>
  );
}
