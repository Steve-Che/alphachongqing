import { prisma } from "@/lib/db";

export async function getDistricts() {
  return prisma.district.findMany({
    include: {
      streets: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { shopSlots: true } },
        },
      },
      _count: { select: { streets: true } },
    },
    orderBy: { nameZh: "asc" },
  });
}

export async function getDistrictBySlug(slug: string) {
  return prisma.district.findUnique({
    where: { slug },
    include: {
      streets: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: {
              shopSlots: true,
              apartmentBuildings: true,
            },
          },
        },
      },
    },
  });
}

export async function getStreetBySlug(slug: string) {
  return prisma.street.findUnique({
    where: { slug },
    include: {
      district: true,
      shopSlots: {
        orderBy: { slotIndex: "asc" },
        include: { shop: { include: { owner: true } } },
      },
      apartmentBuildings: {
        orderBy: { buildingNumber: "asc" },
        include: {
          units: {
            orderBy: { unitNumber: "asc" },
            include: { resident: true },
          },
        },
      },
      streetMessages: {
        where: { archived: false },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { author: true },
      },
    },
  });
}

export async function getShopBySlug(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: true,
      shopSlot: { include: { street: { include: { district: true } } } },
      rooms: {
        orderBy: { sortOrder: "asc" },
        include: {
          roomContents: {
            orderBy: { sortOrder: "asc" },
            include: { post: { include: { author: true } } },
          },
        },
      },
    },
  });
}

export async function getApartmentUnit(id: string) {
  return prisma.apartmentUnit.findUnique({
    where: { id },
    include: {
      resident: true,
      building: {
        include: {
          street: { include: { district: true } },
        },
      },
    },
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      shop: { include: { shopSlot: { include: { street: true } } } },
      apartmentUnit: {
        include: {
          building: { include: { street: true } },
        },
      },
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: { images: true },
      },
    },
  });
}

export async function getInviteCodes() {
  return prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { username: true } } },
  });
}

export async function getCityStats() {
  const [districts, residents, shops, posts] = await Promise.all([
    prisma.district.count(),
    prisma.user.count(),
    prisma.shop.count(),
    prisma.post.count(),
  ]);
  return { districts, residents, shops, posts };
}
