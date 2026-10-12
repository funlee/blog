import { getCollection } from "astro:content";
import { published, validateSlugs } from "./core.mjs";
export async function posts() {
  const all = await getCollection("posts");
  validateSlugs(all);
  return published(all) as typeof all;
}
export async function moments() {
  const all = await getCollection("moments");
  return published(all) as typeof all;
}
export const url = (path = "") =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
export const date = (d: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(new Date(d))
    .replaceAll("/", ".");
