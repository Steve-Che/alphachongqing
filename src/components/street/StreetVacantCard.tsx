import { Home } from "lucide-react";
import { OpenShopForm } from "@/components/shop/OpenShopForm";
import { MoveShopButton } from "@/components/shop/MoveShopButton";

type StreetVacantCardProps = {
  slotId: string;
  slotIndex: number;
  canOpenShop: boolean;
  canMoveShop?: boolean;
  shopName?: string;
  currentStreetName?: string;
  targetStreetName?: string;
};

export function StreetVacantCard({
  slotId,
  slotIndex,
  canOpenShop,
  canMoveShop,
  shopName,
  currentStreetName,
  targetStreetName,
}: StreetVacantCardProps) {
  return (
    <article className="relative shrink-0 snap-center">
      <div className="flex w-[168px] flex-col overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-100/80 sm:w-[188px]">
        <div className="relative flex aspect-[4/3] flex-col items-center justify-center bg-stone-200/60 text-stone-400">
          <Home className="mb-1 h-8 w-8 opacity-60" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold tracking-wide text-stone-500">
            FOR RENT
          </span>
          <span className="text-xs font-medium text-stone-600">招租</span>
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-400 text-xs font-semibold text-white">
            {slotIndex + 1}
          </span>
        </div>
        <div className="border-t border-dashed border-stone-300 px-3 py-2.5">
          <p className="text-center text-xs text-stone-500">空铺等待新店主</p>
          {canOpenShop && (
            <div className="mt-2">
              <OpenShopForm shopSlotId={slotId} compact />
            </div>
          )}
          {canMoveShop && shopName && currentStreetName && targetStreetName && (
            <div className="mt-2">
              <MoveShopButton
                targetShopSlotId={slotId}
                targetStreetName={targetStreetName}
                shopName={shopName}
                currentStreetName={currentStreetName}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
