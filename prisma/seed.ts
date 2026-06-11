import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { getDatabaseUrl } from "../src/lib/database-url";
import {
  DISTRICTS,
  STREET_NAMES,
  DEFAULT_ROOM_NAMES,
  ROOM_ORDER,
} from "../src/lib/chongqing/geo";
import type { RoomType } from "../src/generated/prisma/client";

const BATCH_SIZE = 5000;
const SEED_ADMIN_EMAIL = "admin@alphachongqing.local";
const SEED_DEMO_EMAIL = "demo@alphachongqing.local";
const SEED_APT_EMAIL = "apt@alphachongqing.local";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function createManyInBatches<T extends Record<string, unknown>>(
  label: string,
  items: T[],
  run: (chunk: T[]) => Promise<unknown>,
) {
  const total = items.length;
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    await run(chunk);
    const done = Math.min(i + BATCH_SIZE, total);
    if (total > BATCH_SIZE) {
      console.log(`   ${label}: ${done}/${total}`);
    }
  }
}

async function clearCityData() {
  await prisma.apartmentUnit.updateMany({ data: { residentId: null } });
  await prisma.user.updateMany({ data: { residenceType: null } });

  await prisma.roomContent.deleteMany();
  await prisma.guestbookEntry.deleteMany();
  await prisma.imageAsset.deleteMany();
  await prisma.post.deleteMany();
  await prisma.shopRoom.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.shopSlot.deleteMany();
  await prisma.apartmentUnit.deleteMany();
  await prisma.apartmentBuilding.deleteMany();
  await prisma.streetMessage.deleteMany();
  await prisma.street.deleteMany();
  await prisma.district.deleteMany();
  await prisma.inviteCode.deleteMany();
}

async function ensureSeedUsers() {
  await prisma.user.deleteMany({
    where: {
      email: { in: [SEED_ADMIN_EMAIL, SEED_DEMO_EMAIL, SEED_APT_EMAIL] },
    },
  });

  const [adminHash, demoHash, aptHash] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("demo1234", 10),
    bcrypt.hash("apt1234", 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: SEED_ADMIN_EMAIL,
      username: "admin",
      passwordHash: adminHash,
      displayName: "城主",
      role: "ADMIN",
      bio: "阿尔法重庆管理员",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: SEED_DEMO_EMAIL,
      username: "demo",
      passwordHash: demoHash,
      displayName: "演示居民",
      bio: "一家小店的店主，喜欢在街上闲逛。",
    },
  });

  const aptUser = await prisma.user.create({
    data: {
      email: SEED_APT_EMAIL,
      username: "lanjing",
      passwordHash: aptHash,
      displayName: "蓝静",
      bio: "住在洪崖洞巷公寓，爱发短文。",
    },
  });

  return { admin, demoUser, aptUser };
}

async function seedInviteCodes(adminId: string) {
  const codes = [
    "ALPHA2026",
    "CHONGQING",
    "YUZHONG01",
    "JIANGbei2",
    "NANAN003",
    "SHAPING4",
    "JULONGP5",
    "DADUKOU6",
    "BLOGWALK",
    "WELCOME99",
  ];

  await prisma.inviteCode.createMany({
    data: codes.map((code) => ({
      code,
      maxUses: 5,
      createdById: adminId,
      expiresAt: new Date("2027-12-31"),
    })),
  });
}

async function seedCityStructure() {
  console.log("   写入区域与街道…");
  await prisma.district.createMany({
    data: DISTRICTS.map((d) => ({
      slug: d.slug,
      nameZh: d.nameZh,
      summary: d.summary,
      mapX: d.center.x,
      mapZ: d.center.z,
      elevation: d.elevation,
      color: d.color,
      boundaryPolygon: d.boundary,
    })),
  });

  const districts = await prisma.district.findMany({
    select: { id: true, slug: true, nameZh: true },
  });
  const districtBySlug = new Map(districts.map((d) => [d.slug, d]));

  const streetRows: {
    slug: string;
    nameZh: string;
    districtId: string;
    sortOrder: number;
    summary: string;
  }[] = [];

  for (const d of DISTRICTS) {
    const district = districtBySlug.get(d.slug);
    if (!district) continue;
    const names = STREET_NAMES[d.slug] ?? [];
    names.forEach((nameZh, si) => {
      streetRows.push({
        slug: `${d.slug}-${nameZh.replace(/[^\w\u4e00-\u9fff]/g, "-").toLowerCase()}`,
        nameZh,
        districtId: district.id,
        sortOrder: si,
        summary: `${district.nameZh}的${nameZh}`,
      });
    });
  }

  await prisma.street.createMany({ data: streetRows });

  const streets = await prisma.street.findMany({
    select: { id: true, slug: true, nameZh: true },
  });

  console.log("   写入铺位…");
  const shopSlotRows = streets.flatMap((street) =>
    Array.from({ length: 15 }, (_, i) => ({
      streetId: street.id,
      slotIndex: i,
      isCenter: i === 14,
      status: "VACANT" as const,
    })),
  );
  await createManyInBatches("铺位", shopSlotRows, (chunk) =>
    prisma.shopSlot.createMany({ data: chunk }),
  );

  console.log("   写入公寓楼…");
  const buildingRows = streets.flatMap((street) =>
    Array.from({ length: 30 }, (_, i) => ({
      streetId: street.id,
      buildingNumber: i + 1,
    })),
  );
  await createManyInBatches("公寓楼", buildingRows, (chunk) =>
    prisma.apartmentBuilding.createMany({ data: chunk }),
  );

  console.log("   写入公寓席位…");
  const buildings = await prisma.apartmentBuilding.findMany({
    select: { id: true },
  });
  const unitRows = buildings.flatMap((building) =>
    Array.from({ length: 50 }, (_, i) => ({
      buildingId: building.id,
      unitNumber: i + 1,
    })),
  );
  await createManyInBatches("公寓席位", unitRows, (chunk) =>
    prisma.apartmentUnit.createMany({ data: chunk }),
  );

  return streets;
}

async function seedDemoContent(
  adminId: string,
  demoUserId: string,
) {
  console.log("   写入演示店铺与内容…");
  const demoStreet = await prisma.street.findFirst({
    where: { nameZh: "解放碑大道" },
    include: { shopSlots: true },
  });
  if (!demoStreet) return;

  const slot = demoStreet.shopSlots.find((s) => s.slotIndex === 0);
  if (!slot) return;

  await prisma.shopSlot.update({
    where: { id: slot.id },
    data: { status: "OCCUPIED" },
  });

  const shop = await prisma.shop.create({
    data: {
      name: "树洞咖啡",
      slug: "shudong-coffee",
      tagline: "在解放碑旁，喝一杯慢时光",
      shopSlotId: slot.id,
      ownerId: demoUserId,
    },
  });

  await prisma.user.update({
    where: { id: demoUserId },
    data: { residenceType: "SHOP" },
  });

  await prisma.shopRoom.createMany({
    data: ROOM_ORDER.map((roomType, i) => ({
      shopId: shop.id,
      roomType: roomType as RoomType,
      displayName:
        roomType === "SIDE_ROOM"
          ? "留言板"
          : roomType === "MAIN_HALL"
            ? "正厅·日常"
            : DEFAULT_ROOM_NAMES[roomType],
      sortOrder: i,
    })),
  });

  const article = await prisma.post.create({
    data: {
      type: "ARTICLE",
      title: "欢迎来到阿尔法重庆",
      body: "<p>欢迎来到阿尔法重庆。你可以在这里选一条街道，开一家小店，或者选一间公寓住下。</p><p>写下长文，发一条短文，在街上留言——这里没有短视频，只有文字与图片。</p>",
      authorId: demoUserId,
    },
  });

  const frontRoom = await prisma.shopRoom.findFirst({
    where: { shopId: shop.id, roomType: "FRONT_HALL" },
  });
  if (frontRoom) {
    await prisma.roomContent.create({
      data: { shopRoomId: frontRoom.id, postId: article.id },
    });
  }

  await prisma.post.create({
    data: {
      type: "MOMENT",
      body: "今天在解放碑大道开张了，欢迎来坐坐。",
      authorId: demoUserId,
      streetId: demoStreet.id,
    },
  });

  await prisma.streetMessage.create({
    data: {
      streetId: demoStreet.id,
      authorId: demoUserId,
      content: "解放碑大道的第一家店开张啦！",
    },
  });

  await prisma.guestbookEntry.create({
    data: {
      shopId: shop.id,
      authorId: adminId,
      content: "祝生意兴隆，阿尔法重庆因你而生动。",
    },
  });
}

async function seedApartmentDemo(aptUserId: string) {
  console.log("   写入演示公寓…");
  const street = await prisma.street.findFirst({
    where: { nameZh: "洪崖洞巷" },
  });
  if (!street) return;

  const building = await prisma.apartmentBuilding.findFirst({
    where: { streetId: street.id, buildingNumber: 3 },
    include: { units: { where: { unitNumber: 8 }, take: 1 } },
  });
  const unit = building?.units[0];
  if (!unit) return;

  await prisma.apartmentUnit.update({
    where: { id: unit.id },
    data: { residentId: aptUserId },
  });
  await prisma.user.update({
    where: { id: aptUserId },
    data: { residenceType: "APARTMENT" },
  });

  await prisma.post.create({
    data: {
      type: "MOMENT",
      body: "从公寓窗台望出去，洪崖洞的灯火像一串项链。",
      authorId: aptUserId,
      streetId: street.id,
    },
  });
}

async function main() {
  const started = Date.now();
  console.log("🌱 开始播种阿尔法重庆（批量模式）…");

  const preserved = await prisma.user.count({
    where: {
      email: { notIn: [SEED_ADMIN_EMAIL, SEED_DEMO_EMAIL] },
    },
  });
  if (preserved > 0) {
    console.log(`   保留已注册用户 ${preserved} 个`);
  }

  await clearCityData();
  const { admin, demoUser, aptUser } = await ensureSeedUsers();
  await seedInviteCodes(admin.id);
  await seedCityStructure();
  await seedDemoContent(admin.id, demoUser.id);
  await seedApartmentDemo(aptUser.id);

  const [districts, streets, shops, units] = await Promise.all([
    prisma.district.count(),
    prisma.street.count(),
    prisma.shop.count(),
    prisma.apartmentUnit.count(),
  ]);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`✅ 播种完成（${elapsed}s）`);
  console.log(`   区域 ${districts} · 街道 ${streets} · 店铺 ${shops} · 公寓席位 ${units}`);
  console.log("   管理员: admin@alphachongqing.local / admin123");
  console.log("   演示用户: demo@alphachongqing.local / demo1234");
  console.log("   邀请码: ALPHA2026, CHONGQING, WELCOME99 …");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
