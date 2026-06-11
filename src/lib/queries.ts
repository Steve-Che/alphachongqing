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
              street: { select: { id: true, nameZh: true, slug: true } },
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
              street: { select: { id: true, nameZh: true, slug: true } },
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
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      street: { select: { nameZh: true, slug: true } },
      images: true,
      _count: { select: { likes: true } },
    },
  });
}

export async function getMomentById(id: string) {
  const post = await getPostById(id);
  if (!post || post.type !== "MOMENT") return null;
  return post;
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
      streetMessages: {
        where: { archived: false },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { id: true, username: true, displayName: true } },
          comments: {
            where: { parentId: null },
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, username: true, displayName: true } },
              replies: {
                orderBy: { createdAt: "asc" },
                include: {
                  author: { select: { id: true, username: true, displayName: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!street) return null;

  const buildings = await prisma.apartmentBuilding.findMany({
    where: { streetId: street.id },
    orderBy: { buildingNumber: "asc" },
    select: {
      id: true,
      buildingNumber: true,
      _count: { select: { units: true } },
    },
  });

  const occupiedByBuilding = await prisma.apartmentUnit.groupBy({
    by: ["buildingId"],
    where: { building: { streetId: street.id }, residentId: { not: null } },
    _count: { _all: true },
  });
  const occupiedMap = new Map(
    occupiedByBuilding.map((o) => [o.buildingId, o._count._all]),
  );

  const sampleUnits = await prisma.apartmentUnit.findMany({
    where: { building: { streetId: street.id }, residentId: { not: null } },
    distinct: ["buildingId"],
    select: { id: true, buildingId: true, residentId: true },
  });
  const sampleMap = new Map(sampleUnits.map((u) => [u.buildingId, u.id]));

  const unitsPerBuilding = buildings[0]?._count.units ?? 50;

  const apartmentSummaries: ApartmentBuildingData[] = buildings.map((b) => ({
    id: b.id,
    buildingNumber: b.buildingNumber,
    occupiedCount: occupiedMap.get(b.id) ?? 0,
    totalUnits: b._count.units || unitsPerBuilding,
    sampleUnitId: sampleMap.get(b.id) ?? null,
  }));

  const apartmentBuildings = buildings.map((b) => ({
    id: b.id,
    buildingNumber: b.buildingNumber,
    vacantCount: b._count.units - (occupiedMap.get(b.id) ?? 0),
    totalUnits: b._count.units || unitsPerBuilding,
  }));

  return { ...street, apartmentSummaries, apartmentBuildings };
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
        include: {
          images: true,
          street: { select: { nameZh: true, slug: true } },
          _count: { select: { likes: true } },
        },
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

export async function getAllStreetsForSelect() {
  return prisma.street.findMany({
    orderBy: [{ district: { nameZh: "asc" } }, { sortOrder: "asc" }],
    select: { id: true, nameZh: true, slug: true, district: { select: { nameZh: true } } },
  });
}

export type StreetFeedItem =
  | {
      kind: "moment";
      id: string;
      body: string;
      createdAt: Date;
      author: { username: string; displayName: string | null };
      images?: { url: string }[];
    }
  | {
      kind: "shop";
      id: string;
      shopSlug: string;
      shopName: string;
      createdAt: Date;
      author: { username: string; displayName: string | null };
    }
  | {
      kind: "apartment";
      id: string;
      unitId: string;
      buildingNumber: number;
      unitNumber: number;
      createdAt: Date;
      author: { username: string; displayName: string | null };
    };

export async function getStreetFeed(streetId: string, take = 20): Promise<StreetFeedItem[]> {
  const [moments, shops, moveIns] = await Promise.all([
    prisma.post.findMany({
      where: { streetId, type: "MOMENT", published: true },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        author: { select: { username: true, displayName: true } },
        images: { select: { url: true } },
      },
    }),
    prisma.shop.findMany({
      where: { shopSlot: { streetId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        slug: true,
        name: true,
        createdAt: true,
        owner: { select: { username: true, displayName: true } },
      },
    }),
    prisma.apartmentUnit.findMany({
      where: { building: { streetId }, residentId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        resident: { select: { username: true, displayName: true } },
        building: { select: { buildingNumber: true } },
      },
    }),
  ]);

  const items: StreetFeedItem[] = [
    ...moments.map((m) => ({
      kind: "moment" as const,
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      author: m.author,
      images: m.images,
    })),
    ...shops.map((s) => ({
      kind: "shop" as const,
      id: s.id,
      shopSlug: s.slug,
      shopName: s.name,
      createdAt: s.createdAt,
      author: s.owner,
    })),
    ...moveIns.map((u) => ({
      kind: "apartment" as const,
      id: u.id,
      unitId: u.id,
      buildingNumber: u.building.buildingNumber,
      unitNumber: u.unitNumber,
      createdAt: u.updatedAt,
      author: u.resident!,
    })),
  ];

  return items
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, take);
}

export async function getPostComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });
}

export async function getGuestbookComments(entryIds: string[]) {
  if (entryIds.length === 0) return [];
  return prisma.comment.findMany({
    where: { guestbookEntryId: { in: entryIds }, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });
}

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!row;
}

export async function getFollowingFeed(
  userId: string,
  take = 20,
  cursor?: string,
) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const ids = following.map((f) => f.followingId);
  if (ids.length === 0) return { items: [], nextCursor: null };

  const items = await prisma.post.findMany({
    where: { authorId: { in: ids }, published: true },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      street: { select: { nameZh: true, slug: true } },
      images: { select: { url: true } },
      _count: { select: { likes: true } },
    },
  });

  let nextCursor: string | null = null;
  if (items.length > take) {
    const last = items.pop()!;
    nextCursor = last.id;
  }
  return { items, nextCursor };
}

export async function getNotifications(
  userId: string,
  take = 20,
  cursor?: string,
) {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      actor: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  let nextCursor: string | null = null;
  if (items.length > take) {
    const last = items.pop()!;
    nextCursor = last.id;
  }
  return { items, nextCursor };
}

export async function getRecommendedUsers(take = 5) {
  const recentShops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      owner: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  });
  const seen = new Set<string>();
  return recentShops
    .map((s) => s.owner)
    .filter((u) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
}

export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

export async function getUserStats(userId: string) {
  const [postCount, followCounts, residence] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, published: true } }),
    getFollowCounts(userId),
    getUserResidence(userId),
  ]);
  const hasResidence = !!(residence?.shop || residence?.apartmentUnit);
  return { postCount, ...followCounts, hasResidence };
}

export async function searchContent(query: string, take = 20) {
  const q = query.trim();
  if (!q) return { users: [], posts: [] };

  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      select: { username: true, displayName: true, avatarUrl: true, bio: true },
    }),
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    }),
  ]);

  return { users, posts };
}

export async function getPostLikeState(postId: string, userId?: string) {
  if (!userId) return { liked: false, count: 0 };
  const [count, liked] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    }),
  ]);
  return { liked: !!liked, count };
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
