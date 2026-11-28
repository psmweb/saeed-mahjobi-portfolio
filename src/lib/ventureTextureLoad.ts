import { ventureTexturesDue } from "@/data/ventureTextures";
import { scrollProgress, subscribeScroll, subscribeSmoothed } from "@/lib/scrollProgress";

/**
 * Call `load` once scroll is within 0.1 of Act 3. Page load stays at progress 0,
 * so the venture plates are not requested until the show approaches that act.
 * Seek publishes `smoothed` on the same turn, which starts the fetch immediately.
 */
export function watchVentureTextures(load: () => void) {
  let started = false;
  let stopCurrent: () => void = () => {};
  let stopSmoothed: () => void = () => {};
  const consider = () => {
    if (started) return;
    if (!ventureTexturesDue(scrollProgress.current) && !ventureTexturesDue(scrollProgress.smoothed)) return;
    started = true;
    queueMicrotask(() => {
      stopCurrent();
      stopSmoothed();
    });
    load();
  };
  stopCurrent = subscribeScroll(consider);
  stopSmoothed = subscribeSmoothed(consider);
  return () => {
    started = true;
    stopCurrent();
    stopSmoothed();
  };
}
