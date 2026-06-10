import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getShopBySlug } from "@/lib/queries";
import { roomSlugToType } from "@/lib/rooms";
import { ROOM_LABELS } from "@/lib/chongqing/geo";
import { RoomNav } from "@/components/shop/RoomNav";
import { GuestbookForm } from "@/components/shop/GuestbookForm";
import { AttachPostForm } from "@/components/shop/AttachPostForm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShopRoomPage({
  params,
}: {
  params: Promise<{ slug: string; room: string }>;
}) {
  const { slug, room: roomSlug } = await params;
  const roomType = roomSlugToType(roomSlug);
  if (!roomType) notFound();

  const [shop, session] = await Promise.all([getShopBySlug(slug), auth()]);
  if (!shop) notFound();

  const room = shop.rooms.find((r) => r.roomType === roomType);
  if (!room) notFound();

  const isOwner = session?.user?.id === shop.ownerId;
  const ownerArticles =
    isOwner && roomType !== "SIDE_ROOM"
      ? await prisma.post.findMany({
          where: { authorId: shop.ownerId, type: "ARTICLE" },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const guestbook =
    roomType === "SIDE_ROOM"
      ? await prisma.guestbookEntry.findMany({
          where: { shopId: shop.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { author: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href={`/shop/${shop.slug}`} className="hover:text-stone-800">
          {shop.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{room.displayName}</span>
      </nav>

      <RoomNav shopSlug={shop.slug} rooms={shop.rooms} activeRoomType={roomType} />

      <header>
        <h1 className="font-serif text-2xl font-semibold">
          {room.displayName}
        </h1>
        <p className="text-sm text-stone-500">
          {ROOM_LABELS[roomType]} · {shop.name}
        </p>
      </header>

      {roomType === "SIDE_ROOM" ? (
        <section>
          <p className="mb-4 text-stone-600">侧室是留言板，欢迎留下你的话。</p>
          {session?.user && <GuestbookForm shopId={shop.id} />}
          <ul className="mt-4 space-y-2">
            {guestbook.map((entry) => (
              <li key={entry.id} className="rounded border-l-2 border-accent bg-paper px-4 py-2">
                <p>{entry.content}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {entry.author.displayName ?? entry.author.username} · {formatDate(entry.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="space-y-4">
          {room.roomContents.length > 0 ? (
            room.roomContents.map((rc) =>
              rc.post ? (
                <article key={rc.id} className="prose-retro rounded border border-stone-200 bg-paper p-5">
                  <h2 className="font-serif text-xl">{rc.post.title}</h2>
                  <time className="text-xs text-stone-400">
                    {formatDate(rc.post.createdAt)}
                  </time>
                  <div
                    className="mt-3"
                    dangerouslySetInnerHTML={{ __html: rc.post.body }}
                  />
                </article>
              ) : rc.text ? (
                <p key={rc.id} className="whitespace-pre-wrap text-stone-700">{rc.text}</p>
              ) : null,
            )
          ) : (
            <p className="text-stone-500">这个房间还没有内容。</p>
          )}
          {isOwner && (
            <>
              <AttachPostForm roomId={room.id} articles={ownerArticles} />
              <p className="text-sm text-stone-500">
                或{" "}
                <Link href="/write/article" className="text-accent underline">
                  写新文章
                </Link>
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
