"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ManualChapterMeta } from "@/content/manual/types";

type Props = {
  chapters: ManualChapterMeta[];
  children: React.ReactNode;
};

export function ManualLayout({ chapters, children }: Props) {
  const pathname = usePathname();
  const [tocOpen, setTocOpen] = useState(false);
  const isHub = pathname === "/guide";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/guide" className="hover:text-stone-800">
          街坊手册
        </Link>
        {!isHub && (
          <>
            <span className="mx-2">/</span>
            <span className="text-stone-700">
              {chapters.find((c) => pathname === `/guide/${c.slug}`)?.title ?? "章节"}
            </span>
          </>
        )}
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:w-56 lg:shrink-0">
          <button
            type="button"
            className="mb-3 w-full rounded-lg border border-stone-200 bg-paper px-3 py-2 text-left text-sm font-medium lg:hidden"
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
          >
            {tocOpen ? "收起目录" : "展开目录"}
          </button>
          <nav
            className={`rounded-lg border border-stone-200 bg-paper p-3 ${
              tocOpen ? "block" : "hidden lg:block"
            }`}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
              目录
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/guide"
                  className={`block rounded px-2 py-1.5 hover:bg-stone-100 ${
                    isHub ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600"
                  }`}
                >
                  手册首页
                </Link>
              </li>
              {chapters.map((chapter) => {
                const href = `/guide/${chapter.slug}`;
                const active = pathname === href;
                return (
                  <li key={chapter.slug}>
                    <Link
                      href={href}
                      className={`block rounded px-2 py-1.5 hover:bg-stone-100 ${
                        active ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600"
                      }`}
                    >
                      {chapter.order}. {chapter.title}
                      {chapter.adminOnly && (
                        <span className="ml-1 text-xs text-stone-400">管理</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
