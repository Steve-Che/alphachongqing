import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getShopBySlug } from "@/lib/queries";
import { RoomNav } from "@/components/shop/RoomNav";
import { GuestbookForm } from "@/components/shop/GuestbookForm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    include: { author: true },
  });

  const isOwner = session?.user?.id === shop.ownerId;
  const street = shop.shopSlot.street;
  const district = street.district;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <Link href={`/district/${district.slug}`} className="hover:text-stone-800">
          {district.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/street/${street.slug}`} className="hover:text-stone-800">
          {street.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{shop.name}</span>
      </nav>

      <header className="rounded border border-stone-200 bg-paper p-6">
        <h1 className="font-serif text-3xl font-semibold">{shop.name}</h1>
        {shop.tagline && <p className="mt-2 text-stone-600">{shop.tagline}</p>}
        <p className="mt-3 text-sm text-stone-500">
          店主：
          <Link href={`/u/${shop.owner.username}`} className="text-accent hover:underline">
            {shop.owner.displayName ?? shop.owner.username}
          </Link>
        </p>
      </header>

      <RoomNav shopSlug={shop.slug} rooms={shop.rooms} />

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">前厅预览</h2>
        {shop.rooms
          .filter((r) => r.roomType === "FRONT_HALL")
          .map((room) => (
            <div key={room.id}>
              {room.roomContents.length > 0 ? (
                room.roomContents.map((rc) =>
                  rc.post ? (
                    <article key={rc.id} className="prose-retro rounded bg-paper p-4">
                      <h3 className="font-serif text-xl">{rc.post.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: rc.post.body }} />
                    </article>
                  ) : rc.text ? (
                    <p key={rc.id} className="text-stone-700">{rc.text}</p>
                  ) : null,
                )
              ) : (
                <p className="text-stone-500">店主还没有布置前厅。</p>
              )}
              <Link
                href={`/shop/${shop.slug}/front-hall`}
                className="mt-2 inline-block text-sm text-accent hover:underline"
              >
                进入前厅 →
              </Link>
            </div>
          ))}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">留言板</h2>
        {session?.user && <GuestbookForm shopId={shop.id} />}
        <ul className="mt-4 space-y-2">
          {guestbook.map((entry) => (
            <li key={entry.id} className="rounded border-l-2 border-stone-300 bg-paper px-4 py-2">
              <p className="text-stone-800">{entry.content}</p>
              <p className="mt-1 text-xs text-stone-400">
                {entry.author.displayName ?? entry.author.username} · {formatDate(entry.createdAt)}
              </p>
            </li>
          ))}
          {guestbook.length === 0 && (
            <p className="text-stone-500">还没有留言。</p>
          )}
        </ul>
      </section>

      {isOwner && (
        <p className="text-sm text-stone-500">
          你是店主，可进入各房间布置内容，或{" "}
          <Link href="/write/article" className="text-accent underline">
            写长文
          </Link>{" "}
          挂载到房间。
        </p>
      )}
    </div>
  );
}
