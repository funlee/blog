/** @typedef {{name: string, icon: string, colorIndex: number, shape: string, schedule: {kind: string}, position: number, pauses: unknown[], createdOn: string, days: Record<string, 'done' | 'rest'>}} GardenHabit */
/** @typedef {{kind: 'habit-garden-backup', formatVersion: 2, exportedAt: string, habits: GardenHabit[]}} GardenBackup */

const TIMEZONE = 'Asia/Shanghai';

export function gardenDate(instant) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(instant));
}

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }

/** Validate the native backup without modifying or reserializing it. Extra export fields are retained. @returns {GardenBackup} */
export function validateGarden(data) {
  if (!object(data) || data.kind !== 'habit-garden-backup' || data.formatVersion !== 2) {
    throw new Error('花园数据必须为 Habit Garden 的 habit-garden-backup / formatVersion: 2 原始备份');
  }
  if (typeof data.exportedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.exportedAt) || !validDate(data.exportedAt.slice(0, 10)) || !Number.isFinite(Date.parse(data.exportedAt))) {
    throw new Error('花园备份的 exportedAt 必须为带时区的有效时间');
  }
  if (!Array.isArray(data.habits)) throw new Error('花园备份的 habits 必须为数组');
  const cutoff = gardenDate(data.exportedAt);
  for (const [index, habit] of data.habits.entries()) {
    const label = `第 ${index + 1} 个习惯`;
    if (!object(habit) || typeof habit.name !== 'string' || !habit.name.trim()) throw new Error(`${label}缺少名称`);
    if (typeof habit.icon !== 'string' || !habit.icon || typeof habit.shape !== 'string' || !habit.shape) throw new Error(`${label}缺少 icon 或 shape`);
    if (!Number.isInteger(habit.colorIndex) || habit.colorIndex < 0 || !Number.isInteger(habit.position) || habit.position < 0) throw new Error(`${label}的 colorIndex 和 position 必须为非负整数`);
    if (!object(habit.schedule) || typeof habit.schedule.kind !== 'string' || !habit.schedule.kind) throw new Error(`${label}缺少 schedule.kind`);
    if (!Array.isArray(habit.pauses)) throw new Error(`${label}的 pauses 必须为数组`);
    if (!validDate(habit.createdOn) || habit.createdOn > cutoff) throw new Error(`${label}的 createdOn 必须为不晚于导出日的真实日期`);
    if (!object(habit.days)) throw new Error(`${label}的 days 必须为日期与状态映射`);
    for (const [date, status] of Object.entries(habit.days)) {
      if (!validDate(date) || date < habit.createdOn || date > cutoff) throw new Error(`${label}的记录日期超出有效范围：${date}`);
      if (status !== 'done' && status !== 'rest') throw new Error(`${label}的记录状态不支持：${date} = ${status}`);
    }
  }
  return data;
}

export function growth(completions) {
  if (completions >= 21) return {stage: 'bloom', name: '已经开花', next: null};
  if (completions >= 7) return {stage: 'bud', name: '含苞待放', next: 21};
  if (completions >= 1) return {stage: 'sprout', name: '正在萌芽', next: 7};
  return {stage: 'seed', name: '等待萌芽', next: 1};
}

/** @param {GardenHabit} habit */
export function habitSummary(habit) {
  const entries = Object.entries(habit.days);
  const doneDates = entries.filter(([, status]) => status === 'done').map(([date]) => date).sort();
  return {
    done: doneDates.length, rest: entries.filter(([, status]) => status === 'rest').length,
    lastDone: doneDates.at(-1) || null, ...growth(doneDates.length),
  };
}

/** The supplied v2 export documents only daily. Preserve other schedules without guessing their schema. @param {GardenHabit['schedule']} schedule */
export function scheduleLabel(schedule) {
  return schedule.kind === 'daily' ? '每天' : '自定义安排';
}

/** @param {GardenBackup} data */
export function gardenSummary(data) {
  const days = new Set();
  let completions = 0, rests = 0;
  for (const habit of data.habits) {
    for (const [date, status] of Object.entries(habit.days)) {
      if (status === 'done') {completions++; days.add(date);}
      else if (status === 'rest') rests++;
    }
  }
  return {habits: data.habits.length, completions, actionDays: days.size, rests};
}

/** Derived keys are view-only; the backup itself never gains an id field. @param {GardenBackup} data @returns {{habit: GardenHabit, key: string}[]} */
export function gardenHabits(data) {
  return data.habits.map((habit, index) => ({habit, key: `habit-${index}`}))
    .sort((a, b) => a.habit.position - b.habit.position);
}

/** @param {GardenHabit} habit @param {string} cutoff */
export function habitMonths(habit, cutoff) {
  return [...new Set([cutoff.slice(0, 7), habit.createdOn.slice(0, 7), ...Object.keys(habit.days).map(date => date.slice(0, 7))])].sort().reverse();
}

/** @param {GardenHabit} habit @param {string} month @param {string} cutoff */
export function monthCells(habit, month, cutoff) {
  const first = `${month}-01`;
  if (!validDate(first)) throw new Error('花园月历月份无效');
  const start = new Date(`${first}T00:00:00Z`);
  const last = new Date(start);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  return {
    offset: (start.getUTCDay() + 6) % 7,
    days: Array.from({length: last.getUTCDate()}, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`;
      return {date, day: i + 1, status: date > cutoff ? 'future' : date < habit.createdOn ? 'inactive' : habit.days[date] || 'none'};
    }),
  };
}
