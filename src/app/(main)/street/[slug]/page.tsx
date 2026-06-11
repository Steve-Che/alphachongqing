import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStreetBySlug, getStreetFeed, getUserResidence } from "@/lib/queries";
import { StreetFeedList } from "@/components/feed/StreetFeedList";
import { MomentComposer } from "@/components/feed/MomentComposer";
import { MessageWithReplies } from "@/components/social/MessageWithReplies";
import { StreetViewLoader } from "@/components/map/StreetViewLoader";
import { ShopSlotCard } from "@/components/shop/ShopSlotCard";
import { ApartmentPicker } from "@/components/shop/ApartmentPicker";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { StreetMessageForm } from "@/components/street/StreetMessageForm";
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
  const canMoveApartment = !!session?.user && meResidence?.type === "APARTMENT";
  const streetFeed = await getStreetFeed(street.id);
  const feedItems = streetFeed.items;
  const feedCursor = streetFeed.nextCursor;
  const isAdmin = session?.user?.role === "ADMIN";

  const shopSlots = street.shopSlots.filter((s) => !s.isCenter);
  const occupiedShops = shopSlots.filter((s) => s.status === "OCCUPIED").length;
  const occupiedApts = street.apartmentSummaries.reduce(
    (sum, b) => sum + b.occupiedCount,
    0,
  );

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">城市地图</Link>
        <span className="mx-2">/</span>
        <Link href={`/district/${street.district.slug}`} className="hover:text-stone-800">
          {street.district.nameZh}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{street.nameZh}</span>
      </nav>

      <header className="rounded-lg border border-stone-200 bg-paper p-5">
        <h1 className="font-serif text-3xl font-semibold">{street.nameZh}</h1>
        {street.summary && <p className="mt-2 text-stone-600">{street.summary}</p>}
        <p className="mt-2 text-sm text-stone-500">
          已开业 {occupiedShops}/{shopSlots.length} 家店铺 · {occupiedApts} 户公寓入住 ·{" "}
          {street.apartmentBuildings.length} 栋公寓楼
        </p>
      </header>

      {session?.user && <ResidenceBanner userId={session.user.id} />}

      <section>
        <h2 className="mb-2 font-serif text-lg font-semibold">街景</h2>
        <p className="mb-3 text-xs text-stone-500">
          前排金色为店铺，后排蓝灰色为 30 栋公寓塔楼（入住越多楼越高）
        </p>
        <StreetViewLoader
          streetName={street.nameZh}
          streetSlug={street.slug}
          slots={street.shopSlots}
          apartmentBuildings={street.apartmentSummaries}
        />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">街边店铺</h2>
        {!session?.user && (
          <p className="mb-4 text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">登录</Link>
            后可在此开店
          </p>
        )}
        {session?.user && canMoveShop && meResidence?.shop && (
          <p className="mb-4 text-sm text-amber-800">
            你是店主，可在下方空铺点击「搬到此铺」换址（店铺内容保留），或去
            <Link href="/#map" className="text-accent hover:underline">
              城市地图
            </Link>
            选新街道。
          </p>
        )}
        {session?.user && meResidence?.type === "APARTMENT" && (
          <p className="mb-4 text-sm text-stone-600">
            你已有公寓。店铺与公寓不可互换，请先在主页释放后再开店。
          </p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopSlots.map((slot) => (
            <ShopSlotCard
              key={slot.id}
              slot={slot}
              canOpenShop={canOpenShop}
              canMoveShop={canMoveShop}
              shopName={meResidence?.shop?.name}
              currentStreetName={meResidence?.shop?.streetName}
              targetStreetName={street.nameZh}
            />
          ))}
        </ul>
      </section>

      <section id="apartment">
        <h2 className="mb-4 font-serif text-lg font-semibold">公寓楼</h2>
        <ApartmentPicker
          buildings={street.apartmentBuildings}
          canRent={canRent}
          canMoveApartment={canMoveApartment}
          residence={meResidence}
          streetName={street.nameZh}
          streetSlug={street.slug}
          username={session?.user?.username}
        />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-stone-600">
            各楼入住概况
          </summary>
          <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            {street.apartmentSummaries.map((b) => (
              <li key={b.id} className="text-stone-500">
                {b.buildingNumber} 号楼：{b.occupiedCount}/{b.totalUnits} 已入住
                {b.sampleUnitId && (
                  <>
                    {" "}
                    ·{" "}
                    <Link
                      href={`/apartment/${b.sampleUnitId}`}
                      className="text-accent hover:underline"
                    >
                      看房
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">本街动态</h2>
        <p className="mb-3 text-sm text-stone-500">
          本街短文、新开店与新入住，按时间聚合。
        </p>
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
          initialItems={feedItems}
          initialCursor={feedCursor}
          streetSlug={street.slug}
        />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">街道留言</h2>
        {session?.user && <StreetMessageForm streetId={street.id} />}
        <ul className="mt-4 space-y-3">
          {street.streetMessages.map((msg) => (
            <li
              key={msg.id}
              className="rounded border-l-2 border-accent bg-paper px-4 py-2"
            >
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
