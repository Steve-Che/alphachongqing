import Link from "next/link";
import { notFound } from "next/navigation";
import { getDistrictBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const district = await getDistrictBySlug(slug);
  if (!district) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{district.nameZh}</span>
      </nav>

      <header>
        <h1 className="font-serif text-3xl font-semibold">{district.nameZh}</h1>
        {district.summary && (
          <p className="mt-2 text-stone-600">{district.summary}</p>
        )}
      </header>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold">
          街道一览（{district.streets.length} 条）
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {district.streets.map((street) => (
            <li key={street.id}>
              <Link
                href={`/street/${street.slug}`}
                className="block rounded border border-stone-200 bg-paper p-4 transition-colors hover:border-accent"
              >
                <span className="font-medium text-stone-900">{street.nameZh}</span>
                {street.summary && (
                  <p className="mt-1 text-sm text-stone-500">{street.summary}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
