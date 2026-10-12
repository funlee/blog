/** A title's display progress is the furthest position across its editions. */
export function readingProgress(book) {
  return Math.max(...book.versions.map((version) => version.progress));
}
export function markedFinished(book) {
  return book.versions.some((version) => version.markedFinished);
}
export function latestReading(book) {
  return book.versions.reduce((date, version) =>
    version.updatedAt && version.updatedAt > date ? version.updatedAt : date, "");
}
export function duration(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60)}小时${minutes % 60}分钟`;
}

/** Select the latest active edition of each work, even if another edition is finished. */
export function recentBooks(books, limit = 3) {
  return books.filter(book => {
    const version = book.versions[0];
    return version && version.url && !version.markedFinished && version.progress > 0 && version.progress < 100;
  }).sort((a,b) => latestReading(b).localeCompare(latestReading(a))).slice(0, limit);
}
