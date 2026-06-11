"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBuildingUnitsForPicker } from "@/app/actions/shop";
import { RentApartmentButton } from "./RentApartmentButton";

type BuildingSummary = {
  id: string;
  buildingNumber: number;
  vacantCount: number;
  totalUnits: number;
};

type Unit = {
  id: string;
  unitNumber: number;
  residentId: string | null;
  resident?: { username: string; displayName: string | null } | null;
};

export function ApartmentPicker({
  buildings,
  canRent,
  username,
}: {
  buildings: BuildingSummary[];
  canRent: boolean;
  username?: string;
}) {
  const [buildingId, setBuildingId] = useState(buildings[0]?.id ?? "");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const building = buildings.find((b) => b.id === buildingId);
  const vacantUnits = units.filter((u) => !u.residentId);
  const occupiedUnits = units.filter((u) => u.residentId);
  const [unitId, setUnitId] = useState("");

  useEffect(() => {
    if (!buildingId) return;
    let cancelled = false;
    setLoading(true);
    getBuildingUnitsForPicker(buildingId).then((data) => {
      if (cancelled) return;
      setUnits(data);
      const first = data.find((u) => !u.residentId);
      setUnitId(first?.id ?? "");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  if (!canRent) {
    return (
      <p className="text-sm text-stone-500">
        你已拥有店铺或公寓，如需更换请先在
        <a href={username ? `/u/${username}` : "/"} className="text-accent"> 我的主页 </a>
        释放当前地盘。
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-accent bg-paper p-4">
      <p className="text-sm font-medium text-stone-800">选择公寓入住</p>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-stone-600">
          楼栋
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="ml-2 rounded border border-stone-300 px-2 py-1"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.buildingNumber} 号楼（空位 {b.vacantCount}）
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-stone-600">
          室号
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="ml-2 rounded border border-stone-300 px-2 py-1"
            disabled={loading}
          >
            {loading ? (
              <option value="">加载中…</option>
            ) : vacantUnits.length === 0 ? (
              <option value="">已满</option>
            ) : (
              vacantUnits.slice(0, 50).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unitNumber} 室
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {unitId && <RentApartmentButton unitId={unitId} />}

      {occupiedUnits.length > 0 && (
        <ul className="space-y-1 border-t border-stone-200 pt-3 text-sm text-stone-600">
          <li className="text-xs text-stone-400">本楼已入住（可参观）</li>
          {occupiedUnits.slice(0, 8).map((u) => (
            <li key={u.id}>
              <Link href={`/apartment/${u.id}`} className="text-accent hover:underline">
                {u.unitNumber} 室 · {u.resident?.displayName ?? u.resident?.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
