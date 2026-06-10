import Link from "next/link";
import { notFound } from "next/navigation";
import { getDistrictBySlug } from "@/lib/queries";
import { DISTRICTS } from "@/lib/chongqing/geo";

export const dynamic = "force-dynamic";

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const district = await getDistrictBySlug(slug);
  if (!district) notFound();

  const geo = DISTRICTS.find((d) => d.slug === slug);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{district.nameZh}</span>
      </nav>

      <header className="rounded-lg border border-stone-200 bg-paper p-6">
        <h1 className="font-serif text-3xl font-semibold">{district.nameZh}</h1>
        {(district.summary || geo?.summary) && (
          <p className="mt-2 text-stone-600">{district.summary ?? geo?.summary}</p>
        )}
        <p className="mt-3 text-sm text-stone-500">
          {district.streets.length} 条街道 · 选择一条街道开店或入住
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">街道一览</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {district.streets.map((street) => {
            const occupied = street.shopSlots.filter((s) => s.status === "OCCUPIED").length;
            const total = street.shopSlots.filter((s) => !s.isCenter).length;

            return (
              <li key={street.id}>
                <Link
                  href={`/street/${street.slug}`}
                  className="block rounded border border-stone-200 bg-paper p-4 transition-colors hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-stone-900">{street.nameZh}</span>
                    <span className="shrink-0 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                      店铺 {occupied}/{total}
                    </span>
                  </div>
                  {street.summary && (
                    <p className="mt-1 text-sm text-stone-500">{street.summary}</p>
                  )}
                  <span className="mt-2 inline-block text-xs text-accent">
                    进入街道 →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
