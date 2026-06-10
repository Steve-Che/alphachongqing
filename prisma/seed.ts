import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { getDatabaseUrl } from "../src/lib/database-url";
import { DISTRICTS, STREET_NAMES, DEFAULT_ROOM_NAMES, ROOM_ORDER } from "../src/lib/chongqing/geo";
import type { RoomType } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 开始播种阿尔法重庆...");

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
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@alphachongqing.local",
      username: "admin",
      passwordHash: adminHash,
      displayName: "城主",
      role: "ADMIN",
      bio: "阿尔法重庆管理员",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@alphachongqing.local",
      username: "demo",
      passwordHash: demoHash,
      displayName: "演示居民",
      bio: "一家小店的店主，喜欢在街上闲逛。",
    },
  });

  const inviteCodes = [
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

  for (const code of inviteCodes) {
    await prisma.inviteCode.create({
      data: {
        code,
        maxUses: 5,
        createdById: admin.id,
        expiresAt: new Date("2027-12-31"),
      },
    });
  }

  for (const d of DISTRICTS) {
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

    const streetNames = STREET_NAMES[d.slug] ?? [];
    for (let si = 0; si < streetNames.length; si++) {
      const nameZh = streetNames[si];
      const slug = `${d.slug}-${nameZh.replace(/[^\w\u4e00-\u9fff]/g, "-").toLowerCase()}`;

      const street = await prisma.street.create({
        data: {
          slug,
          nameZh,
          districtId: district.id,
          sortOrder: si,
          summary: `${d.nameZh}的${nameZh}`,
        },
      });

      for (let i = 0; i <= 14; i++) {
        await prisma.shopSlot.create({
          data: {
            streetId: street.id,
            slotIndex: i,
            isCenter: i === 14,
            status: "VACANT",
          },
        });
      }

      for (let b = 1; b <= 30; b++) {
        const building = await prisma.apartmentBuilding.create({
          data: { streetId: street.id, buildingNumber: b },
        });
        for (let u = 1; u <= 50; u++) {
          await prisma.apartmentUnit.create({
            data: { buildingId: building.id, unitNumber: u },
          });
        }
      }
    }
  }

  const demoStreet = await prisma.street.findFirst({
    where: { nameZh: "解放碑大道" },
    include: { shopSlots: true },
  });

  if (demoStreet) {
    const slot = demoStreet.shopSlots.find((s) => s.slotIndex === 0);
    if (slot) {
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
          ownerId: demoUser.id,
        },
      });

      await prisma.user.update({
        where: { id: demoUser.id },
        data: { residenceType: "SHOP" },
      });

      for (let i = 0; i < ROOM_ORDER.length; i++) {
        const roomType = ROOM_ORDER[i] as RoomType;
        await prisma.shopRoom.create({
          data: {
            shopId: shop.id,
            roomType,
            displayName:
              roomType === "SIDE_ROOM"
                ? "留言板"
                : roomType === "MAIN_HALL"
                  ? "正厅·日常"
                  : DEFAULT_ROOM_NAMES[roomType],
            sortOrder: i,
          },
        });
      }

      const article = await prisma.post.create({
        data: {
          type: "ARTICLE",
          title: "欢迎来到阿尔法重庆",
          body: "<p>这是一座致敬豆瓣阿尔法城的虚拟城市。你可以在这里选一条街道，开一家小店，或者选一间公寓住下。</p><p>写下长文，发一条短文，在街上留言——这里没有短视频，只有文字与图片。</p>",
          authorId: demoUser.id,
          coverUrl: null,
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
          authorId: demoUser.id,
          streetId: demoStreet.id,
        },
      });

      await prisma.streetMessage.create({
        data: {
          streetId: demoStreet.id,
          authorId: demoUser.id,
          content: "解放碑大道的第一家店开张啦！",
        },
      });

      await prisma.guestbookEntry.create({
        data: {
          shopId: shop.id,
          authorId: admin.id,
          content: "祝生意兴隆，阿尔法重庆因你而生动。",
        },
      });
    }
  }

  console.log("✅ 播种完成");
  console.log("   管理员: admin@alphachongqing.local / admin123");
  console.log("   演示用户: demo@alphachongqing.local / demo1234");
  console.log("   邀请码: ALPHA2026, CHONGQING, ...");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
