import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getUserByUsername,
  getFollowing,
  isFollowing,
} from "@/lib/queries";
import { FollowList } from "@/components/social/FollowList";

export default async function FollowingPage({
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

  const { items, nextCursor } = await getFollowing(user.id);
  const followingMap: Record<string, boolean> = {};
  if (session?.user?.id) {
    await Promise.all(
      items.map(async (u) => {
        followingMap[u.id] = await isFollowing(session.user!.id, u.id);
      }),
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href={`/u/${username}`} className="hover:text-stone-800">
          {user.displayName ?? user.username}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">关注</span>
      </nav>
      <h1 className="font-serif text-2xl font-semibold">关注</h1>
      <FollowList
        users={items}
        initialCursor={nextCursor}
        userId={user.id}
        listType="following"
        viewerId={session?.user?.id}
        followingMap={followingMap}
      />
    </div>
  );
}
