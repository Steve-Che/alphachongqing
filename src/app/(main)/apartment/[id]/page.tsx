import Link from "next/link";
import { notFound } from "next/navigation";
import { getApartmentUnit } from "@/lib/queries";
import { PostList } from "@/components/feed/PostList";
import { prisma } from "@/lib/db";
import { encodeRouteSlug } from "@/lib/route-slug";

export const revalidate = 60;

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = await getApartmentUnit(id);
  if (!unit) notFound();

  const street = unit.building.street;
  const district = street.district;
  const posts = unit.resident
    ? await prisma.post.findMany({
        where: { authorId: unit.resident.id, published: true },
        orderBy: { createdAt: "desc" },
        include: { images: true },
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
          <p className="mt-4 text-stone-500">此间空置，招租中。</p>
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
