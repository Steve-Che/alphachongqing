import Link from "next/link";
import type { ManualChapterContent } from "@/content/manual/types";

type Props = {
  content: ManualChapterContent;
  chapterTitle: string;
};

export function ManualChapterPage({ content, chapterTitle }: Props) {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold">{chapterTitle}</h1>
        <p className="mt-3 text-stone-600 leading-relaxed">{content.intro}</p>
      </header>

      {content.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">{section.title}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="text-stone-600 leading-relaxed">
              {p}
            </p>
          ))}
          {section.steps && section.steps.length > 0 && (
            <ol className="list-inside list-decimal space-y-2 text-stone-600">
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {section.note && (
            <p className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-stone-600">
              {section.note}
            </p>
          )}
          {section.links && section.links.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-accent hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {content.relatedLinks.length > 0 && (
        <footer className="rounded-lg border border-stone-200 bg-paper p-4">
          <h3 className="text-sm font-medium text-stone-900">相关链接</h3>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {content.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-accent hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
