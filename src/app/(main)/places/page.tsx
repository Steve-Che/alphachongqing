import Link from "next/link";
import { getPublicVenues } from "@/lib/queries";
import { venueTypeLabel } from "@/lib/chongqing/public-venues";
import { DISTRICTS } from "@/lib/chongqing/geo";

export const revalidate = 60;

export default async function PlacesPage() {
  const venues = await getPublicVenues();
  const flagship = venues.filter((v) => v.tier === "FLAGSHIP");
  const community = venues.filter((v) => v.tier === "COMMUNITY");

  const communityByDistrict = DISTRICTS.map((d) => ({
    district: d,
    venue: community.find((v) => v.districtSlug === d.slug),
  })).filter((g) => g.venue);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          城市地图
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">公共区</span>
      </nav>

      <header>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          城市公共区
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          图书馆、音乐厅、美术馆与城市广场——不占用店铺席位的公共场馆。
          每区还有一座社区馆，连接本区街坊与城心资源。
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">城心旗舰</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flagship.map((v) => (
            <Link
              key={v.slug}
              href={`/place/${v.slug}`}
              className="rounded border border-stone-200 bg-paper p-5 hover:border-[#b84a2f]/40 hover:shadow-sm"
            >
              <span className="text-xs font-medium text-[#b84a2f]">
                {venueTypeLabel(v.type)}
              </span>
              <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">
                {v.nameZh}
              </h3>
              {v.summary && (
                <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                  {v.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">各区社区馆</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communityByDistrict.map(({ district, venue }) => (
            <Link
              key={venue!.slug}
              href={`/place/${venue!.slug}`}
              className="rounded border border-stone-200 bg-paper p-4 hover:border-stone-400"
            >
              <p className="text-xs text-stone-500">{district.nameZh}</p>
              <h3 className="font-serif font-semibold text-stone-900">
                {venue!.nameZh}
              </h3>
              {venue!.summary && (
                <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                  {venue!.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
