import Link from "next/link";

type Street = {
  id: string;
  slug: string;
  nameZh: string;
};

type District = {
  slug: string;
  nameZh: string;
  summary: string | null;
  streets: Street[];
};

export function DistrictList({ districts }: { districts: District[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {districts.map((d) => (
        <section
          key={d.slug}
          className="rounded border border-stone-200 bg-paper p-4"
        >
          <Link
            href={`/district/${d.slug}`}
            className="font-serif text-lg font-semibold text-stone-900 hover:text-accent"
          >
            {d.nameZh}
          </Link>
          {d.summary && (
            <p className="mt-1 text-sm text-stone-500">{d.summary}</p>
          )}
          <ul className="mt-3 space-y-1 text-sm">
            {d.streets.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/street/${s.slug}`}
                  className="text-stone-600 hover:text-stone-900"
                >
                  {s.nameZh}
                </Link>
              </li>
            ))}
            {d.streets.length > 4 && (
              <li className="text-stone-400">
                还有 {d.streets.length - 4} 条街道…
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
