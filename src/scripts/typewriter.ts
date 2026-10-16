/** One timer per mounted banner; disposed before Astro swaps the page. */
export function setupTypewriter() {
  const banner = document.querySelector<HTMLElement>("[data-typewriter]");
  const text = banner?.querySelector<HTMLElement>("[data-typewriter-text]");
  if (!banner || !text) return () => {};
  const quotes: string[] = JSON.parse(banner.dataset.quotes || "[]");
  const options = JSON.parse(banner.dataset.options || "{}");
  if (!quotes.length || !options.enabled) return () => {};
  // Shuffle on each visit, rather than during the static site build.
  for (let i = quotes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
  }
  try {
    const key = "blog:typewriter:last-first-quote";
    const previous = sessionStorage.getItem(key);
    if (quotes[0] === previous) {
      const candidates = quotes.flatMap((quote, index) => quote !== previous ? [index] : []);
      if (candidates.length) {
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        [quotes[0], quotes[next]] = [quotes[next], quotes[0]];
      }
    }
    sessionStorage.setItem(key, quotes[0]);
  } catch {
    // Keep random playback available when browser storage is disabled.
  }
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const segmenter = new Intl.Segmenter("zh-CN", { granularity: "grapheme" });
  const lines = quotes.map((quote) => [...segmenter.segment(quote)].map((part) => part.segment));
  const delay = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) ? Math.max(20, value) : fallback;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let index = 0, count = 0, deleting = false;
  let disposed = false;
  function schedule(ms: number) {
    clearTimeout(timer);
    if (!disposed && !motion.matches && !document.hidden) timer = setTimeout(tick, ms);
  }
  function tick() {
    const line = lines[index];
    count += deleting ? -1 : 1;
    text!.textContent = line.slice(0, count).join("");
    if (!deleting && count === line.length) {
      banner!.setAttribute("aria-label", quotes[index]);
      deleting = true;
      schedule(delay(options.holdTime, 2600));
    } else if (deleting && count === 0) {
      index = (index + 1) % lines.length;
      deleting = false;
      schedule(delay(options.nextDelay, 450));
    } else {
      schedule(delay(deleting ? options.deleteSpeed : options.typeSpeed, deleting ? 65 : 130));
    }
  }
  function reset() {
    clearTimeout(timer);
    index = 0; count = 0; deleting = false;
    banner!.classList.toggle("is-typing", !motion.matches);
    text!.textContent = motion.matches ? quotes[0] : "";
    banner!.setAttribute("aria-label", quotes[0]);
    if (!motion.matches) schedule(delay(options.startDelay, 500));
  }
  function visibility() {
    if (document.hidden) clearTimeout(timer);
    else schedule(delay(options.typeSpeed, 130));
  }
  motion.addEventListener("change", reset);
  document.addEventListener("visibilitychange", visibility);
  reset();
  return () => {
    disposed = true;
    clearTimeout(timer);
    motion.removeEventListener("change", reset);
    document.removeEventListener("visibilitychange", visibility);
  };
}
