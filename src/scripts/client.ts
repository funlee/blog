import { setupTypewriter } from "./typewriter";
type SearchHit = {
  data: () => Promise<{
    url: string;
    meta: { title: string };
    excerpt: string;
  }>;
};
type SearchAPI = { search: (q: string) => Promise<{ results: SearchHit[] }> };
let cleanup = () => {};
let initializedBody: HTMLElement | null = null;
function setup() {
  if (initializedBody === document.body) return;
  cleanup();
  initializedBody = document.body;
  const controller = new AbortController();
  const signal = controller.signal;
  const stopTypewriter = setupTypewriter();
  const on = (el: EventTarget | null, event: string, fn: EventListener) =>
    el?.addEventListener(event, fn, { signal });
  const query = <T extends Element>(s: string) => document.querySelector<T>(s)!;
  const search = query<HTMLDialogElement>("#search-dialog"),
    mobile = query<HTMLDialogElement>("#mobile-nav"),
    lightbox = query<HTMLDialogElement>("#lightbox");
  let opener: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sequence = 0;
  let api: SearchAPI | undefined;
  let results: SearchHit[] = [];
  let loaded = 0;
  let composing = false;
  function open(d: HTMLDialogElement) {
    opener = document.activeElement as HTMLElement;
    d.showModal();
    document.body.style.overflow = "hidden";
  }
  function close(d: HTMLDialogElement) {
    d.close();
  }
  document.querySelectorAll<HTMLDialogElement>("dialog").forEach((d) => {
    d.querySelectorAll("[data-close]").forEach((b) =>
      on(b, "click", () => close(d)),
    );
    on(d, "click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect(),
          m = e as MouseEvent;
        if (
          m.clientX < r.left ||
          m.clientX > r.right ||
          m.clientY < r.top ||
          m.clientY > r.bottom
        )
          close(d);
      }
    });
    on(d, "close", () => {
      document.body.style.overflow = "";
      document
        .querySelector("[data-menu]")
        ?.setAttribute("aria-expanded", "false");
      opener?.focus();
    });
  });
  const input = query<HTMLInputElement>("#search-input"),
    status = query<HTMLElement>("#search-status"),
    container = query<HTMLElement>("#search-results"),
    more = query<HTMLButtonElement>("#search-more");
  function showSearch() {
    open(search);
    input.focus();
  }
  document
    .querySelectorAll("[data-search]")
    .forEach((b) => on(b, "click", showSearch));
  on(document, "keydown", (e) => {
    const k = e as KeyboardEvent;
    if ((k.metaKey || k.ctrlKey) && k.key.toLowerCase() === "k") {
      k.preventDefault();
      if (search.open) close(search);
      else showSearch();
    }
  });
  const theme = query<HTMLButtonElement>("button[data-theme]");
  function themeLabel() {
    theme.setAttribute(
      "aria-label",
      `当前主题：${({ system: "跟随系统", light: "浅色", dark: "深色" } as Record<string, string>)[document.documentElement.dataset.preference || "system"]}，点击切换`,
    );
    theme.title = theme.getAttribute("aria-label") || "";
  }
  themeLabel();
  on(theme, "click", () => {
    const modes = ["system", "light", "dark"];
    const next =
      modes[
        (modes.indexOf(
          document.documentElement.dataset.preference || "system",
        ) +
          1) %
          3
      ];
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.documentElement.dataset.preference = next;
    document.documentElement.dataset.theme =
      next === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;
    themeLabel();
  });
  on(matchMedia("(prefers-color-scheme: dark)"), "change", () => {
    if (document.documentElement.dataset.preference === "system")
      document.documentElement.dataset.theme = matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? "dark"
        : "light";
  });
  on(document.querySelector("[data-menu]"), "click", () => {
    open(mobile);
    document
      .querySelector("[data-menu]")
      ?.setAttribute("aria-expanded", "true");
  });
  mobile
    .querySelectorAll("a")
    .forEach((a) => on(a, "click", () => close(mobile)));
  async function showBatch(token: number) {
    const start = loaded;
    more.disabled = true;
    const batch = await Promise.all(
      results.slice(start, start + 10).map((r) => r.data()),
    );
    if (token !== sequence) return;
    for (const hit of batch) {
      const a = document.createElement("a");
      a.className = "search-result";
      a.href = hit.url;
      const b = document.createElement("b");
      b.textContent = hit.meta.title;
      const p = document.createElement("p");
      const parsed = new DOMParser().parseFromString(hit.excerpt, "text/html");
      function append(node: Node, target: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          target.appendChild(document.createTextNode(node.textContent || ""));
          return;
        }
        if (node instanceof Element && node.tagName === "MARK") {
          const mark = document.createElement("mark");
          mark.textContent = node.textContent;
          target.appendChild(mark);
        } else node.childNodes.forEach((n) => append(n, target));
      }
      parsed.body.childNodes.forEach((n) => append(n, p));
      a.append(b, p);
      a.addEventListener("click", () => close(search), { signal });
      container.append(a);
    }
    loaded += batch.length;
    more.hidden = loaded >= results.length;
    more.disabled = false;
  }
  async function runSearch() {
    const token = ++sequence;
    const q = input.value.trim();
    container.replaceChildren();
    more.hidden = true;
    if (!q) {
      status.textContent = "输入关键词，探索这里的记录。";
      return;
    }
    status.textContent = "正在查找…";
    try {
      if (!api) {
        const path =
          (document.body.dataset.base || "/").replace(/\/$/, "") +
          "/pagefind/pagefind.js";
        api = (await import(/* @vite-ignore */ path)) as SearchAPI;
      }
      const found = await api.search(q);
      if (token !== sequence) return;
      results = found.results;
      loaded = 0;
      status.textContent = results.length
        ? `找到 ${results.length} 篇相关记录`
        : "没有找到相关记录，换个关键词试试。";
      await showBatch(token);
    } catch {
      if (token === sequence) {
        status.textContent = import.meta.env.DEV
          ? "开发预览尚未生成搜索索引，请用 npm start 启动完整预览。"
          : "搜索暂时不可用，请重新输入关键词重试。";
        api = undefined;
      }
    }
  }
  on(input, "compositionstart", () => (composing = true));
  on(input, "compositionend", () => {
    composing = false;
    clearTimeout(timer);
    timer = setTimeout(runSearch, 150);
  });
  on(input, "input", () => {
    sequence++;
    clearTimeout(timer);
    if (!composing) timer = setTimeout(runSearch, 150);
  });
  on(more, "click", () => {
    showBatch(sequence).catch(() => {
      status.textContent = "加载失败，请重试。";
      more.disabled = false;
    });
  });
  on(search, "keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key !== "ArrowDown" && k.key !== "ArrowUp") return;
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a")];
    if (!links.length) return;
    k.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    links[
      (index + (k.key === "ArrowDown" ? 1 : -1) + links.length) % links.length
    ].focus();
  });
  async function copy(text: string, button: HTMLElement) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "已复制 ✓";
    } catch {
      button.textContent = "复制失败，请手动选择";
    }
    setTimeout(() => {
      if (button.isConnected) button.textContent = "复制";
    }, 2200);
  }
  document.querySelectorAll<HTMLElement>(".prose pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    const button = document.createElement("button");
    button.className = "code-copy";
    button.textContent = "复制";
    button.setAttribute("aria-label", "复制代码");
    button.onclick = () => copy(code.textContent || "", button);
    pre.append(button);
  });
  document
    .querySelectorAll<HTMLElement>("[data-copy]")
    .forEach((b) =>
      on(b, "click", () =>
        copy(document.querySelector(b.dataset.copy!)?.textContent || "", b),
      ),
    );
  const images = [
    ...document.querySelectorAll<HTMLImageElement>("[data-zoom]"),
  ];
  let current = 0;
  function display() {
    const im = images[current];
    query<HTMLImageElement>("#lightbox img").src = im.src;
    query<HTMLImageElement>("#lightbox img").alt = im.alt;
    query<HTMLElement>("#lightbox p").textContent =
      `${im.alt} · ${current + 1} / ${images.length}`;
    query<HTMLButtonElement>("[data-prev]").disabled = current === 0;
    query<HTMLButtonElement>("[data-next]").disabled =
      current === images.length - 1;
  }
  images.forEach((im, i) => {
    const target = im.closest("button") || im;
    if (target === im) {
      im.tabIndex = 0;
      im.setAttribute("role", "button");
      im.setAttribute("aria-label", "放大图片");
    }
    const launch = () => {
      current = i;
      display();
      open(lightbox);
    };
    on(target, "click", launch);
    if (target === im)
      on(target, "keydown", (e) => {
        const k = e as KeyboardEvent;
        if (k.key === "Enter" || k.key === " ") {
          k.preventDefault();
          launch();
        }
      });
  });
  on(query("[data-prev]"), "click", () => {
    if (current > 0) {
      current--;
      display();
    }
  });
  on(query("[data-next]"), "click", () => {
    if (current < images.length - 1) {
      current++;
      display();
    }
  });
  on(lightbox, "keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === "ArrowLeft" && current > 0) {
      current--;
      display();
    }
    if (k.key === "ArrowRight" && current < images.length - 1) {
      current++;
      display();
    }
  });
  const top = query<HTMLButtonElement>(".back-top");
  const scroll = () => (top.hidden = window.scrollY < 500);
  on(window, "scroll", scroll);
  scroll();
  on(top, "click", () =>
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    }),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          document
            .querySelectorAll(".toc a")
            .forEach((a) =>
              a.classList.toggle(
                "active",
                decodeURIComponent(a.getAttribute("href")!.slice(1)) ===
                  entry.target.id,
              ),
            );
        }
    },
    { rootMargin: "-90px 0px -65% 0px" },
  );
  document
    .querySelectorAll(".prose h2,.prose h3")
    .forEach((h) => observer.observe(h));
  cleanup = () => {
    initializedBody = null;
    stopTypewriter();
    controller.abort();
    observer.disconnect();
    clearTimeout(timer);
    sequence++;
    document.body.style.overflow = "";
  };
}
document.addEventListener("astro:page-load", setup);
document.addEventListener("astro:before-swap", () => cleanup());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
  setup();
}
