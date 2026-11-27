/** Mutable scroll clock. The WebGL loop reads this ref and does not subscribe. */
export const scrollProgress = {
  current: 0,
  reducedMotion: false,
};

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let frame = 0;

export function setScrollProgress(progress: number) {
  const next = Math.min(1, Math.max(0, progress));
  const changed = Math.abs(next - scrollProgress.current) >= 0.0005;
  scrollProgress.current = next;
  if (!changed || frame !== 0) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const value = scrollProgress.current;
    listeners.forEach((listener) => listener(value));
  });
}

export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  listener(scrollProgress.current);
  return () => {
    listeners.delete(listener);
  };
}

type Scroller = {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number }) => void;
};

let scroller: Scroller | null = null;

export function registerScroller(next: Scroller | null) {
  scroller = next;
}

export function scrollToAct(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  if (scrollProgress.reducedMotion || !scroller) {
    node.scrollIntoView({ behavior: scrollProgress.reducedMotion ? "auto" : "smooth", block: "start" });
    return;
  }
  scroller.scrollTo(node, { offset: 0 });
}
