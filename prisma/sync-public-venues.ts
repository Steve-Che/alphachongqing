/**
 * 同步公共区域：场馆、公版书、示范活动。
 * 部署时由 vercel buildCommand 调用。
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";
import { PUBLIC_VENUES } from "../src/lib/chongqing/public-venues";
import { LIBRARY_BOOKS } from "../src/lib/public-venues/library-catalog";

const SEED_ADMIN_EMAIL = "admin@alphachongqing.local";
const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function syncVenues() {
  for (const v of PUBLIC_VENUES) {
    await prisma.publicVenue.upsert({
      where: { slug: v.slug },
      create: {
        slug: v.slug,
        nameZh: v.nameZh,
        summary: v.summary,
        tier: v.tier,
        type: v.type,
        districtSlug: v.districtSlug,
        mapX: v.mapX,
        mapZ: v.mapZ,
        sortOrder: v.sortOrder,
      },
      update: {
        nameZh: v.nameZh,
        summary: v.summary,
        tier: v.tier,
        type: v.type,
        districtSlug: v.districtSlug,
        mapX: v.mapX,
        mapZ: v.mapZ,
        sortOrder: v.sortOrder,
      },
    });
  }
}

async function syncLibraryBooks() {
  const library = await prisma.publicVenue.findUnique({
    where: { slug: "city-library" },
  });
  if (!library) return;

  for (const book of LIBRARY_BOOKS) {
    await prisma.libraryBook.upsert({
      where: { slug: book.slug },
      create: {
        slug: book.slug,
        title: book.title,
        author: book.author,
        language: book.language,
        source: book.source,
        sourceUrl: book.sourceUrl ?? null,
        contentPath: book.contentPath,
        venueId: library.id,
        sortOrder: book.sortOrder,
      },
      update: {
        title: book.title,
        author: book.author,
        language: book.language,
        source: book.source,
        sourceUrl: book.sourceUrl ?? null,
        contentPath: book.contentPath,
        venueId: library.id,
        sortOrder: book.sortOrder,
      },
    });
  }
}

async function syncSampleEvents(adminId: string) {
  const hall = await prisma.publicVenue.findUnique({
    where: { slug: "mountain-hall" },
  });
  const square = await prisma.publicVenue.findUnique({
    where: { slug: "jiefangbei-square" },
  });
  if (!hall || !square) return;

  const now = new Date();
  const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const events = [
    {
      venueId: hall.id,
      slug: "spring-chamber-music",
      title: "山城春季室内乐",
      summary: "弦乐四重奏，曲目含重庆本土青年作曲家作品。",
      body: "免费入场，请提前 RSVP 以便安排座位。演出约 90 分钟，含中场休息。",
      startsAt: inWeek,
      endsAt: new Date(inWeek.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      venueId: hall.id,
      slug: "poetry-night",
      title: "读诗之夜",
      summary: "街坊自带一首喜欢的诗，围坐分享。",
      body: "不限古今，可中文可英文。茶点自备或现场小酌。",
      startsAt: inTwoWeeks,
      endsAt: new Date(inTwoWeeks.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      venueId: square.id,
      slug: "square-book-fair",
      title: "广场旧书交换日",
      summary: "带上你想换出的书，在广场交换区寻找下一本。",
      body: "无需店铺，只需一本书与一颗愿意分享的心。",
      startsAt: inWeek,
      endsAt: new Date(inWeek.getTime() + 4 * 60 * 60 * 1000),
    },
  ];

  for (const e of events) {
    const existing = await prisma.publicEvent.findFirst({
      where: { venueId: e.venueId, title: e.title },
    });
    if (existing) {
      await prisma.publicEvent.update({
        where: { id: existing.id },
        data: {
          summary: e.summary,
          body: e.body,
          startsAt: e.startsAt,
          endsAt: e.endsAt,
        },
      });
    } else {
      await prisma.publicEvent.create({
        data: {
          venueId: e.venueId,
          title: e.title,
          summary: e.summary,
          body: e.body,
          startsAt: e.startsAt,
          endsAt: e.endsAt,
          createdById: adminId,
        },
      });
    }
  }
}

async function main() {
  await syncVenues();
  console.log(`sync-public-venues: ${PUBLIC_VENUES.length} 个场馆已同步`);

  await syncLibraryBooks();
  console.log(`sync-public-venues: ${LIBRARY_BOOKS.length} 本公版书已同步`);

  const admin = await prisma.user.findUnique({
    where: { email: SEED_ADMIN_EMAIL },
    select: { id: true },
  });
  if (admin) {
    await syncSampleEvents(admin.id);
    console.log("sync-public-venues: 示范活动已同步");
  } else {
    console.log("sync-public-venues: 未找到 admin 用户，跳过活动种子");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
