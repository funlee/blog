const yearFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  timeZone: 'Asia/Shanghai',
});

// Use the same date as the timeline, including imported notes' update dates.
export function momentYears(items) {
  const groups = new Map();
  for (const item of items) {
    const year = yearFormatter.format(new Date(item.data.updatedAt || item.data.publishedAt));
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(item);
  }
  return [...groups].sort(([a], [b]) => Number(b) - Number(a));
}
