function setupReading() {
  const root = document.querySelector<HTMLElement>('[data-reading-page]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const query = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const list = query<HTMLDivElement>('[data-book-list]');
  const cards = [...list.querySelectorAll<HTMLElement>('[data-book]')];
  const search = query<HTMLInputElement>('[data-book-search]');
  const sort = query<HTMLSelectElement>('[data-book-sort]');
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-book-filter]')];
  const previous = query<HTMLButtonElement>('[data-book-prev]');
  const next = query<HTMLButtonElement>('[data-book-next]');
  const pageSize = 18;
  let page = 1;
  let filter = 'all';
  const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  function render() {
    const term = normalize(search.value);
    const matches = cards.filter(card =>
      (filter === 'all' || card.dataset.marked === filter) &&
      normalize(card.dataset.bookIndex || '').includes(term));
    matches.sort((a, b) => {
      if (sort.value === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
      if (sort.value === 'progress') {
        const difference = Number(b.dataset.progress) - Number(a.dataset.progress);
        if (difference) return difference;
      }
      return (b.dataset.updated || '').localeCompare(a.dataset.updated || '');
    });
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    page = Math.min(page, pages);
    cards.forEach(card => { card.hidden = true; });
    const start = (page - 1) * pageSize;
    matches.slice(start, start + pageSize).forEach(card => {
      card.hidden = false;
      list.append(card);
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.bookFilter === filter)));
    query('[data-book-count]').textContent = matches.length
      ? `共 ${matches.length} 本 · 显示第 ${start + 1}–${Math.min(start + pageSize, matches.length)} 本`
      : '共 0 本';
    query('[data-book-page]').textContent = `第 ${page} / ${pages} 页`;
    previous.disabled = page === 1;
    next.disabled = page === pages;
    query('[data-book-empty]').hidden = matches.length !== 0;
    query<HTMLElement>('.reading-pagination').hidden = matches.length <= pageSize;
  }
  function resetPage() { page = 1; render(); }
  search.addEventListener('input', resetPage);
  sort.addEventListener('change', resetPage);
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.bookFilter || 'all'; resetPage();
  }));
  function turnPage(change: number) {
    page += change; render();
    query('[data-book-count]').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  previous.addEventListener('click', () => turnPage(-1));
  next.addEventListener('click', () => turnPage(1));
  query('[data-book-reset]').addEventListener('click', () => {
    search.value = ''; filter = 'all'; sort.value = 'recent'; resetPage(); search.focus();
  });
  root.querySelectorAll<HTMLElement>('[data-reading-controls]').forEach(el => { el.hidden = false; });
  render();
}
document.addEventListener('astro:page-load', setupReading);
setupReading();
