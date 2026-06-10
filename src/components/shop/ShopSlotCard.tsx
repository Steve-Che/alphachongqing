import Link from "next/link";
import { OpenShopForm } from "./OpenShopForm";

type ShopSlotCardProps = {
  slot: {
    id: string;
    slotIndex: number;
    status: string;
    shop?: {
      slug: string;
      name: string;
      owner: { username: string; displayName: string | null };
    } | null;
  };
  canOpenShop: boolean;
};

export function ShopSlotCard({ slot, canOpenShop }: ShopSlotCardProps) {
  const occupied = slot.status === "OCCUPIED" && slot.shop;

  return (
    <li
      className={`rounded border bg-paper p-3 transition-colors ${
        occupied
          ? "border-stone-200 hover:border-accent/60"
          : "border-dashed border-stone-300"
      }`}
    >
      <span className="text-xs text-stone-400">{slot.slotIndex + 1} 号铺</span>

      {occupied ? (
        <div>
          <Link
            href={`/shop/${slot.shop!.slug}`}
            className="mt-1 block font-medium text-stone-900 hover:text-accent"
          >
            {slot.shop!.name}
          </Link>
          <p className="text-xs text-stone-500">
            店主：{slot.shop!.owner.displayName ?? slot.shop!.owner.username}
          </p>
          <Link
            href={`/shop/${slot.shop!.slug}`}
            className="mt-2 inline-block text-xs text-accent hover:underline"
          >
            进店逛逛 →
          </Link>
        </div>
      ) : (
        <div>
          <p className="mt-1 text-sm text-stone-500">招租中</p>
          {canOpenShop && <OpenShopForm shopSlotId={slot.id} />}
        </div>
      )}
    </li>
  );
}
