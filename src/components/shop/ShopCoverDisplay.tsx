import Image from "next/image";
import { getShopDisplayStyle } from "@/lib/shop-decor";

type ShopCoverDisplayProps = {
  shopId: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  sizes?: string;
  banner?: boolean;
};

export function ShopCoverDisplay({
  shopId,
  name,
  coverUrl,
  className = "",
  sizes = "188px",
  banner = false,
}: ShopCoverDisplayProps) {
  const display = getShopDisplayStyle(coverUrl, shopId, name);
  const heightClass = banner ? "h-40 sm:h-48" : "absolute inset-0";

  if (display.type === "image") {
    if (banner) {
      return (
        <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
          <Image
            src={display.url}
            alt={`${name} 门头`}
            width={800}
            height={300}
            className="h-40 w-full object-cover sm:h-48"
            unoptimized
          />
        </div>
      );
    }
    return (
      <Image
        src={display.url}
        alt={name}
        fill
        className={`object-cover ${className}`}
        sizes={sizes}
        unoptimized
      />
    );
  }

  const { decor } = display;
  return (
    <div
      className={`flex items-center justify-center ${heightClass} ${className}`}
      style={{ background: decor.background }}
    >
      <span
        className={`font-serif font-semibold text-white drop-shadow ${
          banner ? "text-5xl sm:text-6xl" : "text-4xl"
        }`}
        style={{ textShadow: `0 2px 8px ${decor.accent}88` }}
      >
        {decor.initial}
      </span>
    </div>
  );
}
