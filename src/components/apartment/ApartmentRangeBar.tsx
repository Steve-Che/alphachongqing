"use client";

import Link from "next/link";
import { useState } from "react";
import { ApartmentRangeModal } from "@/components/apartment/ApartmentRangeModal";
import type { ApartmentRangeSummary } from "@/lib/street-types";
import type { MeResidence } from "@/lib/residence-types";

type ApartmentRangeBarProps = {
  ranges: ApartmentRangeSummary[];
  canRent: boolean;
  canMoveApartment: boolean;
  residence: MeResidence | null;
  streetName: string;
  streetSlug: string;
  username?: string;
};

export function ApartmentRangeBar({
  ranges,
  canRent,
  canMoveApartment,
  residence,
  streetName,
  streetSlug,
  username,
}: ApartmentRangeBarProps) {
  const [selected, setSelected] = useState<ApartmentRangeSummary | null>(null);
  const isLoggedIn = !!username;
  const hasShopResidence = residence?.type === "SHOP";

  return (
    <>
      <section className="rounded-lg border border-stone-300 bg-[#f0ebe3] p-3">
        <h2 className="mb-2 text-center font-serif text-sm font-semibold text-stone-800">
          公寓楼
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {ranges.map((range) => {
            const pct =
              range.totalUnits > 0
                ? Math.round((range.occupiedUnits / range.totalUnits) * 100)
                : 0;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => setSelected(range)}
                className="min-w-[100px] rounded border border-stone-300 bg-[#faf6ee] px-3 py-2 text-center text-xs shadow-sm transition hover:border-[#b84a2f]/50 hover:bg-white"
              >
                <span className="block font-semibold text-stone-800">
                  {range.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-stone-500">
                  入住 {pct}%
                </span>
              </button>
            );
          })}
        </div>
        {!isLoggedIn && (
          <p className="mt-2 text-center text-[11px] text-stone-500">
            <Link href="/login" className="text-[#b84a2f] hover:underline">
              登录
            </Link>
            后可查看空房并入住
          </p>
        )}
        {isLoggedIn && hasShopResidence && (
          <p className="mt-2 text-center text-[11px] text-stone-500">
            您已有店铺，暂不可入住公寓。点击上方楼栋可查看空房与住户。
          </p>
        )}
        {isLoggedIn && canMoveApartment && (
          <p className="mt-2 text-center text-[11px] text-stone-500">
            点击楼栋选择空房，可搬迁至本街
          </p>
        )}
        {isLoggedIn && canRent && (
          <p className="mt-2 text-center text-[11px] text-stone-500">
            点击楼栋选择室号即可入住
          </p>
        )}
      </section>

      <ApartmentRangeModal
        range={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        canRent={canRent}
        canMoveApartment={canMoveApartment}
        residence={residence}
        streetName={streetName}
        streetSlug={streetSlug}
        username={username}
      />
    </>
  );
}
