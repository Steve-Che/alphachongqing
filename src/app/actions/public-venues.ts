"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { rateLimitSocialAction } from "@/lib/rate-limit";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const MOMENT_MAX_LENGTH = 500;

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function addVenueMessage(
  venueId: string,
  content: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("venue-message", user.id);
  if (!limited.ok) return limited;

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "留言不能为空" };
  if (trimmed.length > 500) return { ok: false, error: "留言不超过 500 字" };

  const venue = await prisma.publicVenue.findUnique({
    where: { id: venueId },
    select: { slug: true },
  });
  if (!venue) return { ok: false, error: "场馆不存在" };

  await prisma.venueMessage.create({
    data: { venueId, authorId: user.id, content: trimmed },
  });

  revalidatePath(`/place/${venue.slug}`);
  revalidatePath("/places");
  return { ok: true };
}

export async function createVenueMoment(
  venueId: string,
  body: string,
  imageUrls?: string[],
): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("venue-moment", user.id);
  if (!limited.ok) return limited;

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "内容不能为空" };
  if (trimmed.length > MOMENT_MAX_LENGTH) {
    return { ok: false, error: `短文不超过 ${MOMENT_MAX_LENGTH} 字` };
  }

  const venue = await prisma.publicVenue.findUnique({
    where: { id: venueId },
    select: { slug: true },
  });
  if (!venue) return { ok: false, error: "场馆不存在" };

  const images = imageUrls?.slice(0, 9) ?? [];

  const post = await prisma.post.create({
    data: {
      type: "MOMENT",
      body: trimmed,
      authorId: user.id,
      publicVenueId: venueId,
      images: {
        create: images.map((url) => ({ url, userId: user.id })),
      },
    },
  });

  revalidatePath(`/place/${venue.slug}`);
  revalidatePath(`/u/${user.username}`);
  return { ok: true, data: { id: post.id } };
}

export async function rsvpPublicEvent(eventId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("event-rsvp", user.id);
  if (!limited.ok) return limited;

  const event = await prisma.publicEvent.findUnique({
    where: { id: eventId },
    include: { venue: { select: { slug: true } } },
  });
  if (!event) return { ok: false, error: "活动不存在" };

  await prisma.publicEventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id },
    update: {},
  });

  revalidatePath(`/place/${event.venue.slug}`);
  revalidatePath("/places");
  return { ok: true };
}

export async function cancelRsvp(eventId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const event = await prisma.publicEvent.findUnique({
    where: { id: eventId },
    include: { venue: { select: { slug: true } } },
  });
  if (!event) return { ok: false, error: "活动不存在" };

  await prisma.publicEventRsvp.deleteMany({
    where: { eventId, userId: user.id },
  });

  revalidatePath(`/place/${event.venue.slug}`);
  return { ok: true };
}

export async function createPublicEvent(data: {
  venueId: string;
  title: string;
  summary: string;
  body?: string;
  startsAt: string;
  endsAt?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };
  if (user.role !== "ADMIN") return { ok: false, error: "仅管理员可创建活动" };

  const title = data.title.trim();
  const summary = data.summary.trim();
  if (!title || !summary) return { ok: false, error: "标题与摘要不能为空" };

  const venue = await prisma.publicVenue.findUnique({
    where: { id: data.venueId },
    select: { slug: true },
  });
  if (!venue) return { ok: false, error: "场馆不存在" };

  const event = await prisma.publicEvent.create({
    data: {
      venueId: data.venueId,
      title,
      summary,
      body: data.body?.trim() || null,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      createdById: user.id,
    },
  });

  revalidatePath(`/place/${venue.slug}`);
  return { ok: true, data: { id: event.id } };
}

export async function loadMoreVenueFeed(venueId: string, cursor: string) {
  const { getVenueFeed } = await import("@/lib/queries");
  return getVenueFeed(venueId, 20, cursor);
}
