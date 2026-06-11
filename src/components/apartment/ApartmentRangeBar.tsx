"use client";

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
        {!canRent && !canMoveApartment && (
          <p className="mt-2 text-center text-[11px] text-stone-500">
            登录后可查看空房并入住
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
