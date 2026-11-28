/**
 * Mutable scroll clock. The WebGL loop reads this object and does not subscribe.
 * `current` is the Lenis progress. `smoothed` copies `current` on that same frame.
 * Lenis is the smoother. Seek and any immediate scroll copy on that turn.
 * Reduced motion keeps them equal as well.
 */
export const scrollProgress = {
  current: 0,
  smoothed: 0,
  reducedMotion: false,
  snap: false,
};

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
const smoothedListeners = new Set<Listener>();
let publishedSmoothed = Number.NaN;
let canvasDrove = false;

function publishSmoothed(force = false) {
  const value = scrollProgress.smoothed;
  if (!force && Math.abs(value - publishedSmoothed) < 0.00035) return;
  publishedSmoothed = value;
  smoothedListeners.forEach((listener) => listener(value));
}

/**
 * Copy Lenis progress onto the scene clock. The WebGL frame is the authority.
 * There is no second damper: Lenis lerp is the only smoother.
 */
export function stepSmoothed() {
  const before = scrollProgress.smoothed;
  scrollProgress.smoothed = scrollProgress.current;
  scrollProgress.snap = false;
  publishSmoothed(Math.abs(scrollProgress.smoothed - before) > 1e-8);
}

type ScrollDriver = (time: number) => void;
let driver: ScrollDriver | null = null;

export function registerScrollDriver(next: ScrollDriver | null) {
  driver = next;
}

/** Called from the WebGL frame. The bootstrap loop stops after the first call. */
export function driveScroll(time: number) {
  canvasDrove = true;
  driver?.(time);
}

/** True after the WebGL frame has taken the scroll clock. */
export function canvasClockIsLive() {
  return canvasDrove;
}

export function setScrollProgress(progress: number) {
  const next = Math.min(1, Math.max(0, progress));
  const changed = Math.abs(next - scrollProgress.current) >= 0.0005;
  scrollProgress.current = next;
  if (scrollProgress.reducedMotion) {
    scrollProgress.smoothed = next;
    publishSmoothed();
  }
  if (!changed) return;
  const value = scrollProgress.current;
  listeners.forEach((listener) => listener(value));
}

export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  listener(scrollProgress.current);
  return () => {
    listeners.delete(listener);
  };
}

/** Fires with `smoothed`. Seek notifies on the same turn; the frame loop otherwise. */
export function subscribeSmoothed(listener: Listener) {
  smoothedListeners.add(listener);
  listener(scrollProgress.smoothed);
  return () => {
    smoothedListeners.delete(listener);
  };
}

/** Read the OS setting into the shared flag. Snaps the clock when it turns on. */
export function syncReducedMotion(reduced?: boolean) {
  const next = reduced ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const changed = scrollProgress.reducedMotion !== next;
  scrollProgress.reducedMotion = next;
  if (changed && next) {
    scrollProgress.smoothed = scrollProgress.current;
    scrollProgress.snap = true;
    publishSmoothed(true);
  }
  if (typeof document !== "undefined") {
    document.documentElement.dataset.reducedMotion = next ? "reduce" : "no-preference";
  }
  return next;
}

/** Jump the damped clock onto `current`. Used by seek and immediate scrolls. */
export function snapScrollProgress() {
  scrollProgress.smoothed = scrollProgress.current;
  scrollProgress.snap = true;
  publishSmoothed(true);
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
