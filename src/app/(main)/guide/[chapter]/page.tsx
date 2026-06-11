import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  MANUAL_CHAPTERS,
  getChapterContent,
  getChapterMeta,
  getVisibleChapters,
} from "@/content/manual";
import { ManualLayout } from "@/components/guide/ManualLayout";
import { ManualChapterPage } from "@/components/guide/ManualChapterPage";

type Props = {
  params: Promise<{ chapter: string }>;
};

export function generateStaticParams() {
  return MANUAL_CHAPTERS.map((chapter) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: slug } = await params;
  const meta = getChapterMeta(slug);
  if (!meta) return { title: "街坊手册" };
  return {
    title: `${meta.title} — 街坊手册`,
    description: meta.summary,
  };
}

export default async function GuideChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const meta = getChapterMeta(slug);
  if (!meta) notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (meta.adminOnly && !isAdmin) {
    redirect("/guide");
  }

  const content = getChapterContent(slug);
  if (!content) notFound();

  const chapters = getVisibleChapters(isAdmin);

  return (
    <ManualLayout chapters={chapters}>
      <ManualChapterPage content={content} chapterTitle={meta.title} />
    </ManualLayout>
  );
}
