export const APARTMENT_RANGE_SIZE = 10;

export type ApartmentRange = {
  start: number;
  end: number;
  label: string;
};

export function getApartmentRanges(
  buildingCount = 30,
  rangeSize = APARTMENT_RANGE_SIZE,
): ApartmentRange[] {
  const ranges: ApartmentRange[] = [];
  for (let start = 1; start <= buildingCount; start += rangeSize) {
    const end = Math.min(start + rangeSize - 1, buildingCount);
    ranges.push({ start, end, label: `${start}# – ${end}#` });
  }
  return ranges;
}

export function buildingInRange(
  buildingNumber: number,
  range: ApartmentRange,
): boolean {
  return buildingNumber >= range.start && buildingNumber <= range.end;
}
