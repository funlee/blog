import { writeFile, mkdir } from "node:fs/promises";
const [kind, slug, title] = process.argv.slice(2);
if (
  !["post", "moment"].includes(kind) ||
  !slug ||
  !title ||
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
) {
  console.error('用法: npm run new -- post|moment english-slug "标题"');
  process.exit(1);
}
const dir = `src/content/${kind === "post" ? "posts" : "moments"}`;
await mkdir(dir, { recursive: true });
const front =
  kind === "post"
    ? `slug: ${slug}\ntitle: ${JSON.stringify(title)}\ndescription: ""\ncategory: notes\ntags: [writing]\n`
    : "images: []\n";
await writeFile(
  `${dir}/${slug}.md`,
  `---\n${front}publishedAt: "${new Date().toISOString()}"\ndraft: true\n---\n\n${title}\n`,
  { flag: "wx" },
);
console.log(`已创建草稿：${dir}/${slug}.md`);
