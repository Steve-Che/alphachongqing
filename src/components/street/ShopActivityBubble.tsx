"use client";

import type { ShopActivityBubble as BubbleData } from "@/lib/street-types";

export function ShopActivityBubble({ activity }: { activity: BubbleData }) {
  if (!activity) return null;

  return (
    <div
      className="street-bubble-enter pointer-events-none absolute -top-2 left-1/2 z-10 max-w-[140px] -translate-x-1/2 -translate-y-full"
      aria-hidden
    >
      <div className="relative rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] leading-snug text-stone-700 shadow-sm">
        <span className="font-medium text-stone-900">{activity.authorName}</span>
        <span className="text-stone-500"> 说：</span>
        {activity.text}
        <span
          className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-stone-200 bg-white"
          aria-hidden
        />
      </div>
    </div>
  );
}
