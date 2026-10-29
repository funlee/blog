import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gardenDate, validDate, validateGarden, gardenSummary, gardenHabits, habitSummary, habitMonths, monthCells, growth, scheduleLabel} from '../src/lib/garden.mjs';

const fixture = () => ({
  kind: 'habit-garden-backup', formatVersion: 2, exportedAt: '2026-10-29T09:19:13.340559Z',
  habits: [{
    name: '读书20页', icon: 'book', colorIndex: 0, shape: 'daisy', schedule: {kind: 'daily'},
    position: 0, pauses: [], createdOn: '2026-10-15',
    days: {'2026-10-15': 'done', '2026-10-16': 'done', '2026-10-17': 'rest', '2026-10-29': 'done'},
  }],
});

test('直接读取 v2 手机原始格式，不修改对象，也不增加自定义存储字段', () => {
  const data = fixture();
  const before = JSON.stringify(data);
  assert.equal(validateGarden(data), data);
  gardenHabits(data); gardenSummary(data); habitSummary(data.habits[0]);
  assert.equal(JSON.stringify(data), before);
  assert.deepEqual(Object.keys(data).sort(), ['exportedAt', 'formatVersion', 'habits', 'kind']);
  assert.deepEqual(validateGarden({...data, habits: []}).habits, []);
});

test('保留额外原始字段、未知花型、频率和暂停信息，不臆测其打卡语义', () => {
  const data = fixture();
  data.appVersion = 'future';
  data.habits[0].shape = 'new-flower';
  data.habits[0].schedule = {kind: 'custom', nativeField: [1, 3]};
  data.habits[0].pauses = [{nativePauseField: 'untouched'}];
  const before = JSON.stringify(data);
  validateGarden(data);
  assert.equal(scheduleLabel(data.habits[0].schedule), '自定义安排');
  assert.equal(monthCells(data.habits[0], '2026-10', '2026-10-29').days[17].status, 'none');
  assert.equal(JSON.stringify(data), before);
});

test('格式版本、真实日期、导出时间与记录状态不合法时阻止构建', () => {
  assert.throws(() => validateGarden({...fixture(), kind: 'other'}), /原始备份/);
  assert.throws(() => validateGarden({...fixture(), formatVersion: 3}), /原始备份/);
  assert.throws(() => validateGarden({...fixture(), exportedAt: '2026-02-30T10:00:00Z'}), /exportedAt/);
  assert.throws(() => validateGarden({...fixture(), exportedAt: '2026-10-29 10:00:00'}), /exportedAt/);
  for (const date of ['2026-02-30', '2026-10-14', '2026-10-30']) {
    const data = fixture(); data.habits[0].days[date] = 'done';
    assert.throws(() => validateGarden(data), /记录日期/);
  }
  const data = fixture(); data.habits[0].days['2026-10-18'] = 'unknown';
  assert.throws(() => validateGarden(data), /记录状态/);
  assert.ok(validDate('2024-02-29'));
  assert.ok(!validDate('2026-02-29'));
});

test('备份截止日使用导出时间的北京时间，而不是部署时间或浏览器时间', () => {
  assert.equal(gardenDate('2026-10-28T15:59:59Z'), '2026-10-28');
  assert.equal(gardenDate('2026-10-28T16:00:00Z'), '2026-10-29');
  const data = fixture(); data.exportedAt = '2026-10-28T16:01:00Z';
  assert.equal(validateGarden(data), data);
});

test('按 position 展示，不排序原始数组；同名习惯各有独立展示键', () => {
  const data = fixture();
  data.habits.push({...structuredClone(data.habits[0]), position: 0});
  data.habits[0].position = 5;
  const sorted = gardenHabits(data);
  assert.equal(sorted[0].habit, data.habits[1]);
  assert.equal(data.habits[0].position, 5);
  assert.notEqual(sorted[0].key, sorted[1].key);
  assert.equal(validateGarden(data), data);
});

test('完成按习惯累计，行动天数跨习惯去重，休息不计为完成', () => {
  const data = fixture();
  data.habits.push({...structuredClone(data.habits[0]), name: '运动', position: 1});
  assert.deepEqual(gardenSummary(data), {habits: 2, completions: 6, actionDays: 3, rests: 2});
  assert.equal(habitSummary(data.habits[0]).done, 3);
  assert.equal(habitSummary(data.habits[0]).rest, 1);
  assert.equal(habitSummary(data.habits[0]).lastDone, '2026-10-29');
});

test('生长按累计完成次数分级，月历不把空白改为失败或休息', () => {
  assert.equal(growth(0).stage, 'seed');
  assert.equal(growth(1).stage, 'sprout');
  assert.equal(growth(7).stage, 'bud');
  assert.equal(growth(21).stage, 'bloom');
  assert.equal(growth(100).next, null);
  const calendar = monthCells(fixture().habits[0], '2026-10', '2026-10-29');
  assert.equal(calendar.offset, 3);
  assert.equal(calendar.days.length, 31);
  assert.equal(calendar.days[13].status, 'inactive');
  assert.equal(calendar.days[14].status, 'done');
  assert.equal(calendar.days[16].status, 'rest');
  assert.equal(calendar.days[17].status, 'none');
  assert.equal(calendar.days[29].status, 'future');
  assert.equal(monthCells({...fixture().habits[0], createdOn: '2024-02-01', days: {}}, '2024-02', '2024-02-29').days.length, 29);
});

test('月历包含历史记录月份和导出月，部署不会新增空白月份', () => {
  const habit = fixture().habits[0];
  habit.createdOn = '2026-08-01';
  habit.days['2026-09-02'] = 'done';
  assert.deepEqual(habitMonths(habit, '2026-10-29'), ['2026-10', '2026-09', '2026-08']);
});

test('项目真实手机备份满足原生格式，不绑定未来更新后的习惯名称和数量', async () => {
  const data = JSON.parse(await readFile(new URL('../src/data/garden.json', import.meta.url), 'utf8'));
  assert.equal(validateGarden(data), data);
});
