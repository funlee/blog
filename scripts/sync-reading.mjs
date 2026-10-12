import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

export const SKILL_VERSION = '1.0.5';
const ENDPOINT = 'https://i.weread.qq.com/api/agent/gateway';
const SNAPSHOT = new URL('../src/data/reading.json', import.meta.url);
const RULES = new URL('../src/data/reading-editions.json', import.meta.url);
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const number = (value, field) => {
  ensure(Number.isFinite(value) && value >= 0, `${field} 缺失或无效，停止同步。`);
  return value;
};
export function chinaDate(date) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);
}
function recordDate(timestamp) {
  if (!timestamp) return null;
  number(timestamp, '记录更新时间');
  return chinaDate(new Date(timestamp * 1000));
}
function safeUrl(value, hosts) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.includes(url.hostname) ? url.href : '';
  } catch { return ''; }
}
function hasUpgrade(value) {
  return value && typeof value === 'object' &&
    (Object.hasOwn(value, 'upgrade_info') || Object.values(value).some(hasUpgrade));
}
export function gateway(apiKey, {fetchImpl = fetch, wait = sleep} = {}) {
  ensure(typeof apiKey === 'string' && apiKey.trim(), '未配置 WEREAD_API_KEY。请添加 GitHub Actions repository secret。');
  return async (api, params = {}) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetchImpl(ENDPOINT, {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30_000),
          headers: {'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
          body: JSON.stringify({api_name: api, skill_version: SKILL_VERSION, ...params}),
        });
      } catch {
        if (attempt === 2) throw new Error(`${api} 网络请求失败或超时。`);
        await wait(1000 * 2 ** attempt); continue;
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await wait(1000 * 2 ** attempt); continue;
      }
      ensure(response.ok, `${api} 请求失败（HTTP ${response.status}），请检查密钥及接口状态。`);
      let data;
      try { data = await response.json(); } catch { throw new Error(`${api} 返回了非 JSON 数据。`); }
      ensure(data && typeof data === 'object' && !Array.isArray(data), `${api} 返回结构异常。`);
      ensure(!hasUpgrade(data), `微信读书要求升级 skill（当前 ${SKILL_VERSION}）。请核对官方升级说明并更新同步脚本，停止部署。`);
      // Do not print service response bodies: they can contain private data.
      ensure(data.errcode === undefined || data.errcode === 0, `${api} 返回业务错误，请检查密钥及接口状态。`);
      return data;
    }
  };
}
export async function allNotebooks(call) {
  const books = new Map();
  const cursors = new Set();
  let lastSort;
  let expected;
  for (let page = 0; page < 1000; page++) {
    const data = await call('/user/notebooks', {count: 100, ...(lastSort === undefined ? {} : {lastSort})});
    ensure(Array.isArray(data.books), '笔记本列表缺失。');
    number(data.totalBookCount, '笔记本总数');
    ensure(expected === undefined || expected === data.totalBookCount, '同步期间笔记本总数变化，请重新部署。');
    expected = data.totalBookCount;
    ensure([0, 1, false, true].includes(data.hasMore), '笔记本分页状态缺失。');
    for (const book of data.books) {
      ensure(book.bookId && !books.has(String(book.bookId)), '笔记本分页出现重复书籍或无效 ID。');
      books.set(String(book.bookId), book);
    }
    if (!data.hasMore) {
      ensure(books.size === expected, '笔记本分页不完整，停止同步。');
      return books;
    }
    const cursor = data.books.at(-1)?.sort;
    ensure(Number.isFinite(cursor) && !cursors.has(cursor), '笔记本分页游标无效或重复。');
    cursors.add(cursor); lastSort = cursor;
  }
  throw new Error('笔记本分页超过上限。');
}
function summary(data) {
  const count = data.readStat?.find(item => item.stat === '笔记')?.counts;
  ensure(typeof count === 'string' && /^[\d,，]+条$/.test(count), '阅读统计缺少可识别的笔记数。');
  return {
    seconds: number(data.totalReadTime, '总阅读时长'),
    days: number(data.readDays, '阅读天数'),
    notes: Number(count.replace(/[,，条]/g, '')),
  };
}
export function validateSnapshot(data) {
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt), '更新日期无效。');
  ensure(Array.isArray(data.books) && data.books.length > 0, '书单为空，拒绝覆盖。');
  const ids = new Set();
  for (const book of data.books) {
    ensure(typeof book.title === 'string' && book.title.trim() && book.versions.length > 0, '书名或版本缺失。');
    for (const version of book.versions) {
      ensure(version.id && !ids.has(version.id), '版本 ID 重复或缺失。');
      ids.add(version.id);
      ensure(Number.isInteger(version.progress) && version.progress >= 0 && version.progress <= 100, '阅读进度必须在0—100之间。');
      ensure(typeof version.markedFinished === 'boolean', '读完标记无效。');
    }
  }
  for (const period of Object.values(data.summary)) {
    for (const field of ['seconds', 'days', 'notes']) number(period[field], field);
  }
  ensure(data.summary.year.year === Number(data.updatedAt.slice(0, 4)), '年份与更新日期不一致。');
  ensure(data.monthlySeconds.length === Number(data.updatedAt.slice(5, 7)), '月度明细不完整。');
  data.monthlySeconds.forEach(value => number(value, '月度时长'));
  return data;
}
// Strip only edition labels; volume numbers and substantive subtitles stay distinct.
export function editionKey(title, author) {
  const name = title.normalize('NFKC').replace(/\((?:(?:全新)?(?:升级|修订|增订|精装|典藏|精华)版|新版|(?:原书)?第[0-9一二三四五六七八九十]+版)\)$/u, '').trim();
  const writer = author.normalize('NFKC').replace(/\[[^\]]+\]/g, '').replace(/[·•\s]/g, '').replace(/著$/, '');
  return `${name}\u0000${writer}`;
}
export async function collectSnapshot({call, previous, rules, now = new Date(), log = () => {}}) {
  const updatedAt = chinaDate(now);
  const yearNumber = Number(updatedAt.slice(0, 4));
  const month = Number(updatedAt.slice(5, 7));
  const baseTime = Math.floor(now.getTime() / 1000);
  // Sequential calls stop immediately if an upgrade is required.
  const overall = await call('/readdata/detail', {mode: 'overall', baseTime: 0});
  const annual = await call('/readdata/detail', {mode: 'annually', baseTime});
  const monthly = await call('/readdata/detail', {mode: 'monthly', baseTime});
  ensure(recordDate(annual.baseTime) === `${yearNumber}-01-01`, '年度统计周期不匹配。');
  ensure(recordDate(monthly.baseTime) === `${updatedAt.slice(0, 7)}-01`, '月度统计周期不匹配。');
  ensure(annual.readTimes && typeof annual.readTimes === 'object', '年度月度明细缺失。');
  const byMonth = new Map(Object.entries(annual.readTimes).map(([timestamp, seconds]) => [recordDate(Number(timestamp)), seconds]));
  const monthlySeconds = Array.from({length: month}, (_, index) =>
    number(byMonth.get(`${yearNumber}-${String(index + 1).padStart(2, '0')}-01`), '月度明细'));
  const periods = {overall: summary(overall), year: {year: yearNumber, ...summary(annual)}, month: {month: updatedAt.slice(0, 7), ...summary(monthly)}};
  const shelf = await call('/shelf/sync');
  ensure(Array.isArray(shelf.books), '书架列表缺失。');
  const notebooks = await allNotebooks(call);
  const candidates = new Map();
  const priorGroups = new Map();
  // Retain known history even when a book is no longer on the shelf.
  for (const book of previous.books) {
    for (const version of book.versions) {
      priorGroups.set(version.id, book.id);
      candidates.set(version.id, {bookId: version.id, title: version.title, author: book.author,
        category: book.category, cover: book.cover, readerLink: version.url, previous: version});
    }
  }
  for (const book of shelf.books) {
    ensure(book.bookId && book.title, '书架条目缺少 ID 或标题。');
    const id = String(book.bookId);
    candidates.set(id, {...candidates.get(id), ...book, bookId: id});
  }
  for (const [id, notebook] of notebooks) {
    const book = notebook.book;
    ensure(book && book.title, '笔记本条目缺少书籍信息。');
    candidates.set(id, {...book, ...candidates.get(id), bookId: id, notebook});
  }
  const aliases = new Map();
  for (const rule of rules) for (const id of rule.ids) aliases.set(id, rule);
  const groups = new Map();
  const groupKeys = new Map();
  for (const book of previous.books) {
    const rule = aliases.get(book.versions[0].id);
    const group = rule ? `edition:${rule.title}` : book.id;
    for (const title of [book.title, ...book.versions.map(v => v.title)]) groupKeys.set(editionKey(title, book.author), group);
  }
  let checked = 0;
  for (const [id, book] of candidates) {
    if (book.author === '公众号') continue;
    const response = await call('/book/getprogress', {bookId: id});
    ensure(String(response.bookId) === id && response.book && typeof response.book === 'object', '进度接口返回的书籍不匹配。');
    const progress = response.book;
    ensure(Number.isInteger(progress.progress) && progress.progress >= 0 && progress.progress <= 100, '进度缺失或超出0—100，停止同步。');
    const marked = book.finishReading !== undefined ? book.finishReading === 1
      : book.notebook?.markedStatus !== undefined ? book.notebook.markedStatus === 1
      : book.previous?.markedFinished || false;
    const hasRecord = progress.isStartReading === 1 || progress.progress > 0 || marked || book.notebook || book.previous;
    checked++;
    if (checked % 40 === 0) log(`已核对 ${checked} 个书籍版本。`);
    if (!hasRecord) continue;
    const rule = aliases.get(id);
    // Previously curated groups and explicit edition IDs are safe to merge.
    // New unrelated books are never merged by a fuzzy title alone.
    const signature = editionKey(book.title, book.author || '作者未提供');
    const groupId = rule ? `edition:${rule.title}` : priorGroups.get(id) || groupKeys.get(signature) || id;
    groupKeys.set(signature, groupId);
    if (!groups.has(groupId)) groups.set(groupId, {
      id, title: rule?.title || book.title, author: book.author || '作者未提供',
      category: typeof book.category === 'string' ? book.category.split('-')[0] || '其他' : '其他',
      cover: safeUrl(book.cover, ['cdn.weread.qq.com', 'wfqqreader-1252317822.image.myqcloud.com']), versions: [],
    });
    groups.get(groupId).versions.push({id, title: book.title, progress: progress.progress, markedFinished: marked,
      updatedAt: recordDate(progress.updateTime || book.readUpdateTime),
      url: safeUrl(book.readerLink || book.deepLink, ['weread.qq.com']),
    });
  }
  const books = [...groups.values()];
  for (const book of books) book.versions.sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  books.sort((a,b) => (b.versions[0].updatedAt || '').localeCompare(a.versions[0].updatedAt || '') || a.title.localeCompare(b.title, 'zh-CN'));
  return validateSnapshot({updatedAt, source: '微信读书', summary: periods, monthlySeconds, books});
}
export async function syncReading({apiKey = process.env.WEREAD_API_KEY, output = SNAPSHOT, now, call, log = console.log} = {}) {
  const request = call || gateway(apiKey);
  const previous = JSON.parse(await readFile(output, 'utf8'));
  const rules = JSON.parse(await readFile(RULES, 'utf8'));
  const data = await collectSnapshot({call: request, previous, rules, now, log});
  const temp = new URL(`./reading-${process.pid}.tmp`, output instanceof URL ? output : pathToFileURL(resolve(output)));
  try {
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, {mode: 0o600});
    await rename(temp, output);
  } finally { await rm(temp, {force: true}); }
  log(`阅读数据同步成功：${data.updatedAt}，${data.books.length} 部作品，${data.books.flatMap(b => b.versions).length} 个版本。`);
  return data;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  syncReading().catch(error => { console.error(`阅读同步失败：${error.message}`); process.exitCode = 1; });
}
