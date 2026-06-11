import Link from "next/link";
import { auth } from "@/lib/auth";
import { CityMapLoader } from "@/components/map/CityMapLoader";
import { DistrictList } from "@/components/map/DistrictList";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";
import { getHomePageData } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const session = await auth();
  const { districtList, mapData, stats } = await getHomePageData();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          阿尔法重庆
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          一座虚拟的山城。在三维地图上缩放漫游，从城区下钻到街道与铺面，
          选地盘开店或入住公寓，写下长文与短文——像古早互联网那样。
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
        <ResidenceBanner userId={session.user.id} />
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">三维城市地图</h2>
          <Link href="/guide" className="text-sm text-accent hover:underline">
            如何入驻？
          </Link>
        </div>
        <CityMapLoader districts={mapData} />
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">六个核心区域</h2>
        <DistrictList districts={districtList} />
      </section>
    </div>
  );
}
