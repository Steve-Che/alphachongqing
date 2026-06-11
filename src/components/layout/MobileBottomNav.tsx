"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Map, Newspaper, PenLine, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";
import { NotificationBadge } from "@/components/social/NotificationBadge";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  ariaLabel: string;
  loginRequired?: boolean;
  fallback?: string;
  matchPrefix?: string;
};

const TABS: Tab[] = [
  { href: "/", label: "地图", icon: Map, ariaLabel: "城市地图" },
  {
    href: "/feed",
    label: "动态",
    icon: Newspaper,
    ariaLabel: "街坊动态",
    loginRequired: true,
    matchPrefix: "/feed",
  },
  {
    href: "/write/moment",
    label: "写作",
    icon: PenLine,
    ariaLabel: "发短文",
    matchPrefix: "/write",
  },
  {
    href: "/notifications",
    label: "通知",
    icon: Bell,
    ariaLabel: "通知",
    loginRequired: true,
    matchPrefix: "/notifications",
  },
  {
    href: "/settings",
    label: "我的",
    icon: User,
    ariaLabel: "我的主页",
    fallback: "/login",
    matchPrefix: "/u/",
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const unread = useUnreadNotificationCount();
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUsername(data?.user?.username ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-[#f7f4ef] md:hidden">
      <ul className="flex justify-around py-2">
        {TABS.map((tab) => {
          if (!loaded && tab.href === "/settings") {
            return (
              <li key={tab.href}>
                <span className="flex flex-col items-center px-2 text-xs text-stone-300">
                  <span className="mb-0.5 h-5 w-5 animate-pulse rounded bg-stone-200" />
                  {tab.label}
                </span>
              </li>
            );
          }

          let href =
            tab.href === "/settings"
              ? username
                ? `/u/${username}`
                : tab.fallback ?? "/login"
              : tab.href;

          if (tab.loginRequired && !username) {
            href = `/login?callbackUrl=${encodeURIComponent(tab.href)}`;
          }

          const active =
            pathname === href ||
            (tab.matchPrefix && pathname.startsWith(tab.matchPrefix)) ||
            (tab.href === "/settings" && username && pathname === `/u/${username}`);

          const isNotifications = tab.href === "/notifications";

          return (
            <li key={tab.href}>
              <Link
                href={href}
                aria-label={
                  isNotifications && unread > 0
                    ? `${tab.ariaLabel}，${unread} 条未读`
                    : tab.ariaLabel ?? tab.label
                }
                className={cn(
                  "relative flex flex-col items-center px-2 text-xs",
                  active ? "text-stone-900" : "text-stone-500",
                )}
              >
                <span className="relative mb-0.5">
                  <Icon icon={tab.icon} size={20} />
                  {isNotifications && <NotificationBadge count={unread} />}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
