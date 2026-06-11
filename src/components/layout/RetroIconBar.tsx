"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  LogOut,
  Mail,
  Settings,
  User,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth-nav";
import { useUnreadMessageCount } from "@/hooks/use-unread-message-count";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";

type MeData = {
  user: { username: string };
} | null;

function IconButton({
  href,
  label,
  children,
  badge,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#b84a2f]/30 bg-[#c45c3e] text-white shadow-sm transition hover:bg-[#b84a2f]"
      aria-label={label}
      title={label}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-bold text-stone-900">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function RetroIconBar() {
  const [me, setMe] = useState<MeData>(null);
  const [loaded, setLoaded] = useState(false);
  const loggedIn = !!me?.user;
  const notifyCount = useUnreadNotificationCount();
  const { count: messageCount } = useUnreadMessageCount(loggedIn);

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
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-9 w-9 animate-pulse rounded-full bg-stone-200"
          />
        ))}
      </div>
    );
  }

  if (!me?.user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="hover:text-stone-900">
          登录
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-[#c45c3e] px-3 py-1.5 text-white hover:bg-[#b84a2f]"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconButton href="/notifications" label="通知" badge={notifyCount}>
        <Bell className="h-4 w-4" strokeWidth={2} />
      </IconButton>
      <IconButton href="/messages" label="私信" badge={messageCount}>
        <Mail className="h-4 w-4" strokeWidth={2} />
      </IconButton>
      <IconButton href="/favorites" label="收藏">
        <Heart className="h-4 w-4" strokeWidth={2} />
      </IconButton>
      <IconButton href="/settings" label="设置">
        <Settings className="h-4 w-4" strokeWidth={2} />
      </IconButton>
      <IconButton href={`/u/${me.user.username}`} label="我的主页">
        <User className="h-4 w-4" strokeWidth={2} />
      </IconButton>
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b84a2f]/30 bg-[#c45c3e] text-white shadow-sm transition hover:bg-[#b84a2f]"
          aria-label="退出"
          title="退出"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
