import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { AuthorLink } from "@/components/social/AuthorLink";
import { PostImage } from "@/components/ui/post-image";
import type { StreetFeedItem } from "@/lib/queries";

export function StreetFeed({ items }: { items: StreetFeedItem[] }) {
  if (items.length === 0) {
    return <p className="text-stone-500">本街还很安静，来发第一条动态吧。</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={`${item.kind}-${item.id}`}
          className="rounded border border-stone-200 bg-paper px-4 py-3"
        >
          {item.kind === "moment" && (
            <>
              <p className="whitespace-pre-wrap text-stone-800">{item.body}</p>
              {item.images && item.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.images.map((img) => (
                    <PostImage key={img.url} src={img.url} alt="" className="h-20 w-20 rounded object-cover" />
                  ))}
                </div>
              )}
            </>
          )}
          {item.kind === "shop" && (
            <p className="text-stone-800">
              新开店：
              <Link href={`/shop/${item.shopSlug}`} className="text-accent hover:underline">
                {item.shopName}
              </Link>
            </p>
          )}
          {item.kind === "apartment" && (
            <p className="text-stone-800">
              新入住：
              <Link href={`/apartment/${item.unitId}`} className="text-accent hover:underline">
                {item.buildingNumber} 号楼 {item.unitNumber} 室
              </Link>
            </p>
          )}
          <p className="mt-1 text-xs text-stone-400">
            {item.author && (
              <>
                <AuthorLink author={item.author} className="text-stone-500 hover:text-accent" />
                {" · "}
              </>
            )}
            {formatDate(item.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
