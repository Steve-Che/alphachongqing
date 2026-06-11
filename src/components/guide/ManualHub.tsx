import Link from "next/link";
import { PERMISSION_MATRIX, ROUTE_INDEX } from "@/content/manual";
import type { ManualChapterMeta } from "@/content/manual/types";

type Props = {
  chapters: ManualChapterMeta[];
};

export function ManualHub({ chapters }: Props) {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold">街坊手册</h1>
        <p className="mt-3 text-stone-600 leading-relaxed">
          阿尔法重庆是一座虚拟山城社区：任何人可浏览地图与店铺；入驻、写作与社交需
          <Link href="/register" className="text-accent hover:underline">
            邀请码注册
          </Link>
          后登录。本手册覆盖平台全部功能，按章节查阅即可。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">权限矩阵</h2>
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-700">
              <tr>
                <th className="px-4 py-2 font-medium">范围</th>
                <th className="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-600">
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.path}>
                  <td className="px-4 py-2">{row.path}</td>
                  <td className="px-4 py-2">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-500">
          详见
          <Link href="/guide/overview" className="text-accent hover:underline">
            产品全貌
          </Link>
          章节。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">章节目录</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/guide/${chapter.slug}`}
              className="rounded-lg border border-stone-200 bg-paper p-4 transition hover:border-stone-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-stone-900">
                  {chapter.order}. {chapter.title}
                </h3>
                {chapter.adminOnly && (
                  <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
                    管理
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-stone-600">{chapter.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">全站路由索引</h2>
        <p className="text-sm text-stone-600">平台 24 个主要页面一览，便于跳转验证。</p>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {ROUTE_INDEX.map((route) => (
            <li key={route.path} className="text-stone-600">
              <code className="text-xs text-stone-500">{route.path}</code>
              <span className="mx-2 text-stone-300">—</span>
              {route.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
