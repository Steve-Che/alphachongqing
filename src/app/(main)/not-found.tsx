import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-4xl font-semibold text-stone-800">404</h1>
      <p className="mt-3 text-stone-600">这条街巷似乎还没有开通。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/" className="text-accent hover:underline">
          回到城市地图
        </Link>
        <Link href="/guide" className="text-accent hover:underline">
          入驻指南
        </Link>
      </div>
    </div>
  );
}
