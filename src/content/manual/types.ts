export type ManualLink = {
  href: string;
  label: string;
};

export type ManualSection = {
  title: string;
  paragraphs?: string[];
  steps?: string[];
  note?: string;
  links?: ManualLink[];
};

export type ManualChapterMeta = {
  slug: string;
  title: string;
  summary: string;
  order: number;
  adminOnly?: boolean;
};

export type ManualChapterContent = {
  slug: string;
  intro: string;
  sections: ManualSection[];
  relatedLinks: ManualLink[];
};
