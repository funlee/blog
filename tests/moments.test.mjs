import test from 'node:test';
import assert from 'node:assert/strict';
import { momentYears } from '../src/lib/moments.mjs';
import { published, paginate, paginationWindow } from '../src/lib/core.mjs';

test('年份按上海时间和时间线展示日期分组，年份倒序且保留同日多条', () => {
  const items = [
    { id: 'a', data: { publishedAt: '2023-12-31T16:00:00Z' } },
    { id: 'b', data: { publishedAt: '2023-12-31T15:59:59Z' } },
    { id: 'c', data: { publishedAt: '2020-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00+08:00' } },
  ];
  const groups = momentYears(items);
  assert.deepEqual(groups.map(([year, entries]) => [year, entries.map(e => e.id)]), [
    ['2024', ['a', 'c']], ['2023', ['b']],
  ]);
  assert.deepEqual(momentYears([]), []);
});

test('年份筛选覆盖全部分页，只包含已发布内容', () => {
  const items = Array.from({ length: 23 }, (_, i) => ({
    id: String(i), data: { publishedAt: '2020-06-01T00:00:00+08:00' },
  }));
  items.push({ id: 'draft', data: { publishedAt: '2019-01-01T00:00:00Z', draft: true } });
  items.push({ id: 'future', data: { publishedAt: '2099-01-01T00:00:00Z' } });
  const groups = momentYears(published(items, Date.parse('2026-01-01T00:00:00Z')));
  assert.equal(groups.length, 1);
  assert.equal(groups[0][0], '2020');
  assert.deepEqual(paginate(groups[0][1], 20).map(p => p.length), [20, 3]);
});


test('大量碎碎念分页显示首尾和当前页，保留相邻页入口', () => {
  assert.deepEqual(paginationWindow(1, 50), [1, 2, null, 50]);
  assert.deepEqual(paginationWindow(25, 50), [1, null, 24, 25, 26, null, 50]);
  assert.deepEqual(paginationWindow(50, 50), [1, null, 49, 50]);
  assert.deepEqual(paginationWindow(4, 5), [1, 2, 3, 4, 5]);
});
