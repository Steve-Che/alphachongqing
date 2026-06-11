import Link from "next/link";

type StreetCenterPlazaCardProps = {
  streetName: string;
  streetSlug: string;
};

export function StreetCenterPlazaCard({
  streetName,
  streetSlug,
}: StreetCenterPlazaCardProps) {
  return (
    <article className="relative shrink-0 snap-center">
      <div className="flex w-[168px] flex-col overflow-hidden rounded-lg border border-amber-300/60 bg-gradient-to-b from-amber-50 to-[#faf6ee] shadow-sm sm:w-[188px]">
        <div className="relative flex aspect-[4/3] flex-col items-center justify-center px-3 text-center">
          <span className="text-2xl" aria-hidden>
            ◎
          </span>
          <h3 className="mt-1 font-serif text-sm font-semibold text-amber-900">
            街心广场
          </h3>
          <p className="mt-0.5 text-[10px] text-amber-800/80">{streetName}</p>
        </div>
        <div className="border-t border-amber-200/60 px-3 py-2 text-center">
          <Link
            href={`/street/${streetSlug}#moment-composer`}
            className="text-[11px] text-[#b84a2f] hover:underline"
          >
            来广场发短文 →
          </Link>
        </div>
      </div>
    </article>
  );
}
