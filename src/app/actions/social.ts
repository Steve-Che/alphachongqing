"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateStreet } from "@/lib/revalidate-street";
import { rateLimitSocialAction } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";
import { getPostDetailPath } from "@/lib/post-path";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const COMMENT_MAX_LENGTH = 500;

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function toggleFollow(
  followingId: string,
): Promise<ActionResult<{ following: boolean }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };
  if (user.id === followingId) return { ok: false, error: "不能关注自己" };

  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { username: true },
  });
  if (!target) return { ok: false, error: "用户不存在" };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });
    revalidatePath(`/u/${target.username}`);
    revalidatePath("/feed");
    return { ok: true, data: { following: false } };
  }

  await prisma.follow.create({
    data: { followerId: user.id, followingId },
  });

  await createNotification({
    userId: followingId,
    type: "FOLLOW",
    actorId: user.id,
    href: `/u/${user.username}`,
    body: "关注了你",
  });

  revalidatePath(`/u/${target.username}`);
  revalidatePath("/feed");
  return { ok: true, data: { following: true } };
}

export async function addComment(data: {
  body: string;
  postId?: string;
  guestbookEntryId?: string;
  streetMessageId?: string;
  parentId?: string;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const limited = await rateLimitSocialAction("comment", user.id);
  if (!limited.ok) return limited;

  const body = data.body.trim();
  if (!body) return { ok: false, error: "内容不能为空" };
  if (body.length > COMMENT_MAX_LENGTH) {
    return { ok: false, error: `不超过 ${COMMENT_MAX_LENGTH} 字` };
  }

  const targets = [data.postId, data.guestbookEntryId, data.streetMessageId].filter(
    Boolean,
  );
  if (targets.length !== 1) return { ok: false, error: "无效的评论目标" };

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { parentId: true, postId: true, guestbookEntryId: true, streetMessageId: true },
    });
    if (!parent || parent.parentId) {
      return { ok: false, error: "只能回复一层" };
    }
    if (data.postId && parent.postId !== data.postId) {
      return { ok: false, error: "回复目标不匹配" };
    }
    if (data.guestbookEntryId && parent.guestbookEntryId !== data.guestbookEntryId) {
      return { ok: false, error: "回复目标不匹配" };
    }
    if (data.streetMessageId && parent.streetMessageId !== data.streetMessageId) {
      return { ok: false, error: "回复目标不匹配" };
    }
  }

  const comment = await prisma.comment.create({
    data: {
      authorId: user.id,
      body,
      parentId: data.parentId ?? null,
      postId: data.postId ?? null,
      guestbookEntryId: data.guestbookEntryId ?? null,
      streetMessageId: data.streetMessageId ?? null,
    },
  });

  if (data.postId) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true, title: true, type: true },
    });
    const postPath = post
      ? getPostDetailPath(data.postId, post.type)
      : `/article/${data.postId}`;
    if (post && post.authorId !== user.id) {
      const commentBody =
        post.type === "MOMENT"
          ? data.parentId
            ? "回复了你的评论"
            : "评论了你的短文"
          : data.parentId
            ? "回复了你的评论"
            : `评论了你的文章《${post.title ?? "无题"}》`;
      await createNotification({
        userId: post.authorId,
        type: data.parentId ? "REPLY" : "COMMENT",
        actorId: user.id,
        href: postPath,
        body: commentBody,
      });
    }
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { authorId: true },
      });
      if (parentComment && parentComment.authorId !== user.id) {
        await createNotification({
          userId: parentComment.authorId,
          type: "REPLY",
          actorId: user.id,
          href: postPath,
          body: "回复了你的评论",
        });
      }
    }
    revalidatePath(postPath);
  }

  if (data.guestbookEntryId) {
    const entry = await prisma.guestbookEntry.findUnique({
      where: { id: data.guestbookEntryId },
      include: { shop: { select: { slug: true, ownerId: true } }, author: true },
    });
    if (entry) {
      const notifyId = data.parentId
        ? (
            await prisma.comment.findUnique({
              where: { id: data.parentId },
              select: { authorId: true },
            })
          )?.authorId
        : entry.authorId;
      if (notifyId && notifyId !== user.id) {
        await createNotification({
          userId: notifyId,
          type: "REPLY",
          actorId: user.id,
          href: `/shop/${entry.shop.slug}`,
          body: "回复了你的店铺留言",
        });
      }
      if (!data.parentId && entry.shop.ownerId !== user.id && entry.shop.ownerId !== entry.authorId) {
        await createNotification({
          userId: entry.shop.ownerId,
          type: "COMMENT",
          actorId: user.id,
          href: `/shop/${entry.shop.slug}`,
          body: "在你的店铺留言",
        });
      }
      revalidatePath(`/shop/${entry.shop.slug}`);
    }
  }

  if (data.streetMessageId) {
    const msg = await prisma.streetMessage.findUnique({
      where: { id: data.streetMessageId },
      include: { street: { select: { slug: true } }, author: true },
    });
    if (msg) {
      const notifyId = data.parentId
        ? (
            await prisma.comment.findUnique({
              where: { id: data.parentId },
              select: { authorId: true },
            })
          )?.authorId
        : msg.authorId;
      if (notifyId && notifyId !== user.id) {
        await createNotification({
          userId: notifyId,
          type: "REPLY",
          actorId: user.id,
          href: `/street/${msg.street.slug}`,
          body: "回复了你的街道留言",
        });
      }
      revalidateStreet(msg.street.slug);
    }
  }

  return { ok: true, data: { id: comment.id } };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: { select: { id: true, type: true } },
      guestbookEntry: { include: { shop: { select: { slug: true } } } },
      streetMessage: { include: { street: { select: { slug: true } } } },
    },
  });
  if (!comment) return { ok: false, error: "评论不存在" };

  const isAdmin = user.role === "ADMIN";
  if (comment.authorId !== user.id && !isAdmin) {
    return { ok: false, error: "无权删除" };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  if (comment.postId && comment.post) {
    revalidatePath(getPostDetailPath(comment.postId, comment.post.type));
  }
  if (comment.guestbookEntry) {
    revalidatePath(`/shop/${comment.guestbookEntry.shop.slug}`);
  }
  if (comment.streetMessage) {
    revalidateStreet(comment.streetMessage.street.slug);
  }

  return { ok: true };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });

  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  return { ok: true };
}

export async function loadMoreNotifications(cursor: string) {
  const user = await getSessionUser();
  if (!user) return { items: [], nextCursor: null };

  const { getNotifications } = await import("@/lib/queries");
  return getNotifications(user.id, 20, cursor);
}

export async function loadMoreFollowingFeed(cursor: string) {
  const user = await getSessionUser();
  if (!user) return { items: [], nextCursor: null, likedPostIds: [] as string[] };

  const { getFollowingFeed } = await import("@/lib/queries");
  const result = await getFollowingFeed(user.id, 20, cursor);
  const momentIds = result.items
    .filter((p) => p.type === "MOMENT")
    .map((p) => p.id);
  const likedRows =
    momentIds.length > 0
      ? await prisma.like.findMany({
          where: { userId: user.id, postId: { in: momentIds } },
          select: { postId: true },
        })
      : [];
  return {
    ...result,
    likedPostIds: likedRows.map((r) => r.postId),
  };
}

export async function loadMorePostComments(postId: string, cursor: string) {
  const { getPostComments } = await import("@/lib/queries");
  return getPostComments(postId, 20, cursor);
}

export async function loadMoreUserPosts(
  username: string,
  cursor: string,
  type?: "ARTICLE" | "MOMENT",
) {
  const { getUserPosts } = await import("@/lib/queries");
  return getUserPosts(username, 20, cursor, type);
}

export async function loadMoreStreetFeed(streetId: string, cursor: string) {
  const { getStreetFeed } = await import("@/lib/queries");
  return getStreetFeed(streetId, 20, cursor);
}

export async function loadMoreFollowers(userId: string, cursor: string) {
  const { getFollowers } = await import("@/lib/queries");
  return getFollowers(userId, 20, cursor);
}

export async function loadMoreFollowing(userId: string, cursor: string) {
  const { getFollowing } = await import("@/lib/queries");
  return getFollowing(userId, 20, cursor);
}

export async function followRecommendedUsers(
  userIds: string[],
): Promise<ActionResult<{ count: number }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const targets = userIds.filter((id) => id !== user.id).slice(0, 10);
  if (targets.length === 0) return { ok: true, data: { count: 0 } };

  const existing = await prisma.follow.findMany({
    where: { followerId: user.id, followingId: { in: targets } },
    select: { followingId: true },
  });
  const existingSet = new Set(existing.map((f) => f.followingId));
  const toFollow = targets.filter((id) => !existingSet.has(id));

  if (toFollow.length > 0) {
    await prisma.follow.createMany({
      data: toFollow.map((followingId) => ({
        followerId: user.id,
        followingId,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/feed");
  return { ok: true, data: { count: toFollow.length } };
}

export async function toggleLike(postId: string): Promise<ActionResult<{ liked: boolean; count: number }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "请先登录" };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { type: true, authorId: true },
  });
  if (!post || post.type !== "MOMENT") {
    return { ok: false, error: "只能给短文点赞" };
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { userId_postId: { userId: user.id, postId } },
    });
  } else {
    await prisma.like.create({
      data: { userId: user.id, postId },
    });
    if (post.authorId !== user.id) {
      await createNotification({
        userId: post.authorId,
        type: "LIKE",
        actorId: user.id,
        href: `/moment/${postId}`,
        body: "赞了你的短文",
      });
    }
  }

  const count = await prisma.like.count({ where: { postId } });
  revalidatePath("/feed");
  revalidatePath(`/moment/${postId}`);
  return { ok: true, data: { liked: !existing, count } };
}
