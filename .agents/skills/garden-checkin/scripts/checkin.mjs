import {closeSync, openSync, readFileSync, renameSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import {gardenDate, habitSummary, validDate, validateGarden} from '../../../../src/lib/garden.mjs';

const defaultFile = fileURLToPath(new URL('../../../../src/data/garden.json', import.meta.url));

function checkinDate(value, now) {
  const today = gardenDate(now);
  const offsets = {today: 0, yesterday: 1, 'day-before-yesterday': 2};
  let date = value ?? today;
  if (Object.hasOwn(offsets, date)) {
    const day = new Date(`${today}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() - offsets[date]);
    date = day.toISOString().slice(0, 10);
  }
  if (!validDate(date)) throw new Error('打卡日期必须为真实的 YYYY-MM-DD 日期，或 today / yesterday / day-before-yesterday');
  if (date > today) throw new Error(`不能为未来日期打卡：${date}（北京时间今天为 ${today}）`);
  return date;
}

/** Derive an update without mutating the supplied data. The clock can be fixed in isolated tests. */
export function checkIn(data, {habitName, date, now = new Date()} = {}) {
  validateGarden(data);
  if (typeof habitName !== 'string' || !habitName.trim()) throw new Error('请明确指定要打卡的任务名称（--habit）');
  const matches = data.habits.map((habit, index) => ({habit, index})).filter(({habit}) => habit.name === habitName.trim());
  if (matches.length === 0) throw new Error(`找不到任务「${habitName}」。可用任务：${data.habits.map(h => h.name).join('、') || '暂无'}`);
  if (matches.length > 1) throw new Error(`任务「${habitName}」有重名，无法唯一匹配，请先明确并区分任务名称`);
  const instant = new Date(now);
  if (!Number.isFinite(instant.getTime())) throw new Error('当前时间无效');
  const day = checkinDate(date, instant);
  const {habit, index} = matches[0];
  if (day < habit.createdOn) throw new Error(`打卡日期 ${day} 早于「${habit.name}」的创建日期 ${habit.createdOn}`);
  const previousStatus = habit.days[day] ?? null;
  const changed = previousStatus !== 'done';
  const updated = structuredClone(data);
  if (changed) {
    updated.habits[index].days[day] = 'done';
    updated.exportedAt = instant.toISOString();
    validateGarden(updated);
  }
  const message = !changed ? '当天已打卡，无需重复记录' : previousStatus === 'rest' ? '已从休息改为完成' : '已记录完成';
  return {
    data: updated,
    result: {name: habit.name, date: day, changed, previousStatus, done: habitSummary(updated.habits[index]).done, exportedAt: updated.exportedAt, message},
  };
}

/** Serialize cooperating writers and replace the file only after the full update validates. */
export function updateGardenFile({file = defaultFile, ...options} = {}) {
  const filePath = resolve(file);
  const lockPath = `${filePath}.lock`;
  let lock;
  try {
    lock = openSync(lockPath, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('花园数据正被其他打卡操作占用，请在该操作完成后重试');
    throw error;
  }
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    const update = checkIn(data, options);
    if (update.result.changed) {
      writeFileSync(temporaryPath, `${JSON.stringify(update.data, null, 2)}\n`, {flag: 'wx', mode: statSync(filePath).mode});
      renameSync(temporaryPath, filePath);
    }
    return update.result;
  } finally {
    rmSync(temporaryPath, {force: true});
    closeSync(lock);
    rmSync(lockPath, {force: true});
  }
}

function main() {
  const {values} = parseArgs({
    options: {
      habit: {type: 'string'}, date: {type: 'string'}, file: {type: 'string'},
      list: {type: 'boolean'}, help: {type: 'boolean'},
    },
  });
  if (values.help) {
    console.log('用法：node .agents/skills/garden-checkin/scripts/checkin.mjs --habit "任务名称" [--date YYYY-MM-DD|today|yesterday|day-before-yesterday]\n查看任务：--list\n测试副本：--file <path>\n默认按北京时间当天打卡；真实变更时更新 exportedAt，重复打卡不改写文件。');
    return;
  }
  if (values.list) {
    if (values.habit !== undefined || values.date !== undefined) throw new Error('--list 不能与 --habit 或 --date 同时使用');
    const data = validateGarden(JSON.parse(readFileSync(values.file ?? defaultFile, 'utf8')));
    console.log(JSON.stringify({habits: data.habits.map(h => ({name: h.name, createdOn: h.createdOn, done: habitSummary(h).done}))}, null, 2));
    return;
  }
  if (!values.habit?.trim()) throw new Error('请明确指定要打卡的任务名称（--habit）；使用 --list 查看任务');
  const result = updateGardenFile({file: values.file ?? defaultFile, habitName: values.habit, date: values.date});
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); }
  catch (error) { console.error(`花园打卡失败：${error.message}`); process.exitCode = 1; }
}
