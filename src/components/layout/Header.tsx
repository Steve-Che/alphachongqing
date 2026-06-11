import Link from "next/link";
import { HeaderUserNav } from "@/components/layout/HeaderUserNav";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-[#f7f4ef]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 font-serif text-lg font-semibold text-stone-900">
          阿尔法重庆
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">
            地图
          </Link>
          <Link href="/guide" className="hover:text-stone-900">
            街坊手册
          </Link>
          <HeaderUserNav />
        </nav>
      </div>
    </header>
  );
}
