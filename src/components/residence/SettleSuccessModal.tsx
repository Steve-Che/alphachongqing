"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SettleSuccessModal({
  open,
  onClose,
  type,
  links,
}: {
  open: boolean;
  onClose: () => void;
  type: "shop" | "apartment";
  links: {
    primary: { href: string; label: string };
    secondary: { href: string; label: string };
    tertiary?: { href: string; label: string };
  };
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-paper p-6 shadow-lg">
        <h2 className="font-serif text-xl font-semibold">
          {type === "shop" ? "店铺开业啦！" : "欢迎入住！"}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {type === "shop"
            ? "你的小店已在街上亮灯。接下来可以写长文、布置房间，或逛逛同街街坊。"
            : "这间公寓是你的安静角落。发一条本街短文，或去街坊动态看看邻居们在聊什么。"}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={links.primary.href}>
            <Button className="w-full" onClick={onClose}>
              {links.primary.label}
            </Button>
          </Link>
          <Link href={links.secondary.href}>
            <Button variant="outline" className="w-full" onClick={onClose}>
              {links.secondary.label}
            </Button>
          </Link>
          {links.tertiary && (
            <Link href={links.tertiary.href} className="text-center text-sm text-accent hover:underline">
              {links.tertiary.label}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-stone-400 hover:text-stone-600"
        >
          稍后再说
        </button>
      </div>
    </div>
  );
}
