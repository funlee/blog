import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { categories, tags } from "./config/site";
const date = z.iso.datetime({ offset: true });
const common = {
  publishedAt: date,
  updatedAt: date.optional(),
  draft: z.boolean().default(false),
  source: z.enum(["yuque", "douban", "juejin", "zhihu"]).optional(),
  sourceId: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourceUrl: z.url().optional(),
};
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z
    .object({
      ...common,
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().trim().min(1),
      description: z.string().default(""),
      category: z
        .string()
        .refine((s) => categories.some((c) => c.id === s), "分类不存在"),
      tags: z
        .array(
          z.string().refine((s) => tags.some((t) => t.id === s), "标签不存在"),
        )
        .default([])
        .transform((a) => [...new Set(a)]),
      cover: z.string().optional(),
      pinned: z.number().default(0),
      featuredOrder: z.number().optional(),
    })
    .refine(
      (d) =>
        !d.updatedAt || Date.parse(d.updatedAt) >= Date.parse(d.publishedAt),
      "更新时间不得早于发布日期",
    ),
});
const moments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/moments" }),
  schema: z.object({
    ...common,
    dateBasis: z.enum(["entry", "source-updated", "source-published"]).optional(),
    dateLabel: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      kind: z.enum(["photo", "cover"]).optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })).default([]),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({ title: z.string() }),
});
export const collections = { posts, moments, pages };
