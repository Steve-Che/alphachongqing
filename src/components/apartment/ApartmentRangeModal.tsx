"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBuildingUnitsForPicker } from "@/app/actions/shop";
import { RentApartmentButton } from "@/components/shop/RentApartmentButton";
import { MoveApartmentButton } from "@/components/shop/MoveApartmentButton";
import type { ApartmentRangeSummary } from "@/lib/street-types";
import type { MeResidence } from "@/lib/residence-types";
import { Button } from "@/components/ui/button";

type UnitRow = Awaited<ReturnType<typeof getBuildingUnitsForPicker>>[number];

type ApartmentRangeModalProps = {
  range: ApartmentRangeSummary | null;
  open: boolean;
  onClose: () => void;
  canRent: boolean;
  canMoveApartment: boolean;
  residence: MeResidence | null;
  streetName: string;
  streetSlug: string;
  username?: string;
};

export function ApartmentRangeModal({
  range,
  open,
  onClose,
  canRent,
  canMoveApartment,
  residence,
  streetName,
  streetSlug,
  username,
}: ApartmentRangeModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedBuildingId(null);
      setUnits([]);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setUnits([]);
      return;
    }
    setLoading(true);
    getBuildingUnitsForPicker(selectedBuildingId)
      .then(setUnits)
      .finally(() => setLoading(false));
  }, [selectedBuildingId]);

  if (!open || !range) return null;

  const vacantUnits = units.filter((u) => !u.residentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="apt-range-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-stone-200 bg-paper p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="apt-range-title" className="font-serif text-lg font-semibold">
              公寓楼 {range.label}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {range.occupiedUnits}/{range.totalUnits} 户已入住
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {range.buildings.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setSelectedBuildingId(b.id)}
                className={`w-full rounded border px-3 py-2 text-left text-sm transition ${
                  selectedBuildingId === b.id
                    ? "border-[#b84a2f] bg-amber-50"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <span className="font-medium">{b.buildingNumber} 号楼</span>
                <span className="mt-0.5 block text-xs text-stone-500">
                  {b.occupiedCount}/{b.totalUnits}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {selectedBuildingId && (
          <div className="mt-4 border-t border-stone-200 pt-4">
            <h3 className="text-sm font-medium text-stone-800">选择室号</h3>
            {loading ? (
              <p className="mt-2 text-sm text-stone-500">加载中…</p>
            ) : vacantUnits.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">该楼暂无空房</p>
            ) : (
              <ul className="mt-2 grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                {vacantUnits.map((u) => {
                  const building = range.buildings.find(
                    (b) => b.id === selectedBuildingId,
                  );
                  const targetLabel = building
                    ? `${building.buildingNumber} 号楼 ${u.unitNumber} 室`
                    : `${u.unitNumber} 室`;
                  const currentLabel = residence?.apartmentUnit
                    ? `${residence.apartmentUnit.streetName} · ${residence.apartmentUnit.buildingNumber} 号楼 ${residence.apartmentUnit.unitNumber} 室`
                    : "";

                  return (
                    <li key={u.id} className="text-center">
                      <span className="mb-1 block text-[10px] text-stone-500">
                        {u.unitNumber} 室
                      </span>
                      {canRent && (
                        <RentApartmentButton
                          unitId={u.id}
                          streetSlug={streetSlug}
                        />
                      )}
                      {canMoveApartment && residence?.apartmentUnit && (
                        <MoveApartmentButton
                          targetUnitId={u.id}
                          targetLabel={targetLabel}
                          currentLabel={currentLabel}
                          compact
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {units.some((u) => u.residentId) && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-stone-500">
                  已入住住户
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-stone-600">
                  {units
                    .filter((u) => u.residentId)
                    .slice(0, 20)
                    .map((u) => (
                      <li key={u.id}>
                        {u.unitNumber} 室 ·{" "}
                        <Link
                          href={`/apartment/${u.id}`}
                          className="text-[#b84a2f] hover:underline"
                        >
                          {u.resident?.displayName ?? u.resident?.username}
                        </Link>
                      </li>
                    ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
