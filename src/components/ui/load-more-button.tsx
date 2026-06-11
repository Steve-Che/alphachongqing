"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type LoadResult<T> = { items: T[]; nextCursor: string | null };

export function LoadMoreButton<T extends { id: string }>({
  initialItems,
  initialCursor,
  loadMore,
  renderItem,
  listClassName = "space-y-4",
  emptyMessage = "暂无内容。",
}: {
  initialItems: T[];
  initialCursor: string | null;
  loadMore: (cursor: string) => Promise<LoadResult<T>>;
  renderItem: (item: T) => React.ReactNode;
  listClassName?: string;
  emptyMessage?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return <p className="text-stone-500">{emptyMessage}</p>;
  }

  return (
    <div>
      <ul className={listClassName}>{items.map(renderItem)}</ul>
      {cursor && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await loadMore(cursor);
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
