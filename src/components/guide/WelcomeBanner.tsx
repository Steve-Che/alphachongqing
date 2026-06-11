import Link from "next/link";

export function WelcomeBanner() {
  return (
    <div className="rounded-lg border border-accent/40 bg-amber-50/60 p-5">
      <h2 className="font-serif text-lg font-semibold">欢迎成为新街坊！</h2>
      <p className="mt-2 text-sm text-stone-600">按下面步骤完成你的第一次入驻与互动：</p>
      <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-stone-700">
        <li>
          在<Link href="/" className="text-accent hover:underline"> 城市地图 </Link>
          选一个区域与街道
        </li>
        <li>开店或选公寓入住（每人限一处地盘）</li>
        <li>
          <Link href="/write/moment" className="text-accent hover:underline">发一条短文</Link>
          ，或去
          <Link href="/feed" className="text-accent hover:underline"> 街坊动态 </Link>
          关注邻居
        </li>
      </ol>
    </div>
  );
}
