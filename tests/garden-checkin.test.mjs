import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkIn, updateGardenFile} from '../.agents/skills/garden-checkin/scripts/checkin.mjs';
import {gardenDate, validateGarden} from '../src/lib/garden.mjs';

const now = '2026-11-03T16:05:00Z'; // 北京时间 11 月 4 日，与 UTC 日期不同。
const script = fileURLToPath(new URL('../.agents/skills/garden-checkin/scripts/checkin.mjs', import.meta.url));
const fixture = () => ({
  kind: 'habit-garden-backup', formatVersion: 2, exportedAt: '2026-10-29T10:56:43.155336Z', extra: {keep: true},
  habits: [
    {name: '读书', icon: 'book', colorIndex: 0, shape: 'daisy', schedule: {kind: 'daily'}, position: 1,
      pauses: [{original: 'keep'}], createdOn: '2026-10-15', days: {'2026-10-15': 'done', '2026-10-16': 'rest'}, note: 'keep'},
    {name: '运动', icon: 'heart', colorIndex: 1, shape: 'tulip', schedule: {kind: 'daily'}, position: 0,
      pauses: [], createdOn: '2026-10-15', days: {'2026-10-15': 'done'}},
  ],
});

function temporaryGarden(t, data = fixture()) {
  const dir = mkdtempSync(join(tmpdir(), 'blog-garden-checkin-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  const file = join(dir, 'garden.json');
  // Deliberately nonstandard formatting to verify no-op operations preserve bytes.
  writeFileSync(file, JSON.stringify(data));
  return {dir, file};
}

test('默认按北京时间打卡，只新增指定任务的日期并更新时间，保留全部历史和额外字段', () => {
  const original = fixture();
  const before = structuredClone(original);
  const {data, result} = checkIn(original, {habitName: '读书', now});
  const expected = structuredClone(before);
  expected.habits[0].days['2026-11-04'] = 'done';
  expected.exportedAt = '2026-11-03T16:05:00.000Z';
  assert.deepEqual(data, expected);
  assert.deepEqual(original, before);
  assert.deepEqual(result, {name: '读书', date: '2026-11-04', changed: true, previousStatus: null,
    done: 2, exportedAt: expected.exportedAt, message: '已记录完成'});
  assert.equal(validateGarden(data), data);
});

test('指定历史日期和相对日期，更新时间仍为实际执行时间', () => {
  for (const [date, expected] of [[undefined, '2026-11-04'], ['today', '2026-11-04'],
    ['yesterday', '2026-11-03'], ['day-before-yesterday', '2026-11-02'], ['2026-10-20', '2026-10-20']]) {
    const update = checkIn(fixture(), {habitName: '运动', date, now});
    assert.equal(update.result.date, expected);
    assert.equal(update.data.habits[1].days[expected], 'done');
    assert.equal(update.data.exportedAt, new Date(now).toISOString());
  }
  const boundary = checkIn(fixture(), {habitName: '运动', date: 'yesterday', now: '2026-12-31T16:05:00Z'});
  assert.equal(boundary.result.date, '2026-12-31');
});

test('休息改为完成，返回原状态，保留其他历史', () => {
  const {data, result} = checkIn(fixture(), {habitName: '读书', date: '2026-10-16', now});
  assert.equal(result.previousStatus, 'rest');
  assert.equal(result.done, 2);
  assert.equal(result.message, '已从休息改为完成');
  assert.deepEqual(data.habits[0].days, {'2026-10-15': 'done', '2026-10-16': 'done'});
});

test('缺失、未知、简称和重名任务均拒绝写入，不默认选第一个任务', () => {
  for (const habitName of [undefined, '', ' ', '不存在', '读']) {
    assert.throws(() => checkIn(fixture(), {habitName, now}), /指定|找不到/);
  }
  const duplicate = fixture();
  duplicate.habits.push(structuredClone(duplicate.habits[0]));
  assert.throws(() => checkIn(duplicate, {habitName: '读书', now}), /重名/);
});

test('无效日期、未来日期和创建日前的日期被拒绝', () => {
  for (const date of ['2026-02-30', '2026-11-4', '', 'tomorrow']) {
    assert.throws(() => checkIn(fixture(), {habitName: '读书', date, now}), /真实的/);
  }
  assert.throws(() => checkIn(fixture(), {habitName: '读书', date: '2026-11-05', now}), /未来/);
  assert.throws(() => checkIn(fixture(), {habitName: '读书', date: '2026-10-14', now}), /早于/);
});

test('已完成日期重复打卡不改写文件或更新时间，连续打卡仍只累计一次', t => {
  const {dir, file} = temporaryGarden(t);
  const before = readFileSync(file, 'utf8');
  const duplicate = updateGardenFile({file, habitName: '读书', date: '2026-10-15', now});
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.exportedAt, fixture().exportedAt);
  assert.equal(readFileSync(file, 'utf8'), before);
  assert.equal(updateGardenFile({file, habitName: '读书', now}).done, 2);
  const after = readFileSync(file, 'utf8');
  const retry = updateGardenFile({file, habitName: '读书', now: '2026-11-04T10:00:00Z'});
  assert.equal(retry.changed, false);
  assert.equal(retry.done, 2);
  assert.equal(readFileSync(file, 'utf8'), after);
  assert.deepEqual(readdirSync(dir), ['garden.json']);
});

test('更新前后校验失败都保留原文件，并清理锁和临时文件', t => {
  const {dir, file} = temporaryGarden(t);
  const before = readFileSync(file, 'utf8');
  assert.throws(() => updateGardenFile({file, habitName: '读书', date: '2026-11-05', now}), /未来/);
  // Moving the snapshot backwards would invalidate another habit's later record.
  const later = fixture();
  later.exportedAt = '2026-11-05T00:00:00Z';
  later.habits[1].days['2026-11-05'] = 'done';
  writeFileSync(file, JSON.stringify(later));
  const laterText = readFileSync(file, 'utf8');
  assert.throws(() => updateGardenFile({file, habitName: '读书', now}), /记录日期/);
  assert.equal(readFileSync(file, 'utf8'), laterText);
  writeFileSync(file, before.replace('habit-garden-backup', 'unsupported'));
  const invalid = readFileSync(file, 'utf8');
  assert.throws(() => updateGardenFile({file, habitName: '读书', now}), /原始备份/);
  assert.equal(readFileSync(file, 'utf8'), invalid);
  assert.deepEqual(readdirSync(dir), ['garden.json']);
});

test('已存在的写锁阻止覆盖，且不会删除另一个操作的锁', t => {
  const {file} = temporaryGarden(t);
  const before = readFileSync(file, 'utf8');
  writeFileSync(`${file}.lock`, 'other writer');
  assert.throws(() => updateGardenFile({file, habitName: '读书', now}), /占用/);
  assert.equal(readFileSync(file, 'utf8'), before);
  assert.equal(readFileSync(`${file}.lock`, 'utf8'), 'other writer');
});

test('CLI 在其他工作目录也能列出真实任务；副本打卡、重复和错误有明确退出状态', t => {
  const {dir, file} = temporaryGarden(t);
  const run = (...args) => spawnSync(process.execPath, [script, ...args], {cwd: dir, encoding: 'utf8'});
  const listing = run('--list');
  assert.equal(listing.status, 0, listing.stderr);
  const real = JSON.parse(readFileSync(new URL('../src/data/garden.json', import.meta.url), 'utf8'));
  assert.deepEqual(JSON.parse(listing.stdout).habits.map(h => h.name), real.habits.map(h => h.name));
  const first = run('--file', file, '--habit', '读书', '--date', '2026-10-20');
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).changed, true);
  const after = readFileSync(file, 'utf8');
  const retry = run('--file', file, '--habit', '读书', '--date', '2026-10-20');
  assert.equal(retry.status, 0, retry.stderr);
  assert.equal(JSON.parse(retry.stdout).changed, false);
  for (const args of [[], ['--habit', '不存在'], ['--list', '--habit', '读书'], ['--unknown']]) {
    const failure = run('--file', file, ...args);
    assert.equal(failure.status, 1);
    assert.match(failure.stderr, /花园打卡失败/);
  }
  assert.equal(readFileSync(file, 'utf8'), after);
});

test('在真实数据的内存副本上新增记录，现有记录和其他字段完整保留', t => {
  const original = JSON.parse(readFileSync(new URL('../src/data/garden.json', import.meta.url), 'utf8'));
  const habit = original.habits.find(h => original.habits.filter(other => other.name === h.name).length === 1);
  if (!habit) return t.skip('当前数据没有可按名称唯一匹配的任务');
  // Use a later date in memory so future real check-ins do not stale this regression.
  const instant = new Date(Math.max(Date.parse(original.exportedAt), Date.now()) + 86400000);
  const date = gardenDate(instant);
  const update = checkIn(original, {habitName: habit.name, now: instant});
  const expected = structuredClone(original);
  expected.habits.find(h => h.name === habit.name).days[date] = 'done';
  expected.exportedAt = instant.toISOString();
  assert.deepEqual(update.data, expected);
});
