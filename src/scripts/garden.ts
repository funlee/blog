function setupGarden() {
  const root = document.querySelector<HTMLElement>('[data-garden-page]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const plots = [...root.querySelectorAll<HTMLAnchorElement>('[data-garden-select]')];
  const details = [...root.querySelectorAll<HTMLElement>('[data-garden-detail]')];
  if (!plots.length) return;
  const announcement = root.querySelector<HTMLElement>('[data-garden-announcement]');
  function select(id: string, announce = false) {
    details.forEach(panel => { panel.hidden = panel.dataset.gardenDetail !== id; });
    plots.forEach(plot => {
      if (plot.dataset.gardenSelect === id) plot.setAttribute('aria-current', 'true');
      else plot.removeAttribute('aria-current');
    });
    const plot = plots.find(p => p.dataset.gardenSelect === id);
    if (announce && announcement) announcement.textContent = `正在查看${plot?.querySelector('h3')?.textContent || ''}的成长足迹`;
  }
  const fromHash = details.find(panel => `#${panel.id}` === location.hash)?.dataset.gardenDetail;
  select(fromHash || plots[0].dataset.gardenSelect!);
  plots.forEach(plot => plot.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(plot.dataset.gardenSelect!, true);
  }));
}

document.addEventListener('astro:page-load', setupGarden);
setupGarden();
