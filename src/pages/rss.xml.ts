import rss from "@astrojs/rss";
import { posts, url } from "../lib/content";
import { site } from "../config/site";
import type { APIContext } from "astro";
export async function GET(context: APIContext) {
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: (await posts())
      .slice(0, 50)
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: new Date(p.data.publishedAt),
        link: url(`posts/${p.data.slug}/`),
      })),
    customData: "<language>zh-cn</language>",
  });
}
