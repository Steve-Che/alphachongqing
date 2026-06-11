"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type LoadResult<T> = { items: T[]; nextCursor: string | null };

export function LoadMoreFooter({
  hasMore,
  loading,
  onLoadMore,
  label = "加载更多",
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void | Promise<void>;
  label?: string;
}) {
  if (!hasMore) return null;

  return (
    <div className="mt-4 text-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        aria-busy={loading}
        onClick={onLoadMore}
      >
        {loading ? "加载中…" : label}
      </Button>
    </div>
  );
}

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
      <LoadMoreFooter
        hasMore={!!cursor}
        loading={loading}
        onLoadMore={async () => {
          if (!cursor) return;
          setLoading(true);
          const result = await loadMore(cursor);
          setItems((prev) => [...prev, ...result.items]);
          setCursor(result.nextCursor);
          setLoading(false);
        }}
      />
    </div>
  );
}
