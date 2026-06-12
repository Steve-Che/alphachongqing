import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getDistrictPublicEvents,
  getPublicVenueBySlug,
  getVenueFeed,
} from "@/lib/queries";
import { DISTRICTS } from "@/lib/chongqing/geo";
import { venueTypeLabel } from "@/lib/chongqing/public-venues";
import { VenueMessageForm } from "@/components/public-venues/VenueMessageForm";
import { VenueMomentComposer } from "@/components/public-venues/VenueMomentComposer";
import { VenueFeedList } from "@/components/public-venues/VenueFeedList";
import { PublicEventList } from "@/components/public-venues/PublicEventList";
import { LibraryShelf } from "@/components/public-venues/LibraryShelf";
import { AuthorLink } from "@/components/social/AuthorLink";
import { FormattedTime } from "@/components/ui/formatted-time";

export const revalidate = 60;

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const venue = await getPublicVenueBySlug(slug, session?.user?.id);
  if (!venue) notFound();

  const district = DISTRICTS.find((d) => d.slug === venue.districtSlug);
  const feed = await getVenueFeed(venue.id);

  const districtEvents =
    venue.type === "COMMUNITY_HALL"
      ? await getDistrictPublicEvents(venue.districtSlug, session?.user?.id)
      : [];

  const showEvents =
    venue.type === "CONCERT_HALL" ||
    venue.type === "SQUARE" ||
    venue.type === "COMMUNITY_HALL";

  const events =
    venue.type === "COMMUNITY_HALL" ? districtEvents : venue.events;

  const isLibrary = venue.type === "LIBRARY";
  const isCommunity = venue.type === "COMMUNITY_HALL";

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <Link href="/places" className="hover:text-stone-800">
          公共区
        </Link>
        <span className="mx-2">/</span>
        {district && (
          <>
            <Link
              href={`/district/${district.slug}`}
              className="hover:text-stone-800"
            >
              {district.nameZh}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-stone-800">{venue.nameZh}</span>
      </nav>

      <header className="rounded-lg border border-stone-200 bg-paper p-6">
        <span className="text-xs font-medium text-[#b84a2f]">
          {venueTypeLabel(venue.type)}
          {venue.tier === "COMMUNITY" && " · 社区馆"}
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
          {venue.nameZh}
        </h1>
        {venue.summary && (
          <p className="mt-2 max-w-2xl text-stone-600">{venue.summary}</p>
        )}
      </header>

      {isLibrary && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold">公版书架</h2>
          <p className="mb-4 text-sm text-stone-500">
            精选公版经典，无需登录即可阅读全文。
          </p>
          <LibraryShelf
            books={venue.libraryBooks}
            venueSlug={venue.slug}
          />
        </section>
      )}

      {isCommunity && (
        <section className="rounded border border-stone-200 bg-amber-50/30 p-4">
          <h2 className="font-serif text-lg font-semibold">城心资源</h2>
          <p className="mt-1 text-sm text-stone-600">
            本馆连接渝中城心的公共场馆，欢迎前往市立图书馆阅读，或关注广场与音乐厅活动。
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/place/city-library" className="text-accent hover:underline">
              市立图书馆 →
            </Link>
            <Link href="/place/mountain-hall" className="text-accent hover:underline">
              山城音乐厅 →
            </Link>
            <Link href="/place/jiefangbei-square" className="text-accent hover:underline">
              解放碑广场 →
            </Link>
          </div>
        </section>
      )}

      {isCommunity && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold">荐书三册</h2>
          <p className="mb-3 text-sm text-stone-500">
            来自市立图书馆的精选公版书，点击下方前往阅读。
          </p>
          <CommunityBookLinks />
        </section>
      )}

      {venue.type === "GALLERY" && venue.galleryArticles.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold">展厅精选</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {venue.galleryArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/article/${article.id}`}
                  className="block rounded border border-stone-200 bg-paper p-4 hover:border-[#b84a2f]/40"
                >
                  <h3 className="font-serif font-semibold text-stone-900">
                    {article.title ?? "无题"}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    <AuthorLink author={article.author} />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showEvents && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold">
            {venue.type === "COMMUNITY_HALL" ? "本区近期活动" : "近期活动"}
          </h2>
          <PublicEventList
            events={events}
            isLoggedIn={!!session?.user}
            showVenue={venue.type === "COMMUNITY_HALL"}
          />
        </section>
      )}

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">场馆动态</h2>
        {session?.user ? (
          <div className="mb-4">
            <VenueMomentComposer venueId={venue.id} venueName={venue.nameZh} />
          </div>
        ) : (
          <p className="mb-4 text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">
              登录
            </Link>
            后可发布场馆短文
          </p>
        )}
        <VenueFeedList
          venueId={venue.id}
          initialItems={feed.items}
          initialCursor={feed.nextCursor}
        />
      </section>

      <section id="venue-messages">
        <h2 className="mb-4 font-serif text-lg font-semibold">留言板</h2>
        {session?.user ? (
          <VenueMessageForm venueId={venue.id} venueSlug={venue.slug} />
        ) : (
          <p className="text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">
              登录
            </Link>
            后可在留言板发言
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {venue.messages.map((msg) => (
            <li
              key={msg.id}
              className="rounded border-l-2 border-accent bg-paper px-4 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <AuthorLink author={msg.author} />
                <span className="text-stone-400">·</span>
                <FormattedTime date={msg.createdAt} className="text-stone-400" />
              </div>
              <p className="mt-1 whitespace-pre-wrap text-stone-800">
                {msg.content}
              </p>
            </li>
          ))}
          {venue.messages.length === 0 && (
            <p className="text-stone-500">留言板还很安静，来留第一条吧。</p>
          )}
        </ul>
      </section>
    </div>
  );
}

/** 社区馆展示市立图书馆前三本荐书 */
async function CommunityBookLinks() {
  const { prisma } = await import("@/lib/db");
  const books = await prisma.libraryBook.findMany({
    orderBy: { sortOrder: "asc" },
    take: 3,
    include: { venue: { select: { slug: true } } },
  });
  if (books.length === 0) return null;

  return (
    <LibraryShelf
      books={books}
      venueSlug={books[0]!.venue.slug}
      compact
    />
  );
}
