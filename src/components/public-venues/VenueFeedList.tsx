"use client";

import { useState } from "react";
import { loadMoreVenueFeed } from "@/app/actions/public-venues";
import { AuthorLink } from "@/components/social/AuthorLink";
import { FormattedTime } from "@/components/ui/formatted-time";
import { Button } from "@/components/ui/button";

type FeedItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { username: string; displayName: string | null; avatarUrl: string | null };
  images: { url: string }[];
};

export function VenueFeedList({
  venueId,
  initialItems,
  initialCursor,
}: {
  venueId: string;
  initialItems: FeedItem[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return <p className="text-sm text-stone-500">暂无场馆动态，来发第一条吧。</p>;
  }

  return (
    <div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded border border-stone-200 bg-paper px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <AuthorLink author={item.author} />
              <span className="text-stone-400">·</span>
              <FormattedTime date={item.createdAt} className="text-stone-400" />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-stone-800">{item.body}</p>
            {item.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.images.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt=""
                    className="h-24 rounded object-cover"
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {cursor && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await loadMoreVenueFeed(venueId, cursor);
              setItems((prev) => [...prev, ...result.items]);
              setCursor(result.nextCursor);
              setLoading(false);
            }}
          >
            {loading ? "加载中…" : "加载更多"}
          </Button>
        </div>
      )}
    </div>
  );
}
