"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "地图", icon: "🗺", ariaLabel: "城市地图" },
  { href: "/feed", label: "动态", icon: "📰", ariaLabel: "街坊动态", loginRequired: true },
  { href: "/write/moment", label: "写作", icon: "✎", ariaLabel: "发短文" },
  { href: "/settings", label: "我的", icon: "👤", ariaLabel: "我的主页", fallback: "/login" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUsername(data?.user?.username ?? null));
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-[#f7f4ef] md:hidden">
      <ul className="flex justify-around py-2">
        {TABS.map((tab) => {
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
            (tab.href === "/feed" && pathname.startsWith("/feed")) ||
            (tab.href === "/write/moment" && pathname.startsWith("/write"));

          return (
            <li key={tab.href}>
              <Link
                href={href}
                aria-label={tab.ariaLabel ?? tab.label}
                className={cn(
                  "flex flex-col items-center px-3 text-xs",
                  active ? "text-stone-900" : "text-stone-500",
                )}
              >
                <span className="text-base" aria-hidden>
                  {tab.icon}
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
