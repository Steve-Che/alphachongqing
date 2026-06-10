import Link from "next/link";
import { auth } from "@/lib/auth";
import { ResidenceBanner } from "@/components/residence/ResidenceBanner";

export default async function GuidePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold">入驻指南</h1>
        <p className="mt-2 text-stone-600">
          阿尔法重庆致敬豆瓣阿尔法城：选区、选街、开店或入住，用文字和图片经营你的角落。
        </p>
      </header>

      {session?.user && <ResidenceBanner userId={session.user.id} />}

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">第一步：浏览城市</h2>
        <p className="text-stone-600">
          在<Link href="/" className="text-accent hover:underline">首页三维地图</Link>
          上点击六个彩色区域（渝中、江北、南岸等），或从下方列表进入。地图可拖动旋转、滚轮缩放。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">第二步：选择街道</h2>
        <p className="text-stone-600">
          每个区域有 8 条街道。进入街道后可看到两侧铺位与公寓楼的三维街景，以及详细的入驻列表。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">第三步：开店或选公寓</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-paper p-4">
            <h3 className="font-medium text-stone-900">开店</h3>
            <p className="mt-2 text-sm text-stone-600">
              在「招租中」的铺位填写店名即可开业。店铺有六个房间：前厅、左厢、右厢、正厅、后花园与留言板侧室。
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-paper p-4">
            <h3 className="font-medium text-stone-900">公寓</h3>
            <p className="mt-2 text-sm text-stone-600">
              选择楼栋与室号入住。公寓是简洁的单间，适合安静发短文、展示个人动态。
            </p>
          </div>
        </div>
        <p className="text-sm text-stone-500">
          每人限拥有一间店铺 <strong>或</strong> 一间公寓。更换需先在「我的主页」释放当前地盘。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">第四步：创作内容</h2>
        <ul className="list-inside list-disc space-y-2 text-stone-600">
          <li><Link href="/write/article" className="text-accent hover:underline">写长文</Link> — 轻博客式深度文章，可挂载到店铺房间</li>
          <li><Link href="/write/moment" className="text-accent hover:underline">发短文</Link> — 微博式短动态，可配图</li>
          <li>在街道留言、店铺留言板与访客互动</li>
        </ul>
      </section>

      <section className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <p>
          演示店铺：<Link href="/shop/shudong-coffee" className="text-accent hover:underline">树洞咖啡</Link>
          （解放碑大道）· 演示账号 demo@alphachongqing.local / demo1234
        </p>
      </section>
    </div>
  );
}
