"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/actions/auth-nav";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/social/NotificationBell";

type MeData = {
  user: {
    username: string;
    role: string;
  };
  residence: {
    shop?: { slug: string };
    apartmentUnit?: { id: string };
  } | null;
};

export function HeaderUserNav() {
  const [me, setMe] = useState<MeData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setMe(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <span className="h-4 w-24 animate-pulse rounded bg-stone-200" />;
  }

  if (!me?.user) {
    return (
      <>
        <Link href="/login" className="hover:text-stone-900">
          登录
        </Link>
        <Link
          href="/register"
          className="rounded bg-stone-800 px-3 py-1 text-white hover:bg-stone-700"
        >
          邀请码注册
        </Link>
      </>
    );
  }

  const { user, residence } = me;

  return (
    <>
      <Link href="/feed" className="hover:text-stone-900">
        街坊动态
      </Link>
      {residence?.shop && (
        <Link href={`/shop/${residence.shop.slug}`} className="text-accent hover:underline">
          我的店铺
        </Link>
      )}
      {residence?.apartmentUnit && (
        <Link
          href={`/apartment/${residence.apartmentUnit.id}`}
          className="text-accent hover:underline"
        >
          我的公寓
        </Link>
      )}
      {!residence?.shop && !residence?.apartmentUnit && (
        <Link href="/guide" className="text-amber-700 hover:underline">
          选地盘
        </Link>
      )}
      <Link href="/write/article" className="hover:text-stone-900">
        写长文
      </Link>
      <Link href="/write/moment" className="hover:text-stone-900">
        发短文
      </Link>
      <NotificationBell />
      <Link href={`/u/${user.username}`} className="hover:text-stone-900">
        我的主页
      </Link>
      {user.role === "ADMIN" && (
        <Link href="/admin/invites" className="hover:text-stone-900">
          邀请码
        </Link>
      )}
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          退出
        </Button>
      </form>
    </>
  );
}
