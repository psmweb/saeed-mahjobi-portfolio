import { scrollFollow } from "@/lib/motion";

/**
 * Mutable scroll clock. The WebGL loop reads this object and does not subscribe.
 * `current` is the Lenis progress. `smoothed` is the critically damped clock the
 * scene, the camera, and the act handoff sample. Seek and any immediate scroll
 * copy `current` into `smoothed` on that turn. Reduced motion keeps them equal.
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
let frame = 0;
let publishedSmoothed = Number.NaN;
let drivenAt = 0;

function publishSmoothed(force = false) {
  const value = scrollProgress.smoothed;
  if (!force && Math.abs(value - publishedSmoothed) < 0.00035) return;
  publishedSmoothed = value;
  smoothedListeners.forEach((listener) => listener(value));
}

/**
 * Advance the damped clock by one frame. The WebGL loop is the authority.
 * A DOM fallback calls this only when that loop has gone quiet, so overlays
 * still track scroll if the canvas is unavailable. Matches `MathUtils.damp`.
 */
export function stepSmoothed(deltaSeconds: number) {
  const dt = Math.min(Math.max(deltaSeconds, 0), scrollFollow.deltaCap);
  const before = scrollProgress.smoothed;
  const gap = scrollProgress.current - scrollProgress.smoothed;
  // Settle exactly once the follow is inside a fraction of a percent. The
  // opening overlay is fully visible at progress 0 and inside its fade just
  // above that, so a chapter jump to the top has to land on 0, not beside it.
  if (scrollProgress.reducedMotion || scrollProgress.snap || Math.abs(gap) < 0.0002) {
    scrollProgress.smoothed = scrollProgress.current;
    scrollProgress.snap = false;
  } else {
    const blend = 1 - Math.exp(-scrollFollow.lambda * dt);
    scrollProgress.smoothed += gap * blend;
  }
  drivenAt = performance.now();
  publishSmoothed(Math.abs(scrollProgress.smoothed - before) > 1e-8);
}

export function smoothedIsStale() {
  return performance.now() - drivenAt > 48;
}

export function setScrollProgress(progress: number) {
  const next = Math.min(1, Math.max(0, progress));
  const changed = Math.abs(next - scrollProgress.current) >= 0.0005;
  scrollProgress.current = next;
  if (scrollProgress.reducedMotion) {
    scrollProgress.smoothed = next;
    publishSmoothed();
  }
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
