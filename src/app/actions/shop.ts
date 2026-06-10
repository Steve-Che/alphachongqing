"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_ROOM_NAMES, ROOM_ORDER } from "@/lib/chongqing/geo";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    const shop = await prisma.$transaction(async (tx) => {
      const slot = await tx.shopSlot.findUnique({
        where: { id: shopSlotId },
        include: { street: true },
      });

      if (!slot || slot.status !== "VACANT") {
        throw new Error("铺位已被占用");
      }

      let slug = slugify(trimmedName);
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

      return newShop;
    });

    revalidatePath(`/street/${shop.slug}`);
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
      const apt = await tx.apartmentUnit.findUnique({ where: { id: unitId } });
      if (!apt || apt.residentId) throw new Error("该公寓位已被占用");

      const updated = await tx.apartmentUnit.update({
        where: { id: unitId },
        data: { residentId: user.id },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { residenceType: "APARTMENT" },
      });

      return updated;
    });

    revalidatePath(`/apartment/${unit.id}`);
    return { ok: true, data: { id: unit.id } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "选位失败",
    };
  }
}

export async function releaseResidence(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { shop: { include: { shopSlot: true } }, apartmentUnit: true },
  });

  if (!dbUser) return { ok: false, error: "用户不存在" };

  try {
    await prisma.$transaction(async (tx) => {
      if (dbUser.shop) {
        await tx.shopSlot.update({
          where: { id: dbUser.shop.shopSlotId },
          data: { status: "VACANT" },
        });
        await tx.shop.delete({ where: { id: dbUser.shop.id } });
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

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "留言不能为空" };

  await prisma.guestbookEntry.create({
    data: { shopId, authorId: user.id, content: trimmed },
  });

  return { ok: true };
}

export async function addStreetMessage(
  streetId: string,
  content: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "留言不能为空" };

  await prisma.streetMessage.create({
    data: { streetId, authorId: user.id, content: trimmed },
  });

  revalidatePath(`/street`);
  return { ok: true };
}

export async function releaseResidenceAction(): Promise<void> {
  const result = await releaseResidence();
  if (!result.ok) {
    throw new Error(result.error);
  }
  redirect(`/u/${(await auth())?.user?.username ?? ""}`);
}

export async function openShopAndRedirect(
  shopSlotId: string,
  name: string,
  tagline?: string,
): Promise<void> {
  const result = await openShop(shopSlotId, name, tagline);
  if (result.ok && result.data) {
    redirect(`/shop/${result.data.slug}`);
  }
  throw new Error(result.ok ? "未知错误" : result.error);
}
