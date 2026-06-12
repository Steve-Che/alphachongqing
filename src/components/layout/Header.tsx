import Link from "next/link";
import { RetroIconBar } from "@/components/layout/RetroIconBar";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-[#f7f4ef]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <Link
            href="/"
            className="font-serif text-lg font-semibold text-stone-900"
          >
            阿尔法重庆
          </Link>
          <Link
            href="/"
            className="hidden rounded-full border border-stone-300 px-2.5 py-1 text-xs text-stone-600 hover:bg-white sm:inline-block"
          >
            地图
          </Link>
          <Link
            href="/guide"
            className="hidden text-xs text-stone-600 hover:text-stone-900 sm:inline-block"
          >
            街坊手册
          </Link>
          <Link
            href="/places"
            className="hidden text-xs text-stone-600 hover:text-stone-900 sm:inline-block"
          >
            公共区
          </Link>
        </div>
        <div id="street-context-slot" className="min-w-0 flex-1 px-2" />
        <RetroIconBar />
      </div>
    </header>
  );
}
