import type { MapDistrictData } from "@/components/map/CityCanvas";

export type DistrictStats = {
  occupiedShops: number;
  totalShops: number;
  occupiedApartments: number;
  totalApartments: number;
};

export function computeDistrictStats(
  district: Pick<MapDistrictData, "streets">,
): DistrictStats {
  let occupiedShops = 0;
  let totalShops = 0;
  let occupiedApartments = 0;
  let totalApartments = 0;

  for (const street of district.streets) {
    for (const slot of street.slots) {
      if (!slot.isCenter) {
        totalShops += 1;
        if (slot.status === "OCCUPIED") occupiedShops += 1;
      }
    }
    const apt = street.apartmentsSummary;
    if (apt) {
      occupiedApartments += apt.occupiedUnits;
      totalApartments += apt.totalUnits;
    }
  }

  return {
    occupiedShops,
    totalShops,
    occupiedApartments,
    totalApartments,
  };
}

export function formatDistrictStatsLine(stats: DistrictStats): string {
  return `店铺 ${stats.occupiedShops}/${stats.totalShops} · 公寓 ${stats.occupiedApartments}/${stats.totalApartments}`;
}

export function formatStreetStatsLine(
  street: MapDistrictData["streets"][number],
): string {
  const shops = street.slots.filter((s) => !s.isCenter);
  const occupied = shops.filter((s) => s.status === "OCCUPIED").length;
  const apt = street.apartmentsSummary;
  const aptOcc = apt?.occupiedUnits ?? 0;
  const aptTotal = apt?.totalUnits ?? 0;
  return `店 ${occupied}/${shops.length} 寓 ${aptOcc}/${aptTotal}`;
}
