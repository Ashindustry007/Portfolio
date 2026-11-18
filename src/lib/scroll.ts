import type Lenis from "lenis";

// Shared scroll reading, written by <SmoothScroll /> and read in animation frames.
export const scrollState = {
  y: 0,
  limit: 1,
  progress: 0,
  velocity: 0,
};

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function startLenis() {
  lenis?.start();
}

export function stopLenis() {
  lenis?.stop();
}

export function readNativeScroll() {
  const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const y = window.scrollY;
  scrollState.velocity = y - scrollState.y;
  scrollState.y = y;
  scrollState.limit = limit;
  scrollState.progress = Math.min(1, Math.max(0, y / limit));
}

export function scrollToTarget(target: number | string | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
  if (lenis) {
    // After a page change the scroller may still hold the previous page's height.
    if (opts.immediate) lenis.resize();
    lenis.scrollTo(target as never, { immediate: opts.immediate, force: opts.immediate, offset: opts.offset ?? 0, duration: opts.immediate ? undefined : 1.4 });
    return;
  }
  let top = 0;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: top + (opts.offset ?? 0), behavior: opts.immediate ? "auto" : "smooth" });
}
