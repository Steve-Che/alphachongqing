"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_ROOM_NAMES, ROOM_ORDER } from "@/lib/chongqing/geo";
import { shopPath } from "@/lib/route-slug";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rateLimitMoveAction, rateLimitSocialAction } from "@/lib/rate-limit";
import type { RoomType } from "@/generated/prisma/client";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function openShop(
  shopSlotId: string,
  name: string,
  tagline?: string,
): Promise<ActionResult<{ slug: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    include: { shop: true, apartmentUnit: true },
  });

  if (existing?.shop) return { ok: false, error: "您已有店铺" };
  if (existing?.apartmentUnit) {
    return { ok: false, error: "您已入住公寓，请先释放公寓再开店" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: "请填写店铺名称" };

  try {
    const { shop, streetSlug } = await prisma.$transaction(async (tx) => {
      const slot = await tx.shopSlot.findUnique({
        where: { id: shopSlotId },
        include: { street: true },
      });

      if (!slot || slot.status !== "VACANT") {
        throw new Error("铺位已被占用");
      }

      let slug = slugify(trimmedName);
      if (!slug) slug = `shop-${Date.now().toString(36)}`;
      const slugExists = await tx.shop.findUnique({ where: { slug } });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

      await tx.shopSlot.update({
        where: { id: shopSlotId },
        data: { status: "OCCUPIED" },
      });

      const newShop = await tx.shop.create({
        data: {
          name: trimmedName,
          slug,
          tagline: tagline?.trim() || null,
          shopSlotId,
          ownerId: user.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { residenceType: "SHOP" },
      });

      for (let i = 0; i < ROOM_ORDER.length; i++) {
        const roomType = ROOM_ORDER[i] as RoomType;
        await tx.shopRoom.create({
          data: {
            shopId: newShop.id,
            roomType,
            displayName: DEFAULT_ROOM_NAMES[roomType],
            sortOrder: i,
          },
        });
      }

      return { shop: newShop, streetSlug: slot.street.slug };
    });

    revalidatePath(`/street/${streetSlug}`);
    revalidatePath("/");
    return { ok: true, data: { slug: shop.slug } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "开店失败",
    };
  }
}

export async function rentApartment(
  unitId: string,
): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    include: { shop: true, apartmentUnit: true },
  });

  if (existing?.apartmentUnit) return { ok: false, error: "您已入住公寓" };
  if (existing?.shop) {
    return { ok: false, error: "您已有店铺，请先释放店铺再选公寓" };
  }

  try {
    const unit = await prisma.$transaction(async (tx) => {
      const apt = await tx.apartmentUnit.findUnique({
        where: { id: unitId },
        include: { building: { include: { street: true } } },
      });
      if (!apt || apt.residentId) throw new Error("该公寓位已被占用");

      const updated = await tx.apartmentUnit.update({
        where: { id: unitId },
        data: { residentId: user.id },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { residenceType: "APARTMENT" },
      });

      return { unit: updated, streetSlug: apt.building.street.slug };
    });

    revalidatePath(`/apartment/${unit.unit.id}`);
    revalidatePath(`/street/${unit.streetSlug}`);
    revalidatePath("/");
    return { ok: true, data: { id: unit.unit.id } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "选位失败",
    };
  }
}

export async function moveShop(
  targetShopSlotId: string,
): Promise<
  ActionResult<{
    slug: string;
    shopName: string;
    oldStreetSlug: string;
    newStreetSlug: string;
    oldStreetName: string;
    newStreetName: string;
  }>
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitMoveAction(user.id);
  if (!limited.ok) return limited;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      shop: {
        include: {
          shopSlot: { include: { street: true } },
        },
      },
    },
  });

  if (!dbUser?.shop) return { ok: false, error: "您还没有店铺" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const targetSlot = await tx.shopSlot.findUnique({
        where: { id: targetShopSlotId },
        include: { street: true },
      });

      if (!targetSlot || targetSlot.status !== "VACANT") {
        throw new Error("铺位已被占用");
      }
      if (targetSlot.isCenter) {
        throw new Error("街心广场不可开店");
      }
      if (targetSlot.id === dbUser.shop!.shopSlotId) {
        throw new Error("你已在该铺位");
      }

      const oldStreetSlug = dbUser.shop!.shopSlot.street.slug;
      const oldStreetName = dbUser.shop!.shopSlot.street.nameZh;
      const newStreetSlug = targetSlot.street.slug;
      const newStreetName = targetSlot.street.nameZh;

      await tx.shopSlot.update({
        where: { id: dbUser.shop!.shopSlotId },
        data: { status: "VACANT" },
      });
      await tx.shopSlot.update({
        where: { id: targetSlot.id },
        data: { status: "OCCUPIED" },
      });
      await tx.shop.update({
        where: { id: dbUser.shop!.id },
        data: { shopSlotId: targetSlot.id },
      });

      return {
        slug: dbUser.shop!.slug,
        shopName: dbUser.shop!.name,
        oldStreetSlug,
        newStreetSlug,
        oldStreetName,
        newStreetName,
      };
    });

    revalidatePath(`/street/${result.oldStreetSlug}`);
    revalidatePath(`/street/${result.newStreetSlug}`);
    revalidatePath(`/shop/${result.slug}`);
    revalidatePath(`/u/${user.username}`);
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "搬家失败",
    };
  }
}

export async function moveApartment(
  targetUnitId: string,
): Promise<
  ActionResult<{
    id: string;
    oldUnitId: string;
    oldStreetSlug: string;
    newStreetSlug: string;
    oldLabel: string;
    newLabel: string;
  }>
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitMoveAction(user.id);
  if (!limited.ok) return limited;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      apartmentUnit: {
        include: {
          building: { include: { street: true } },
        },
      },
    },
  });

  if (!dbUser?.apartmentUnit) return { ok: false, error: "您还没有入住公寓" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const targetUnit = await tx.apartmentUnit.findUnique({
        where: { id: targetUnitId },
        include: { building: { include: { street: true } } },
      });

      if (!targetUnit || targetUnit.residentId) {
        throw new Error("该公寓位已被占用");
      }
      if (targetUnit.id === dbUser.apartmentUnit!.id) {
        throw new Error("你已在该房间");
      }

      const oldUnit = dbUser.apartmentUnit!;
      const oldStreetSlug = oldUnit.building.street.slug;
      const newStreetSlug = targetUnit.building.street.slug;
      const oldLabel = `${oldUnit.building.street.nameZh} · ${oldUnit.building.buildingNumber} 号楼 ${oldUnit.unitNumber} 室`;
      const newLabel = `${targetUnit.building.street.nameZh} · ${targetUnit.building.buildingNumber} 号楼 ${targetUnit.unitNumber} 室`;

      await tx.apartmentUnit.update({
        where: { id: oldUnit.id },
        data: { residentId: null },
      });
      await tx.apartmentUnit.update({
        where: { id: targetUnit.id },
        data: { residentId: user.id },
      });

      return {
        id: targetUnit.id,
        oldUnitId: oldUnit.id,
        oldStreetSlug,
        newStreetSlug,
        oldLabel,
        newLabel,
      };
    });

    revalidatePath(`/street/${result.oldStreetSlug}`);
    revalidatePath(`/street/${result.newStreetSlug}`);
    revalidatePath(`/apartment/${result.oldUnitId}`);
    revalidatePath(`/apartment/${result.id}`);
    revalidatePath(`/u/${user.username}`);
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "搬家失败",
    };
  }
}

export async function releaseResidence(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      shop: { include: { shopSlot: { include: { street: true } } } },
      apartmentUnit: true,
    },
  });

  if (!dbUser) return { ok: false, error: "用户不存在" };

  const shopSlug = dbUser.shop?.slug;
  const streetSlug = dbUser.shop?.shopSlot.street.slug;

  try {
    await prisma.$transaction(async (tx) => {
      if (dbUser.shop) {
        const shopId = dbUser.shop.id;
        await tx.guestbookEntry.deleteMany({ where: { shopId } });
        await tx.roomContent.deleteMany({
          where: { shopRoom: { shopId } },
        });
        await tx.shopRoom.deleteMany({ where: { shopId } });
        await tx.shopSlot.update({
          where: { id: dbUser.shop.shopSlotId },
          data: { status: "VACANT" },
        });
        await tx.shop.delete({ where: { id: shopId } });
      }
      if (dbUser.apartmentUnit) {
        await tx.apartmentUnit.update({
          where: { id: dbUser.apartmentUnit.id },
          data: { residentId: null },
        });
      }
      await tx.user.update({
        where: { id: user.id },
        data: { residenceType: null },
      });
    });

    if (streetSlug) revalidatePath(`/street/${streetSlug}`);
    if (shopSlug) revalidatePath(`/shop/${shopSlug}`);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "释放失败",
    };
  }
}

export async function updateRoomName(
  roomId: string,
  displayName: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const room = await prisma.shopRoom.findUnique({
    where: { id: roomId },
    include: { shop: true },
  });

  if (!room || room.shop.ownerId !== user.id) {
    return { ok: false, error: "无权修改" };
  }

  await prisma.shopRoom.update({
    where: { id: roomId },
    data: { displayName: displayName.trim() || room.displayName },
  });

  revalidatePath(`/shop/${room.shop.slug}`);
  return { ok: true };
}

export async function attachPostToRoom(
  roomId: string,
  postId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const room = await prisma.shopRoom.findUnique({
    where: { id: roomId },
    include: { shop: true },
  });
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!room || room.shop.ownerId !== user.id) {
    return { ok: false, error: "无权操作" };
  }
  if (!post || post.authorId !== user.id) {
    return { ok: false, error: "文章不存在" };
  }

  await prisma.roomContent.create({
    data: { shopRoomId: roomId, postId },
  });

  revalidatePath(`/shop/${room.shop.slug}`);
  return { ok: true };
}

export async function addGuestbookEntry(
  shopId: string,
  content: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("guestbook", user.id);
  if (!limited.ok) return limited;

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "留言不能为空" };
  if (trimmed.length > 500) return { ok: false, error: "留言不超过 500 字" };

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { slug: true },
  });

  await prisma.guestbookEntry.create({
    data: { shopId, authorId: user.id, content: trimmed },
  });

  if (shop) revalidatePath(`/shop/${shop.slug}`);
  return { ok: true };
}

export async function addStreetMessage(
  streetId: string,
  content: string,
  options?: { asOfficial?: boolean },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("street-message", user.id);
  if (!limited.ok) return limited;

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "留言不能为空" };
  if (trimmed.length > 500) return { ok: false, error: "留言不超过 500 字" };

  const street = await prisma.street.findUnique({
    where: { id: streetId },
    select: { slug: true, serviceChiefId: true },
  });
  if (!street) return { ok: false, error: "街道不存在" };

  const wantsOfficial = options?.asOfficial === true;
  const isChief = street.serviceChiefId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (wantsOfficial && !isChief && !isAdmin) {
    return { ok: false, error: "仅街道服务长可发官方公告" };
  }

  await prisma.streetMessage.create({
    data: {
      streetId,
      authorId: user.id,
      content: trimmed,
      isOfficial: wantsOfficial,
    },
  });

  revalidatePath(`/street/${street.slug}`);
  return { ok: true };
}

export async function updateShopSettings(data: {
  name?: string;
  tagline?: string;
  coverUrl?: string | null;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const shop = await prisma.shop.findUnique({
    where: { ownerId: user.id },
    select: { id: true, slug: true },
  });
  if (!shop) return { ok: false, error: "您还没有店铺" };

  const update: { name?: string; tagline?: string | null; coverUrl?: string | null } =
    {};
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) return { ok: false, error: "店铺名称不能为空" };
    update.name = trimmed;
  }
  if (data.tagline !== undefined) {
    update.tagline = data.tagline.trim() || null;
  }
  if (data.coverUrl !== undefined) {
    update.coverUrl = data.coverUrl;
  }

  await prisma.shop.update({
    where: { id: shop.id },
    data: update,
  });

  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/settings");
  const street = await prisma.shopSlot.findFirst({
    where: { shop: { id: shop.id } },
    select: { street: { select: { slug: true } } },
  });
  if (street?.street.slug) revalidatePath(`/street/${street.street.slug}`);
  return { ok: true };
}

export async function releaseResidenceAction(): Promise<void> {
  const result = await releaseResidence();
  if (!result.ok) {
    throw new Error(result.error);
  }
  redirect(`/u/${(await auth())?.user?.username ?? ""}`);
}

export async function getBuildingUnitsForPicker(buildingId: string) {
  return prisma.apartmentUnit.findMany({
    where: { buildingId },
    select: {
      id: true,
      unitNumber: true,
      residentId: true,
      resident: { select: { username: true, displayName: true } },
    },
    orderBy: { unitNumber: "asc" },
  });
}

export async function openShopAndRedirect(
  shopSlotId: string,
  name: string,
  tagline?: string,
): Promise<void> {
  const result = await openShop(shopSlotId, name, tagline);
  if (result.ok && result.data) {
    redirect(shopPath(result.data.slug));
  }
  throw new Error(result.ok ? "未知错误" : result.error);
}
