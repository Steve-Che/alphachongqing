import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getApartmentUnit, getUserResidence } from "@/lib/queries";
import { PostList } from "@/components/feed/PostList";
import { RentApartmentButton } from "@/components/shop/RentApartmentButton";
import { MoveApartmentButton } from "@/components/shop/MoveApartmentButton";
import { buildMeResidence } from "@/lib/residence-types";
import { prisma } from "@/lib/db";
import { encodeRouteSlug } from "@/lib/route-slug";

export const revalidate = 60;

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [unit, session] = await Promise.all([
    getApartmentUnit(id),
    auth(),
  ]);
  if (!unit) notFound();

  const street = unit.building.street;
  const district = street.district;
  const residence = session?.user?.id
    ? await getUserResidence(session.user.id)
    : null;
  const meResidence = residence ? buildMeResidence(residence) : null;
  const canRent = !!session?.user && !meResidence?.type;
  const canMoveApartment =
    !!session?.user && meResidence?.type === "APARTMENT" && !unit.resident;
  const targetLabel = `${street.nameZh} · ${unit.building.buildingNumber} 号楼 ${unit.unitNumber} 室`;
  const currentLabel = meResidence?.apartmentUnit
    ? `${meResidence.apartmentUnit.streetName} · ${meResidence.apartmentUnit.buildingNumber} 号楼 ${meResidence.apartmentUnit.unitNumber} 室`
    : "";

  const posts = unit.resident
    ? await prisma.post.findMany({
        where: { authorId: unit.resident.id, published: true },
        orderBy: { createdAt: "desc" },
        include: { images: true, street: { select: { nameZh: true, slug: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
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
        <span className="text-stone-800">
          {unit.building.buildingNumber} 号楼 {unit.unitNumber} 室
        </span>
      </nav>

      <header className="rounded border border-stone-200 bg-paper p-6">
        <h1 className="font-serif text-2xl font-semibold">
          {unit.building.buildingNumber} 号楼 · {unit.unitNumber} 室
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {street.nameZh}，{district.nameZh}
        </p>
        {unit.resident ? (
          <p className="mt-4">
            住户：
            <Link
              href={`/u/${unit.resident.username}`}
              className="ml-1 text-accent hover:underline"
            >
              {unit.resident.displayName ?? unit.resident.username}
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-stone-600">此间空置，欢迎入住。</p>
            {canRent ? (
              <RentApartmentButton unitId={unit.id} streetSlug={street.slug} />
            ) : canMoveApartment && currentLabel ? (
              <MoveApartmentButton
                targetUnitId={unit.id}
                targetLabel={targetLabel}
                currentLabel={currentLabel}
              />
            ) : session?.user && meResidence?.type === "SHOP" ? (
              <p className="text-sm text-stone-500">
                你已有店铺。店铺与公寓不可互换，请先在主页释放后再入住。
              </p>
            ) : session?.user ? (
              <p className="text-sm text-stone-500">
                你已有地盘。可在
                <Link href="/#map" className="text-accent hover:underline">
                  城市地图
                </Link>
                或街道页选择空房搬家。
              </p>
            ) : (
              <p className="text-sm text-stone-500">
                <Link href="/login" className="text-accent hover:underline">登录</Link>
                后可选此间入住
              </p>
            )}
            <Link
              href={`/street/${encodeRouteSlug(street.slug)}#apartment`}
              className="inline-block text-sm text-accent hover:underline"
            >
              去街道页选其他室号 →
            </Link>
          </div>
        )}
      </header>

      {unit.resident && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold">住户的动态</h2>
          <PostList posts={posts} />
        </section>
      )}

      <p className="text-sm text-stone-400">
        公寓是简洁的单间——一个头像、一处选位、一片属于自己的安静角落。
      </p>
    </div>
  );
}
