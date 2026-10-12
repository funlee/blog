import { spawnSync } from "node:child_process";
const result = spawnSync(
  "pagefind",
  ["--site", "dist", "--force-language", "zh-cn"],
  { stdio: "inherit", shell: false },
);
process.exit(result.status ?? 1);
