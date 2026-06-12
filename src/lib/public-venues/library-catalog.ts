/** 公版书站内 Markdown 路径（相对 src/content/public-domain/） */
export type LibraryBookMeta = {
  slug: string;
  title: string;
  author: string;
  language: string;
  source: string;
  sourceUrl?: string;
  contentPath: string;
  sortOrder: number;
  excerpt?: string;
};

export const LIBRARY_BOOKS: LibraryBookMeta[] = [
  {
    slug: "kong-yiji",
    title: "孔乙己",
    author: "鲁迅",
    language: "zh",
    source: "公版",
    sourceUrl: "https://zh.wikisource.org/wiki/孔乙己",
    contentPath: "kong-yiji.md",
    sortOrder: 0,
    excerpt: "鲁镇的酒店的格局，是和别处不同的……",
  },
  {
    slug: "my-old-home",
    title: "故乡",
    author: "鲁迅",
    language: "zh",
    source: "公版",
    sourceUrl: "https://zh.wikisource.org/wiki/故乡",
    contentPath: "my-old-home.md",
    sortOrder: 1,
    excerpt: "我冒了严寒，回到相隔二千余里，别了二十余年的故乡去。",
  },
  {
    slug: "journey-west-excerpt",
    title: "西游记（节选）",
    author: "吴承恩",
    language: "zh",
    source: "公版",
    sourceUrl: "https://www.gutenberg.org/ebooks/23962",
    contentPath: "journey-west-excerpt.md",
    sortOrder: 2,
    excerpt: "盖闻天地之数，有十二万九千六百岁为一元。",
  },
  {
    slug: "dream-red-excerpt",
    title: "红楼梦（节选）",
    author: "曹雪芹",
    language: "zh",
    source: "公版",
    sourceUrl: "https://zh.wikisource.org/wiki/红楼梦",
    contentPath: "dream-red-excerpt.md",
    sortOrder: 3,
    excerpt: "此开卷第一回也。作者自云：曾历过一番梦幻之后。",
  },
  {
    slug: "border-town-excerpt",
    title: "边城（节选）",
    author: "沈从文",
    language: "zh",
    source: "公版",
    contentPath: "border-town-excerpt.md",
    sortOrder: 4,
    excerpt: "由四川过湖南去，靠东有一条官路。",
  },
  {
    slug: "poems-tang",
    title: "唐诗选（公版）",
    author: "Various",
    language: "zh",
    source: "公版",
    contentPath: "poems-tang.md",
    sortOrder: 5,
    excerpt: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
  },
  {
    slug: "pride-prejudice-excerpt",
    title: "Pride and Prejudice (Excerpt)",
    author: "Jane Austen",
    language: "en",
    source: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/1342",
    contentPath: "pride-prejudice-excerpt.md",
    sortOrder: 6,
    excerpt: "It is a truth universally acknowledged...",
  },
];

export function getLibraryBook(slug: string): LibraryBookMeta | undefined {
  return LIBRARY_BOOKS.find((b) => b.slug === slug);
}
