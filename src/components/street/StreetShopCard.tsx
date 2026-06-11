import Link from "next/link";
import Image from "next/image";
import { ShopActivityBubble } from "@/components/street/ShopActivityBubble";
import { shopPath } from "@/lib/route-slug";
import type { StreetStripSlot } from "@/lib/street-types";

type StreetShopCardProps = {
  slot: StreetStripSlot;
};

export function StreetShopCard({ slot }: StreetShopCardProps) {
  const shop = slot.shop!;
  const displayNumber = slot.slotIndex + 1;

  return (
    <article className="relative shrink-0 snap-center">
      <ShopActivityBubble activity={slot.activity} />
      <Link
        href={shopPath(shop.slug)}
        className="group block w-[168px] overflow-hidden rounded-lg border border-stone-300 bg-[#faf6ee] shadow-sm transition hover:border-[#c45c3e]/50 hover:shadow-md sm:w-[188px]"
      >
        <div className="relative aspect-[4/3] bg-stone-200">
          {shop.coverUrl ? (
            <Image
              src={shop.coverUrl}
              alt={shop.name}
              fill
              className="object-cover"
              sizes="188px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 text-3xl text-stone-400">
              店
            </div>
          )}
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e07a3a] text-xs font-semibold text-white shadow">
            {displayNumber}
          </span>
        </div>
        <div className="border-t border-stone-200 px-3 py-2.5">
          <h3 className="truncate font-serif text-sm font-semibold text-stone-900 group-hover:text-[#b84a2f]">
            {shop.name}
          </h3>
          {shop.tagline ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-stone-500">
              {shop.tagline}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-stone-400">
              {shop.owner.displayName ?? shop.owner.username}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
