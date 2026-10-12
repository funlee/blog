import { test } from "node:test";
import assert from "node:assert/strict";
import {
  published,
  paginate,
  homeOrder,
  validateSlugs,
  reading,
} from "../src/lib/core.mjs";
const post = (id, date, draft = false, pinned = 0) => ({
  id,
  data: { slug: id, publishedAt: date, draft, pinned },
});
test("统一隐藏草稿和未来文章，按时间排序", () => {
  const list = [
    post("old", "2026-01-01"),
    post("draft", "2026-02-01", true),
    post("future", "2030-01-01"),
    post("new", "2026-03-01"),
  ];
  assert.deepEqual(
    published(list, Date.parse("2026-10-12")).map((p) => p.id),
    ["new", "old"],
  );
});
test("分页边界与空内容", () => {
  for (const [n, pages] of [
    [0, 1],
    [1, 1],
    [9, 1],
    [10, 2],
    [19, 3],
  ]) {
    const a = Array.from({ length: n }, (_, i) => i);
    const result = paginate(a, 9);
    assert.equal(result.length, pages);
    assert.deepEqual(result.flat(), a);
  }
  assert.equal(paginate(Array(21), 20).length, 2);
});
test("置顶只影响首页且不修改源数组", () => {
  const list = [
    post("new", "2026-10-10"),
    post("pinned", "2026-01-01", false, 1),
  ];
  assert.equal(homeOrder(list)[0].id, "pinned");
  assert.equal(list[0].id, "new");
});
test("重复链接阻止构建", () =>
  assert.throws(
    () =>
      validateSlugs([post("same", "2026-01-01"), post("same", "2026-02-01")]),
    /重复/,
  ));
test("阅读时间排除代码并计算中文英文", () =>
  assert.deepEqual(reading('你好 world\n```ts\nconsole.log("test")\n```'), {
    words: 3,
    minutes: 1,
  }));
