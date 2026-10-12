import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
async function walk(dir) {
  const out = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) out.push(...(await walk(p)));
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}
const files = await walk("dist");
let count = 0;
const errors = [];
for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const link = m[1].split(/[?#]/)[0];
    if (!link.startsWith("/") || link.startsWith("//")) continue;
    const relative = decodeURIComponent(link.slice(base.length)).replace(
      /^\//,
      "",
    );
    let target = join("dist", relative);
    try {
      if ((await stat(target)).isDirectory())
        target = join(target, "index.html");
      await stat(target);
      count++;
    } catch {
      errors.push(`${file}: ${link}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `静态链接检查通过：${files.length} 个页面，${count} 个本地链接与资源。`,
);
