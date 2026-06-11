import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getApartmentRangeSummary,
  getStreetBySlug,
  getStreetFeed,
  getStreetPathBubbles,
  getStreetStripData,
  getUserResidence,
} from "@/lib/queries";
import { StreetFeedList } from "@/components/feed/StreetFeedList";
import { MomentComposer } from "@/components/feed/MomentComposer";
import { MessageWithReplies } from "@/components/social/MessageWithReplies";
import { StreetViewLoader } from "@/components/map/StreetViewLoader";
import { ApartmentRangeBar } from "@/components/apartment/ApartmentRangeBar";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { StreetMessageForm } from "@/components/street/StreetMessageForm";
import { StreetHeaderPortal } from "@/components/street/StreetHeaderPortal";
import { StreetPathChat } from "@/components/street/StreetPathChat";
import { StreetStripView } from "@/components/street/StreetStripView";
import { decodeRouteSlug } from "@/lib/route-slug";
import { buildMeResidence } from "@/lib/residence-types";

export const revalidate = 60;

export default async function StreetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeRouteSlug(rawSlug);
  const [street, session] = await Promise.all([
    getStreetBySlug(slug),
    auth(),
  ]);
  if (!street) notFound();

  const residence = session?.user?.id
    ? await getUserResidence(session.user.id)
    : null;
  const meResidence = residence ? buildMeResidence(residence) : null;
  const canOpenShop = !!session?.user && !meResidence?.type;
  const canMoveShop = !!session?.user && meResidence?.type === "SHOP";
  const canRent = canOpenShop;
  const canMoveApartment =
    !!session?.user && meResidence?.type === "APARTMENT";
  const isChief =
    !!session?.user?.id && street.serviceChiefId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const [stripSlots, pathBubbles, apartmentRanges, streetFeed] =
    await Promise.all([
      getStreetStripData(street.id),
      getStreetPathBubbles(street.id),
      getApartmentRangeSummary(street.id),
      getStreetFeed(street.id),
    ]);

  const shopSlots = street.shopSlots.filter((s) => !s.isCenter);
  const occupiedShops = shopSlots.filter((s) => s.status === "OCCUPIED").length;
  const occupiedApts = street.apartmentSummaries.reduce(
    (sum, b) => sum + b.occupiedCount,
    0,
  );

  return (
    <div className="space-y-6">
      <StreetHeaderPortal
        streetName={street.nameZh}
        serviceChief={street.serviceChief}
      />

      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/district/${street.district.slug}`}
          className="hover:text-stone-800"
        >
          {street.district.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{street.nameZh}</span>
      </nav>

      <p className="text-center text-sm text-stone-500">
        已开业 {occupiedShops}/{shopSlots.length} 家店铺 · {occupiedApts}{" "}
        户公寓入住 · {street.apartmentBuildings.length} 栋公寓楼
      </p>

      {session?.user && <ResidenceBanner userId={session.user.id} />}

      {!session?.user && (
        <p className="text-center text-sm text-stone-500">
          <Link href="/login" className="text-[#b84a2f] hover:underline">
            登录
          </Link>
          后可在此开店或入住公寓
        </p>
      )}

      <section aria-label="街景">
        <StreetStripView
          streetName={street.nameZh}
          streetSlug={street.slug}
          slots={stripSlots}
          canOpenShop={canOpenShop}
          canMoveShop={canMoveShop}
          shopName={meResidence?.shop?.name}
          currentStreetName={meResidence?.shop?.streetName}
          targetStreetName={street.nameZh}
        />
      </section>

      <section aria-label="街道路径留言">
        <StreetPathChat streetSlug={street.slug} initialBubbles={pathBubbles} />
      </section>

      <ApartmentRangeBar
        ranges={apartmentRanges}
        canRent={canRent}
        canMoveApartment={canMoveApartment}
        residence={meResidence}
        streetName={street.nameZh}
        streetSlug={street.slug}
        username={session?.user?.username}
      />

      <details className="rounded border border-stone-200 bg-paper">
        <summary className="cursor-pointer px-4 py-3 font-serif font-semibold">
          3D 街景视角
        </summary>
        <div className="border-t border-stone-200 p-4">
          <p className="mb-3 text-xs text-stone-500">
            前排金色为店铺，后排蓝灰色为公寓塔楼（入住越多楼越高）
          </p>
          <StreetViewLoader
            streetName={street.nameZh}
            streetSlug={street.slug}
            slots={street.shopSlots}
            apartmentBuildings={street.apartmentSummaries}
          />
        </div>
      </details>

      <details className="rounded border border-stone-200 bg-paper" open>
        <summary className="cursor-pointer px-4 py-3 font-serif font-semibold">
          本街动态
        </summary>
        <div className="border-t border-stone-200 p-4">
          {session?.user && (
            <div id="moment-composer" className="mb-4">
              <MomentComposer
                defaultStreetId={street.id}
                defaultStreetName={street.nameZh}
              />
            </div>
          )}
          <StreetFeedList
            streetId={street.id}
            initialItems={streetFeed.items}
            initialCursor={streetFeed.nextCursor}
            streetSlug={street.slug}
          />
        </div>
      </details>

      <section id="street-messages">
        <h2 className="mb-4 font-serif text-lg font-semibold">街道留言详情</h2>
        {session?.user && (
          <StreetMessageForm
            streetId={street.id}
            canPostOfficial={isChief || isAdmin}
          />
        )}
        <ul className="mt-4 space-y-3">
          {street.streetMessages.map((msg) => (
            <li
              key={msg.id}
              className={`rounded border-l-2 px-4 py-2 ${
                msg.isOfficial
                  ? "border-[#b84a2f] bg-amber-50/50"
                  : "border-accent bg-paper"
              }`}
            >
              {msg.isPinned && (
                <span className="mb-1 inline-block text-[10px] font-medium text-[#b84a2f]">
                  置顶
                </span>
              )}
              {msg.isOfficial && (
                <span className="mb-1 ml-1 inline-block text-[10px] font-medium text-amber-800">
                  官方
                </span>
              )}
              <MessageWithReplies
                content={msg.content}
                author={msg.author}
                createdAt={msg.createdAt}
                comments={msg.comments}
                streetMessageId={msg.id}
                currentUserId={session?.user?.id}
                isAdmin={isAdmin}
                canReply={!!session?.user}
              />
            </li>
          ))}
          {street.streetMessages.length === 0 && (
            <p className="text-stone-500">街上还很安静，来留第一条言吧。</p>
          )}
        </ul>
      </section>
    </div>
  );
}
