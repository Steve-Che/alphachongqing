import Link from "next/link";
import { auth } from "@/lib/auth";
import { MapViewToggle } from "@/components/map/MapViewToggle";
import { DistrictList } from "@/components/map/DistrictList";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { HomeFeedPreview } from "@/components/feed/HomeFeedPreview";
import { WelcomeBanner } from "@/components/guide/WelcomeBanner";
import { computeDistrictStats } from "@/lib/chongqing/district-stats";
import { venueTypeLabel } from "@/lib/chongqing/public-venues";
import { getHomePageData, getFollowingFeed } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const session = await auth();
  const { districtList, mapData, stats, publicVenues } = await getHomePageData();
  const statsBySlug = Object.fromEntries(
    mapData.map((d) => [d.slug, computeDistrictStats(d)]),
  );

  const flagshipPreview = publicVenues
    .filter((v) => v.tier === "FLAGSHIP")
    .slice(0, 3);

  const feedPreview =
    session?.user?.id
      ? (await getFollowingFeed(session.user.id, 5)).items.map((p) => ({
          ...p,
          author: p.author,
        }))
      : [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          阿尔法重庆
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          一座虚拟的山城。在三维或平面地图上漫游，从城区下钻到街道与铺面，
          在地图上落脚，写下长文与短文，慢慢认识邻居。
        </p>
        <dl className="mt-4 flex flex-wrap gap-6 text-sm text-stone-500">
          <div>
            <dt className="inline">区域 </dt>
            <dd className="inline font-medium text-stone-800">{stats.districts}</dd>
          </div>
          <div>
            <dt className="inline">居民 </dt>
            <dd className="inline font-medium text-stone-800">{stats.residents}</dd>
          </div>
          <div>
            <dt className="inline">店铺 </dt>
            <dd className="inline font-medium text-stone-800">{stats.shops}</dd>
          </div>
          <div>
            <dt className="inline">文章 </dt>
            <dd className="inline font-medium text-stone-800">{stats.posts}</dd>
          </div>
          <div>
            <dt className="inline">公寓入住 </dt>
            <dd className="inline font-medium text-stone-800">{stats.apartmentResidents}</dd>
          </div>
        </dl>
      </section>

      {session?.user && (
        <>
          <WelcomeBanner />
          <ResidenceBanner userId={session.user.id} />
          <HomeFeedPreview userId={session.user.id} posts={feedPreview} />
          <p className="text-sm text-stone-600">
            <Link href="/search" className="text-accent hover:underline">搜索街坊</Link>
          </p>
        </>
      )}

      <section id="map">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/guide" className="text-sm text-accent hover:underline">
            如何入驻？
          </Link>
        </div>
        <MapViewToggle
          mapData={mapData}
          districtList={districtList}
          statsBySlug={statsBySlug}
          publicVenues={publicVenues}
        />
      </section>

      {flagshipPreview.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">城市公共区</h2>
            <Link href="/places" className="text-sm text-accent hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {flagshipPreview.map((v) => (
              <Link
                key={v.slug}
                href={`/place/${v.slug}`}
                className="rounded border border-stone-200 bg-paper p-4 hover:border-[#b84a2f]/40"
              >
                <span className="text-xs text-[#b84a2f]">
                  {venueTypeLabel(v.type)}
                </span>
                <h3 className="mt-1 font-serif font-semibold">{v.nameZh}</h3>
                {v.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                    {v.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">
          {stats.districts} 个核心区域
        </h2>
        <DistrictList districts={districtList} statsBySlug={statsBySlug} />
      </section>
    </div>
  );
}
