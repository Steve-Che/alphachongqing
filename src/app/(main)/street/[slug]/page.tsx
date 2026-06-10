import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStreetBySlug, getUserResidence } from "@/lib/queries";
import { StreetView } from "@/components/map/StreetView";
import { ShopSlotCard } from "@/components/shop/ShopSlotCard";
import { ApartmentPicker } from "@/components/shop/ApartmentPicker";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { StreetMessageForm } from "@/components/street/StreetMessageForm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StreetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [street, session] = await Promise.all([
    getStreetBySlug(slug),
    auth(),
  ]);
  if (!street) notFound();

  const residence = session?.user?.id
    ? await getUserResidence(session.user.id)
    : null;
  const canSettle = !!session?.user && !residence?.shop && !residence?.apartmentUnit;

  const shopSlots = street.shopSlots.filter((s) => !s.isCenter);
  const occupiedShops = shopSlots.filter((s) => s.status === "OCCUPIED").length;

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
          已开业 {occupiedShops}/{shopSlots.length} 家店铺 · {street.apartmentBuildings.length} 栋公寓楼
        </p>
      </header>

      {session?.user && <ResidenceBanner userId={session.user.id} />}

      <section>
        <h2 className="mb-2 font-serif text-lg font-semibold">街景</h2>
        <p className="mb-3 text-xs text-stone-500">金色为已开业，灰色为招租中</p>
        <StreetView streetName={street.nameZh} slots={street.shopSlots} />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">街边店铺</h2>
        {!session?.user && (
          <p className="mb-4 text-sm text-stone-500">
            <Link href="/login" className="text-accent hover:underline">登录</Link>
            后可在此开店
          </p>
        )}
        {session?.user && !canSettle && (
          <p className="mb-4 text-sm text-amber-800">
            你已有地盘。如需在本街开店，请先在
            <Link href={`/u/${session.user.username}`} className="text-accent hover:underline">
              我的主页
            </Link>
            释放当前店铺或公寓。
          </p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopSlots.map((slot) => (
            <ShopSlotCard
              key={slot.id}
              slot={slot}
              canOpenShop={canSettle}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">公寓楼</h2>
        <ApartmentPicker
          buildings={street.apartmentBuildings}
          canRent={canSettle}
          username={session?.user?.username}
        />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-stone-600">
            各楼入住概况
          </summary>
          <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            {street.apartmentBuildings.map((b) => {
              const occupied = b.units.filter((u) => u.residentId).length;
              return (
                <li key={b.id} className="text-stone-500">
                  {b.buildingNumber} 号楼：{occupied}/{b.units.length} 已入住
                </li>
              );
            })}
          </ul>
        </details>
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
              <p className="text-stone-800">{msg.content}</p>
              <p className="mt-1 text-xs text-stone-400">
                {msg.author.displayName ?? msg.author.username} · {formatDate(msg.createdAt)}
              </p>
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
