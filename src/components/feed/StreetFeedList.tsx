"use client";

import { useState } from "react";
import { StreetFeed } from "@/components/feed/StreetFeed";
import { Button } from "@/components/ui/button";
import { loadMoreStreetFeed } from "@/app/actions/social";
import type { StreetFeedItem } from "@/lib/queries";

export function StreetFeedList({
  streetId,
  initialItems,
  initialCursor,
  streetSlug,
}: {
  streetId: string;
  initialItems: StreetFeedItem[];
  initialCursor: string | null;
  streetSlug: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <StreetFeed items={items} streetSlug={streetSlug} />
      {cursor && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await loadMoreStreetFeed(streetId, cursor);
              setItems((prev) => [...prev, ...result.items]);
              setCursor(result.nextCursor);
              setLoading(false);
            }}
          >
            {loading ? "加载中…" : "加载更多动态"}
          </Button>
        </div>
      )}
    </div>
  );
}
