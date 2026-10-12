export const site = {
  name: "李逸辰的部落格",
  author: "李逸辰",
  description: "记录技术探索，也收藏生活里的微小光亮。",
  greeting: "在代码与生活之间，",
  tagline: "慢慢探索，认真记录。",
  announcement: "这里是部落格的第一版。愿每一次记录，都让想法更清晰一点。",
  startedAt: "2026-10-12",
  pageSize: 9,
  momentPageSize: 20,
  email: "",
  socials: [] as { name: string; url: string }[],
};
export const categories = [
  {
    id: "engineering",
    name: "技术探索",
    description: "把问题拆开，把答案写下来。",
  },
  {
    id: "notes",
    name: "思考随笔",
    description: "给尚未成形的想法，留一点空间。",
  },
  {
    id: "life",
    name: "生活片段",
    description: "在平凡的日子里，发现值得收藏的瞬间。",
  },
];
export const tags = [
  { id: "astro", name: "Astro" },
  { id: "frontend", name: "前端开发" },
  { id: "design", name: "设计" },
  { id: "writing", name: "写作" },
  { id: "life", name: "日常" },
  { id: "tools", name: "工具" },
];
export const categoryName = (id: string) =>
  categories.find((c) => c.id === id)?.name || id;
export const tagName = (id: string) =>
  tags.find((c) => c.id === id)?.name || id;
