import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStreetBySlug } from "@/lib/queries";
import { StreetView } from "@/components/map/StreetView";
import { OpenShopForm } from "@/components/shop/OpenShopForm";
import { RentApartmentButton } from "@/components/shop/RentApartmentButton";
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

  const vacantSlots = street.shopSlots.filter((s) => s.status === "VACANT" && !s.isCenter);
  const firstVacantUnit = street.apartmentBuildings
    .flatMap((b) => b.units)
    .find((u) => !u.residentId);

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

      <header>
        <h1 className="font-serif text-3xl font-semibold">{street.nameZh}</h1>
        {street.summary && <p className="mt-2 text-stone-600">{street.summary}</p>}
      </header>

      <StreetView streetName={street.nameZh} slots={street.shopSlots} />

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">街边店铺</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {street.shopSlots
            .filter((s) => !s.isCenter)
            .map((slot) => (
              <li
                key={slot.id}
                className="rounded border border-stone-200 bg-paper p-3"
              >
                <span className="text-xs text-stone-400">
                  {slot.slotIndex + 1} 号铺
                </span>
                {slot.shop ? (
                  <div>
                    <Link
                      href={`/shop/${slot.shop.slug}`}
                      className="mt-1 block font-medium text-stone-900 hover:text-accent"
                    >
                      {slot.shop.name}
                    </Link>
                    <p className="text-xs text-stone-500">
                      店主：{slot.shop.owner.displayName ?? slot.shop.owner.username}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="mt-1 text-sm text-stone-500">招租中</p>
                    {session?.user && vacantSlots[0]?.id === slot.id && (
                      <OpenShopForm shopSlotId={slot.id} />
                    )}
                  </div>
                )}
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">公寓楼</h2>
        <p className="mb-3 text-sm text-stone-500">
          共 {street.apartmentBuildings.length} 栋楼，选一间入住你的单间。
        </p>
        {session?.user && firstVacantUnit && (
          <div className="rounded border border-dashed border-accent bg-paper p-4">
            <p className="text-sm text-stone-600">
              {firstVacantUnit.buildingId
                ? `可入住：${street.apartmentBuildings.find((b) => b.id === firstVacantUnit.buildingId)?.buildingNumber} 号楼 ${firstVacantUnit.unitNumber} 室`
                : "有空位可入住"}
            </p>
            <RentApartmentButton unitId={firstVacantUnit.id} />
          </div>
        )}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-stone-600">
            查看各楼入住情况
          </summary>
          <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            {street.apartmentBuildings.slice(0, 12).map((b) => {
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
            <p className="text-stone-500">街上还很安静。</p>
          )}
        </ul>
      </section>
    </div>
  );
}
