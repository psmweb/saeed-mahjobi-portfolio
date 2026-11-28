/**
 * Mutable scroll clock. The WebGL loop reads this object and does not subscribe.
 * `current` is the Lenis progress. `smoothed` is the critically damped clock the
 * scene and camera sample. Seek and any immediate scroll set `snap` so the next
 * frame copies `current` instead of damping. Reduced motion keeps them equal.
 */
export const scrollProgress = {
  current: 0,
  smoothed: 0,
  reducedMotion: false,
  snap: false,
};

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let frame = 0;

export function setScrollProgress(progress: number) {
  const next = Math.min(1, Math.max(0, progress));
  const changed = Math.abs(next - scrollProgress.current) >= 0.0005;
  scrollProgress.current = next;
  if (scrollProgress.reducedMotion) scrollProgress.smoothed = next;
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

/** Jump the damped clock onto `current`. Used by seek and immediate scrolls. */
export function snapScrollProgress() {
  scrollProgress.smoothed = scrollProgress.current;
  scrollProgress.snap = true;
}

type Scroller = {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
};

let scroller: Scroller | null = null;

export function registerScroller(next: Scroller | null) {
  scroller = next;
}

export function scrollToAct(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const immediate = scrollProgress.reducedMotion;
  if (!scroller) {
    node.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
    const max = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(max <= 0 ? 0 : window.scrollY / max);
    snapScrollProgress();
    return;
  }
  scroller.scrollTo(node, { offset: 0, immediate });
}
