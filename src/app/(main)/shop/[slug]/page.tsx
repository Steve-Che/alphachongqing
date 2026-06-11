import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getShopBySlug } from "@/lib/queries";
import { MessageWithReplies } from "@/components/social/MessageWithReplies";
import { RoomFloorPlan } from "@/components/shop/RoomFloorPlan";
import { GuestbookForm } from "@/components/shop/GuestbookForm";
import { roomTypeToSlug } from "@/lib/rooms";
import { encodeRouteSlug } from "@/lib/route-slug";

export const revalidate = 60;

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [shop, session] = await Promise.all([getShopBySlug(slug), auth()]);
  if (!shop) notFound();

  const guestbook = await prisma.guestbookEntry.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, username: true, displayName: true } },
            },
          },
        },
      },
    },
  });

  const isOwner = session?.user?.id === shop.owner.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const street = shop.shopSlot.street;
  const district = street.district;
  const frontRoom = shop.rooms.find((r) => r.roomType === "FRONT_HALL");
  const frontContents = frontRoom
    ? await prisma.roomContent.findMany({
        where: { shopRoomId: frontRoom.id },
        include: {
          post: { select: { id: true, title: true, body: true } },
        },
      })
    : [];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <Link href={`/district/${district.slug}`} className="hover:text-stone-800">
          {district.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/street/${encodeRouteSlug(street.slug)}`} className="hover:text-stone-800">
          {street.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{shop.name}</span>
      </nav>

      <header className="rounded-lg border border-stone-200 bg-paper p-6">
        <p className="text-xs text-stone-400">店铺 · {street.nameZh}</p>
        <h1 className="font-serif text-3xl font-semibold">{shop.name}</h1>
        {shop.tagline && <p className="mt-2 text-stone-600">{shop.tagline}</p>}
        <p className="mt-3 text-sm text-stone-500">
          店主：
          <Link href={`/u/${shop.owner.username}`} className="text-accent hover:underline">
            {shop.owner.displayName ?? shop.owner.username}
          </Link>
        </p>
        {isOwner && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/write/article" className="text-accent hover:underline">
              写长文并挂载到房间
            </Link>
          </div>
        )}
      </header>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">店铺平面图</h2>
        <p className="mb-3 text-sm text-stone-500">点击房间进入。六间房致敬阿尔法城小店结构。</p>
        <RoomFloorPlan shopSlug={shop.slug} rooms={shop.rooms} />
      </section>

      {frontRoom && (
        <section>
          <h2 className="mb-3 font-serif text-lg font-semibold">前厅</h2>
          {frontContents.length > 0 ? (
            frontContents.map((rc) =>
              rc.post ? (
                <article key={rc.id} className="rounded-lg border border-stone-200 bg-paper p-5">
                  <Link
                    href={`/article/${rc.post.id}`}
                    className="font-serif text-xl font-semibold hover:text-accent"
                  >
                    {rc.post.title}
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                    {rc.post.body.replace(/<[^>]+>/g, "").slice(0, 120)}…
                  </p>
                </article>
              ) : null,
            )
          ) : (
            <p className="text-stone-500">前厅还没有内容。</p>
          )}
          <Link
            href={`/shop/${shop.slug}/${roomTypeToSlug("FRONT_HALL")}`}
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            进入前厅 →
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">留言板</h2>
        {session?.user ? (
          <GuestbookForm shopId={shop.id} />
        ) : (
          <p className="text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">登录</Link> 后留言
          </p>
        )}
        <ul className="mt-4 space-y-2">
          {guestbook.map((entry) => (
            <li key={entry.id} className="rounded border-l-2 border-stone-300 bg-paper px-4 py-2">
              <MessageWithReplies
                content={entry.content}
                author={entry.author}
                createdAt={entry.createdAt}
                comments={entry.comments}
                guestbookEntryId={entry.id}
                currentUserId={session?.user?.id}
                isAdmin={isAdmin}
                canReply={!!session?.user}
              />
            </li>
          ))}
          {guestbook.length === 0 && (
            <p className="text-stone-500">还没有留言，来做第一个吧。</p>
          )}
        </ul>
      </section>
    </div>
  );
}
