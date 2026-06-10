import { CityMapLoader } from "@/components/map/CityMapLoader";
import { DistrictList } from "@/components/map/DistrictList";
import { getCityStats, getDistricts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [districts, stats] = await Promise.all([
    getDistricts(),
    getCityStats(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          阿尔法重庆
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          一座虚拟的山城。在三维地图上浏览六个核心区域，选一条街道开店或入住公寓，
          写下长文与短文——这里没有短视频，只有文字与图片，像古早互联网那样。
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
        </dl>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">三维城市地图</h2>
        <CityMapLoader />
        <p className="mt-2 text-xs text-stone-400">
          点击区域进入详情。移动端可点击下方列表浏览。
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">六个核心区域</h2>
        <DistrictList districts={districts} />
      </section>
    </div>
  );
}
