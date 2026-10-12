export function published(items, now = Date.now()) {
  return items
    .filter((p) => !p.data.draft && Date.parse(p.data.publishedAt) <= now)
    .sort(
      (a, b) =>
        Date.parse(b.data.publishedAt) - Date.parse(a.data.publishedAt) ||
        a.id.localeCompare(b.id),
    );
}
export function paginate(items, size) {
  if (size < 1) throw new Error("Invalid page size");
  return Array.from(
    { length: Math.max(1, Math.ceil(items.length / size)) },
    (_, i) => items.slice(i * size, (i + 1) * size),
  );
}
export function paginationWindow(current, total) {
  const visible = Array.from({ length: total }, (_, i) => i + 1).filter(
    (page) => total <= 7 || page === 1 || page === total || Math.abs(page - current) <= 1,
  );
  return visible.flatMap((page, i) => {
    const previous = visible[i - 1];
    if (i && page - previous === 2) return [previous + 1, page];
    return i && page - previous > 2 ? [null, page] : [page];
  });
}
export function homeOrder(items) {
  return [...items].sort(
    (a, b) =>
      b.data.pinned - a.data.pinned ||
      Date.parse(b.data.publishedAt) - Date.parse(a.data.publishedAt) ||
      a.id.localeCompare(b.id),
  );
}
export function validateSlugs(items) {
  const seen = new Set();
  for (const p of items) {
    if (seen.has(p.data.slug)) throw new Error("重复 slug: " + p.data.slug);
    seen.add(p.data.slug);
  }
}
export function reading(body = "") {
  const plain = body.replace(/```[\s\S]*?```/g, "").replace(/<[^>]*>/g, "");
  const cn = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (plain.match(/[a-zA-Z]+/g) || []).length;
  return {
    words: cn + en,
    minutes: Math.max(1, Math.ceil(cn / 300 + en / 200)),
  };
}
