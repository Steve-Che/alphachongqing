"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPathBubbleLabel } from "@/lib/street-activity";
import type { StreetPathBubble } from "@/lib/street-types";

type StreetPathChatProps = {
  streetSlug: string;
  initialBubbles: StreetPathBubble[];
};

export function StreetPathChat({
  streetSlug,
  initialBubbles,
}: StreetPathChatProps) {
  const [bubbles, setBubbles] = useState(initialBubbles);

  useEffect(() => {
    setBubbles(initialBubbles);
  }, [initialBubbles]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/street/${encodeURIComponent(streetSlug)}/activity`);
        if (!res.ok) return;
        const data = (await res.json()) as { pathBubbles: StreetPathBubble[] };
        setBubbles(data.pathBubbles);
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [streetSlug]);

  if (bubbles.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-stone-300 bg-[#e8dfd0] px-4 py-6">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #c9b89a 0, #c9b89a 12px, transparent 12px, transparent 24px)",
          }}
          aria-hidden
        />
        <p className="relative text-center text-sm text-stone-600">
          街上还很安静，
          <Link href="#street-messages" className="text-[#b84a2f] hover:underline">
            来留第一条言
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-stone-300 bg-[#e8dfd0] px-2 py-8">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #c9b89a 0, #c9b89a 14px, transparent 14px, transparent 28px)",
        }}
        aria-hidden
      />
      <div className="relative flex min-h-[72px] flex-wrap items-center justify-center gap-3">
        {bubbles.slice(0, 8).map((bubble, i) => (
          <div
            key={bubble.id}
            className={`street-bubble-enter max-w-[200px] rounded-full border px-3 py-1.5 text-xs shadow-sm ${
              bubble.isOfficial
                ? "border-[#b84a2f]/40 bg-amber-50 text-amber-950"
                : "border-stone-200 bg-white text-stone-700"
            }`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {formatPathBubbleLabel(
              bubble.authorName,
              bubble.content,
              bubble.isOfficial,
            )}
          </div>
        ))}
      </div>
      <p className="relative mt-3 text-center text-[11px] text-stone-500">
        <Link href="#street-messages" className="hover:text-[#b84a2f] hover:underline">
          查看全部街道留言 →
        </Link>
      </p>
    </div>
  );
}
