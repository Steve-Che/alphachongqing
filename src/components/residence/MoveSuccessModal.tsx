"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MoveSuccessModal({
  open,
  onClose,
  type,
  message,
  primaryHref,
  primaryLabel,
}: {
  open: boolean;
  onClose: () => void;
  type: "shop" | "apartment";
  message: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-paper p-6 shadow-lg">
        <h2 className="font-serif text-xl font-semibold">
          {type === "shop" ? "店铺搬家完成" : "公寓搬家完成"}
        </h2>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={primaryHref}>
            <Button className="w-full" onClick={onClose}>
              {primaryLabel}
            </Button>
          </Link>
          <Link href="/#map">
            <Button variant="outline" className="w-full" onClick={onClose}>
              返回城市地图
            </Button>
          </Link>
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
