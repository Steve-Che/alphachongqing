"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { encodeRouteSlug } from "@/lib/route-slug";
import type { MeResidence } from "@/lib/residence-types";
import { getBuildingUnitsForPicker } from "@/app/actions/shop";
import { RentApartmentButton } from "@/components/shop/RentApartmentButton";
import { MoveApartmentButton } from "@/components/shop/MoveApartmentButton";
import type { ApartmentBuildingData } from "./ApartmentTowers";

export function ApartmentRentPanel({
  building,
  streetSlug,
  streetName,
  isLoggedIn,
  canRent,
  residence,
}: {
  building: ApartmentBuildingData;
  streetSlug: string;
  streetName?: string;
  isLoggedIn?: boolean;
  canRent?: boolean;
  residence?: MeResidence | null;
}) {
  const [vacantUnitId, setVacantUnitId] = useState<string | null>(null);
  const [vacantUnitNumber, setVacantUnitNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const hasVacancy = building.occupiedCount < building.totalUnits;
  const hasResidents = building.occupiedCount > 0;
  const canMoveApartment =
    isLoggedIn && residence?.type === "APARTMENT" && residence.apartmentUnit;
  const shouldLoadVacant = hasVacancy && (canRent || canMoveApartment);
  const targetStreetName = streetName ?? streetSlug;

  useEffect(() => {
    if (!shouldLoadVacant) {
      setVacantUnitId(null);
      setVacantUnitNumber(null);
      return;
    }
    setLoading(true);
    getBuildingUnitsForPicker(building.id)
      .then((units) => {
        const vacant = units.find((u) => !u.residentId);
        setVacantUnitId(vacant?.id ?? null);
        setVacantUnitNumber(vacant?.unitNumber ?? null);
      })
      .finally(() => setLoading(false));
  }, [building.id, shouldLoadVacant]);

  const targetLabel =
    vacantUnitNumber != null
      ? `${targetStreetName} · ${building.buildingNumber} 号楼 ${vacantUnitNumber} 室`
      : `${targetStreetName} · ${building.buildingNumber} 号楼`;

  const currentLabel = canMoveApartment
    ? `${residence!.apartmentUnit!.streetName} · ${residence!.apartmentUnit!.buildingNumber} 号楼 ${residence!.apartmentUnit!.unitNumber} 室`
    : "";

  return (
    <div className="space-y-3">
      {hasResidents && building.sampleUnitId && (
        <Link
          href={`/apartment/${building.sampleUnitId}`}
          className="inline-block rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          查看住户 →
        </Link>
      )}

      {hasVacancy ? (
        isLoggedIn && canRent ? (
          loading ? (
            <p className="text-sm text-stone-500">正在查找空房…</p>
          ) : vacantUnitId ? (
            <RentApartmentButton unitId={vacantUnitId} streetSlug={streetSlug} />
          ) : (
            <p className="text-sm text-stone-600">此楼暂无空房。</p>
          )
        ) : isLoggedIn && canMoveApartment ? (
          loading ? (
            <p className="text-sm text-stone-500">正在查找空房…</p>
          ) : vacantUnitId ? (
            <MoveApartmentButton
              targetUnitId={vacantUnitId}
              targetLabel={targetLabel}
              currentLabel={currentLabel}
              compact
            />
          ) : (
            <p className="text-sm text-stone-600">此楼暂无空房。</p>
          )
        ) : isLoggedIn ? (
          <p className="text-sm text-stone-600">
            你已有店铺。店铺与公寓不可互换，请先在主页释放后再入住。
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            <Link
              href={`/login?callbackUrl=/street/${encodeRouteSlug(streetSlug)}`}
              className="text-accent hover:underline"
            >
              登录
            </Link>
            后即可选此楼入住
          </p>
        )
      ) : (
        <p className="text-sm text-stone-600">此楼已满员。</p>
      )}
    </div>
  );
}
