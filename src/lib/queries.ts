import { cache } from "react";
import { prisma } from "@/lib/db";
import type { ApartmentBuildingData } from "@/components/map/ApartmentTowers";
import type { RoomType } from "@/generated/prisma/client";

function toBuildingSummaries(
  buildings: {
    id: string;
    buildingNumber: number;
    units: { id: string; residentId: string | null }[];
  }[],
  unitsPerBuilding: number,
): ApartmentBuildingData[] {
  return buildings.map((b) => {
    const occupied = b.units.filter((u) => u.residentId);
    const sample = occupied[0];
    return {
      id: b.id,
      buildingNumber: b.buildingNumber,
      occupiedCount: occupied.length,
      totalUnits: unitsPerBuilding,
      sampleUnitId: sample?.id ?? null,
    };
  });
}

export async function getDistrictBySlug(slug: string) {
  return prisma.district.findUnique({
    where: { slug },
    include: {
      streets: {
        orderBy: { sortOrder: "asc" },
        include: {
          shopSlots: { select: { status: true, isCenter: true } },
          apartmentBuildings: {
            select: {
              id: true,
              units: { select: { residentId: true } },
            },
          },
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

export const getUserResidence = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      residenceType: true,
      shop: {
        select: {
          slug: true,
          name: true,
          shopSlot: {
            select: {
              street: { select: { nameZh: true, slug: true } },
            },
          },
        },
      },
      apartmentUnit: {
        select: {
          id: true,
          unitNumber: true,
          building: {
            select: {
              buildingNumber: true,
              street: { select: { nameZh: true, slug: true } },
            },
          },
        },
      },
    },
  });
});

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, displayName: true } },
      images: true,
    },
  });
}

export async function getStreetBySlug(slug: string) {
  const street = await prisma.street.findUnique({
    where: { slug },
    include: {
      district: { select: { slug: true, nameZh: true } },
      shopSlots: {
        orderBy: { slotIndex: "asc" },
        include: {
          shop: {
            select: {
              slug: true,
              name: true,
              owner: { select: { username: true, displayName: true } },
            },
          },
        },
      },
      apartmentBuildings: {
        orderBy: { buildingNumber: "asc" },
        select: {
          id: true,
          buildingNumber: true,
          units: {
            select: {
              id: true,
              unitNumber: true,
              residentId: true,
              resident: { select: { username: true, displayName: true } },
            },
            orderBy: { unitNumber: "asc" },
          },
        },
      },
      streetMessages: {
        where: { archived: false },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { username: true, displayName: true } },
        },
      },
    },
  });

  if (!street) return null;

  const unitsPerBuilding =
    street.apartmentBuildings[0]?.units.length ?? 50;

  const apartmentSummaries = toBuildingSummaries(
    street.apartmentBuildings,
    unitsPerBuilding,
  );

  return { ...street, apartmentSummaries };
}

export async function getShopBySlug(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, username: true, displayName: true } },
      shopSlot: {
        include: {
          street: {
            include: { district: { select: { slug: true, nameZh: true } } },
          },
        },
      },
      rooms: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          roomType: true,
          displayName: true,
          sortOrder: true,
          _count: { select: { roomContents: true } },
        },
      },
    },
  });
}

export async function getShopRoomBySlug(shopSlug: string, roomType: RoomType) {
  return prisma.shopRoom.findFirst({
    where: {
      shop: { slug: shopSlug },
      roomType,
    },
    include: {
      shop: {
        select: {
          id: true,
          slug: true,
          name: true,
          ownerId: true,
          owner: { select: { username: true, displayName: true } },
          shopSlot: {
            include: {
              street: {
                include: { district: { select: { slug: true, nameZh: true } } },
              },
            },
          },
        },
      },
      roomContents: {
        orderBy: { sortOrder: "asc" },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              body: true,
              author: { select: { username: true, displayName: true } },
            },
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
      resident: {
        select: { id: true, username: true, displayName: true, bio: true },
      },
      building: {
        include: {
          street: {
            include: { district: { select: { slug: true, nameZh: true } } },
          },
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
        take: 30,
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

/** 首页单次 district 大查询，同时产出地图、列表与统计 */
export async function getHomePageData() {
  const [districts, residents, shops, posts, apartmentResidents] =
    await Promise.all([
      prisma.district.findMany({
        orderBy: { nameZh: "asc" },
        include: {
          streets: {
            orderBy: { sortOrder: "asc" },
            include: {
              _count: { select: { shopSlots: true } },
              shopSlots: {
                orderBy: { slotIndex: "asc" },
                include: {
                  shop: { select: { slug: true, name: true } },
                },
              },
              apartmentBuildings: {
                select: {
                  id: true,
                  buildingNumber: true,
                  units: { select: { id: true, residentId: true } },
                },
              },
            },
          },
          _count: { select: { streets: true } },
        },
      }),
      prisma.user.count(),
      prisma.shop.count(),
      prisma.post.count(),
      prisma.apartmentUnit.count({ where: { residentId: { not: null } } }),
    ]);

  const stats = {
    districts: districts.length,
    residents,
    shops,
    posts,
    apartmentResidents,
  };

  const mapData = districts.map((d) => ({
    slug: d.slug,
    nameZh: d.nameZh,
    summary: d.summary,
    streets: d.streets.map((s) => {
      const unitsPerBuilding = s.apartmentBuildings[0]?.units.length ?? 50;
      const apartmentBuildings = toBuildingSummaries(
        s.apartmentBuildings,
        unitsPerBuilding,
      );
      const occupiedUnits = apartmentBuildings.reduce(
        (sum, b) => sum + b.occupiedCount,
        0,
      );
      const totalUnits = apartmentBuildings.reduce(
        (sum, b) => sum + b.totalUnits,
        0,
      );

      return {
        slug: s.slug,
        nameZh: s.nameZh,
        sortOrder: s.sortOrder,
        districtSlug: d.slug,
        slots: s.shopSlots.map((slot) => ({
          id: slot.id,
          slotIndex: slot.slotIndex,
          status: slot.status,
          isCenter: slot.isCenter,
          shop: slot.shop,
        })),
        apartmentBuildings,
        apartmentsSummary: {
          totalBuildings: apartmentBuildings.length,
          occupiedUnits,
          totalUnits,
        },
      };
    }),
  }));

  return { districtList: districts, mapData, stats };
}
