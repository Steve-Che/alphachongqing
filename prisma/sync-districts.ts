/**
 * 增量同步 geo.ts 中缺失的城区（街道、铺位、公寓），不删除已有数据。
 * 部署时由 vercel buildCommand 调用。
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";
import { DISTRICTS, STREET_NAMES } from "../src/lib/chongqing/geo";

const BATCH_SIZE = 5000;
const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function createManyInBatches<T extends Record<string, unknown>>(
  items: T[],
  run: (chunk: T[]) => Promise<unknown>,
) {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    await run(items.slice(i, i + BATCH_SIZE));
  }
}

async function provisionDistrictStructure(districtId: string, slug: string) {
  const names = STREET_NAMES[slug] ?? [];
  if (names.length === 0) return;

  const streetRows = names.map((nameZh, si) => ({
    slug: `${slug}-${nameZh.replace(/[^\w\u4e00-\u9fff]/g, "-").toLowerCase()}`,
    nameZh,
    districtId,
    sortOrder: si,
    summary: `${slug}的${nameZh}`,
  }));

  await prisma.street.createMany({ data: streetRows, skipDuplicates: true });

  const streets = await prisma.street.findMany({
    where: { districtId },
    select: { id: true },
  });

  const shopSlotRows = streets.flatMap((street) =>
    Array.from({ length: 15 }, (_, i) => ({
      streetId: street.id,
      slotIndex: i,
      isCenter: i === 14,
      status: "VACANT" as const,
    })),
  );
  await createManyInBatches(shopSlotRows, (chunk) =>
    prisma.shopSlot.createMany({ data: chunk, skipDuplicates: true }),
  );

  const buildingRows = streets.flatMap((street) =>
    Array.from({ length: 30 }, (_, i) => ({
      streetId: street.id,
      buildingNumber: i + 1,
    })),
  );
  await createManyInBatches(buildingRows, (chunk) =>
    prisma.apartmentBuilding.createMany({ data: chunk, skipDuplicates: true }),
  );

  const buildings = await prisma.apartmentBuilding.findMany({
    where: { street: { districtId } },
    select: { id: true },
  });

  const unitRows = buildings.flatMap((building) =>
    Array.from({ length: 50 }, (_, i) => ({
      buildingId: building.id,
      unitNumber: i + 1,
    })),
  );
  await createManyInBatches(unitRows, (chunk) =>
    prisma.apartmentUnit.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function main() {
  const existing = await prisma.district.findMany({ select: { slug: true } });
  const existingSet = new Set(existing.map((d) => d.slug));

  const missing = DISTRICTS.filter((d) => !existingSet.has(d.slug));
  if (missing.length === 0) {
    console.log("sync-districts: 城区已齐全，无需同步");
    return;
  }

  for (const d of missing) {
    console.log(`sync-districts: 新增 ${d.nameZh}…`);
    const district = await prisma.district.create({
      data: {
        slug: d.slug,
        nameZh: d.nameZh,
        summary: d.summary,
        mapX: d.center.x,
        mapZ: d.center.z,
        elevation: d.elevation,
        color: d.color,
        boundaryPolygon: d.boundary,
      },
    });
    await provisionDistrictStructure(district.id, d.slug);
  }

  console.log(`sync-districts: 已同步 ${missing.length} 个城区`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
