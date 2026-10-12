import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readingProgress, markedFinished, latestReading, duration } from '../src/lib/reading.mjs';
const snapshot = JSON.parse(readFileSync(new URL('../src/data/reading.json', import.meta.url), 'utf8'));
test('阅读快照有有效作品和唯一版本，排除公众号', () => {
  assert.ok(snapshot.books.length > 0);
  assert.equal(new Set(snapshot.books.map(b => b.id)).size, snapshot.books.length);
  const versions = snapshot.books.flatMap(b => b.versions);
  assert.equal(new Set(versions.map(v => v.id)).size, versions.length);
  assert.ok(snapshot.books.every(b => b.author !== '公众号'));
  for (const v of versions) {
    assert.ok(Number.isInteger(v.progress) && v.progress >= 0 && v.progress <= 100);
    assert.ok(v.updatedAt === null || /^\d{4}-\d{2}-\d{2}$/.test(v.updatedAt));
    assert.ok(!v.url || new URL(v.url).hostname === 'weread.qq.com');
  }
});
test('合并版本但不把读完标记改写为100%，1表示1%', () => {
  const book = {versions: [{progress: 1, markedFinished: true, updatedAt: '2026-01-01'}, {progress: 61, markedFinished: false, updatedAt: '2026-10-12'}]};
  assert.equal(readingProgress(book), 61);
  assert.equal(markedFinished(book), true);
  assert.equal(latestReading(book), '2026-10-12');
  assert.equal(readingProgress({versions: [book.versions[0]]}), 1);

});
test('月度时长有效，时长以秒换算', () => {
  assert.equal(snapshot.monthlySeconds.length, Number(snapshot.updatedAt.slice(5,7)));
  assert.ok(snapshot.monthlySeconds.every(n => Number.isFinite(n) && n >= 0));
  assert.equal(duration(2183181), '606小时26分钟');
  assert.equal(duration(60), '0小时1分钟');
});
test('公开数据只包含展示字段，不包含鉴权或原始个人记录', () => {
  for (const b of snapshot.books) {
    assert.deepEqual(Object.keys(b).sort(), ['author','category','cover','id','title','versions']);
    for (const v of b.versions) assert.deepEqual(Object.keys(v).sort(), ['id','markedFinished','progress','title','updatedAt','url']);
  }
});
