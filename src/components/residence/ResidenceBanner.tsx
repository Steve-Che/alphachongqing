import Link from "next/link";
import { getUserResidence } from "@/lib/queries";

export async function ResidenceBanner({ userId }: { userId: string }) {
  const residence = await getUserResidence(userId);
  if (!residence) return null;

  if (residence.shop) {
    const street = residence.shop.shopSlot.street;
    return (
      <div className="rounded-lg border border-accent/40 bg-paper px-4 py-3">
        <p className="text-xs text-stone-500">我的地盘 · 店铺</p>
        <p className="font-medium text-stone-900">
          <Link href={`/shop/${residence.shop.slug}`} className="hover:text-accent">
            {residence.shop.name}
          </Link>
          <span className="text-stone-500">
            {" "}
            · {street.nameZh}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link href={`/shop/${residence.shop.slug}`} className="text-accent hover:underline">
            管理店铺
          </Link>
          <Link href="/write/article" className="text-stone-600 hover:underline">
            写长文
          </Link>
          <Link href="/feed" className="text-stone-600 hover:underline">
            街坊动态
          </Link>
        </div>
      </div>
    );
  }

  if (residence.apartmentUnit) {
    const { building } = residence.apartmentUnit;
    const street = building.street;
    return (
      <div className="rounded-lg border border-accent/40 bg-paper px-4 py-3">
        <p className="text-xs text-stone-500">我的地盘 · 公寓</p>
        <p className="font-medium text-stone-900">
          {street.nameZh} · {building.buildingNumber} 号楼 {residence.apartmentUnit.unitNumber} 室
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/apartment/${residence.apartmentUnit.id}`}
            className="text-accent hover:underline"
          >
            我的公寓
          </Link>
          <Link href="/write/moment" className="text-stone-600 hover:underline">
            发短文
          </Link>
          <Link href="/feed" className="text-stone-600 hover:underline">
            街坊动态
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-accent bg-amber-50/50 px-4 py-3">
      <p className="font-medium text-stone-800">你还没有地盘</p>
      <p className="mt-1 text-sm text-stone-600">
        在地图上选一个区域 → 进入街道 → 开店或选公寓入住。每人限拥有一间店铺或一间公寓。
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <Link
          href="/#map"
          className="rounded bg-stone-800 px-3 py-1.5 text-white hover:bg-stone-700"
        >
          在地图上选街道
        </Link>
        <Link href="/guide" className="text-accent hover:underline">
          查看入驻指南 →
        </Link>
      </div>
    </div>
  );
}
