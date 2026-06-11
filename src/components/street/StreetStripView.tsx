"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreetCenterPlazaCard } from "@/components/street/StreetCenterPlazaCard";
import { StreetShopCard } from "@/components/street/StreetShopCard";
import { StreetVacantCard } from "@/components/street/StreetVacantCard";
import type { StreetStripSlot } from "@/lib/street-types";

type StreetStripViewProps = {
  streetName: string;
  streetSlug: string;
  slots: StreetStripSlot[];
  canOpenShop: boolean;
  canMoveShop?: boolean;
  shopName?: string;
  currentStreetName?: string;
  targetStreetName?: string;
};

export function StreetStripView({
  streetName,
  streetSlug,
  slots,
  canOpenShop,
  canMoveShop,
  shopName,
  currentStreetName,
  targetStreetName,
}: StreetStripViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slotsState, setSlotsState] = useState(slots);

  useEffect(() => {
    setSlotsState(slots);
  }, [slots]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/street/${encodeURIComponent(streetSlug)}/activity`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          shopActivities: Record<string, StreetStripSlot["activity"]>;
        };
        setSlotsState((prev) =>
          prev.map((slot) => {
            if (!slot.shop) return slot;
            const activity = data.shopActivities[slot.shop.id];
            return activity !== undefined ? { ...slot, activity } : slot;
          }),
        );
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [streetSlug]);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: "smooth" });
  }, []);

  const orderedSlots = [...slotsState].sort((a, b) => a.slotIndex - b.slotIndex);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-[#f7f4ef]/95 text-stone-600 shadow hover:bg-white"
        aria-label="向左浏览街道"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-[#f7f4ef]/95 text-stone-600 shadow hover:bg-white"
        aria-label="向右浏览街道"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className="street-strip-scroll mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pt-10 scroll-smooth"
        style={{
          backgroundImage:
            "linear-gradient(#f7f4ef 1px, transparent 1px), linear-gradient(90deg, #f7f4ef 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#faf6ee",
        }}
      >
        {orderedSlots.map((slot) => {
          if (slot.isCenter) {
            return (
              <StreetCenterPlazaCard
                key={slot.id}
                streetName={streetName}
                streetSlug={streetSlug}
              />
            );
          }

          if (slot.status === "OCCUPIED" && slot.shop) {
            return <StreetShopCard key={slot.id} slot={slot} />;
          }

          return (
            <StreetVacantCard
              key={slot.id}
              slotId={slot.id}
              slotIndex={slot.slotIndex}
              canOpenShop={canOpenShop}
              canMoveShop={canMoveShop}
              shopName={shopName}
              currentStreetName={currentStreetName}
              targetStreetName={targetStreetName}
            />
          );
        })}
      </div>
    </div>
  );
}
