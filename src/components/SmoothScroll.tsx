"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { shortestActProgress } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import { actHandoff } from "@/lib/actHandoff";
import { mirrorX } from "@/lib/direction";
import { scrollTuning } from "@/lib/motion";
import { sceneQuality, sparkBudget } from "@/lib/performanceTier";
import {
  canvasClockIsLive,
  registerScrollDriver,
  registerScroller,
  scrollProgress,
  setScrollProgress,
  snapScrollProgress,
  stepSmoothed,
  syncReducedMotion,
} from "@/lib/scrollProgress";

type MotionHandle = {
  reduced: boolean;
  current: number;
  smoothed: number;
  tier: string;
  dprCap: number;
  sparks: number;
  stars: number;
  dof: boolean;
  degraded: boolean;
  smoothWheel: boolean;
  lerp: number;
  wheel: number;
  touch: number;
  handoff: ReturnType<typeof actHandoff>;
};

/** One scroll clock. Lenis does not run its own frame loop. */
export function SmoothScroll() {
  const { dir } = useLanguage();

  useEffect(() => {
    syncReducedMotion();
    const reduced = scrollProgress.reducedMotion;
    let wheelEpoch = -1;
    let wheelUsed = 0;
    let epoch = 0;
    let lastTick = Number.NaN;
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      syncTouch: false,
      smoothWheel: !reduced,
      lerp: reduced ? 1 : scrollTuning.lerp,
      wheelMultiplier: scrollTuning.wheelMultiplier,
      touchMultiplier: scrollTuning.touchMultiplier,
      virtualScroll: (data) => {
        data.deltaX = mirrorX(data.deltaX, dir);
        if (data.event.type !== "wheel") return true;
        if (wheelEpoch !== epoch) {
          wheelEpoch = epoch;
          wheelUsed = 0;
        }
        const limit = Math.max(lenis.limit, window.innerHeight);
        const cap = shortestActProgress() * limit;
        const sign = Math.sign(data.deltaY);
        if (sign !== 0 && wheelUsed !== 0 && sign !== Math.sign(wheelUsed)) wheelUsed = 0;
        const room = Math.max(0, cap - Math.abs(wheelUsed));
        const allowed = sign * Math.min(Math.abs(data.deltaY), room);
        if (allowed === 0) {
          if (data.event.cancelable) data.event.preventDefault();
          return false;
        }
        wheelUsed += allowed;
        data.deltaY = allowed;
        return true;
      },
    });
    const publish = () => {
      setScrollProgress(lenis.progress);
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = (next: boolean) => {
      const changed = syncReducedMotion(next);
      lenis.options.lerp = next ? 1 : scrollTuning.lerp;
      lenis.options.smoothWheel = !next;
      lenis.options.wheelMultiplier = scrollTuning.wheelMultiplier;
      lenis.options.touchMultiplier = scrollTuning.touchMultiplier;
      if (changed && next) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        publish();
        snapScrollProgress();
      }
    };
    const tick = (time: number) => {
      if (media.matches !== scrollProgress.reducedMotion) applyMotion(media.matches);
      // The bootstrap frame and the WebGL frame can land in the same millisecond.
      if (Math.abs(time - lastTick) < 2) return;
      lastTick = time;
      const before = lenis.animatedScroll;
      lenis.raf(time);
      const limit = Math.max(lenis.limit, 1);
      const cap = shortestActProgress() * limit;
      const delta = lenis.animatedScroll - before;
      if (lenis.options.smoothWheel && Math.abs(delta) > cap + 0.5) {
        const next = before + Math.sign(delta) * cap;
        lenis.scrollTo(next, { immediate: true, force: true });
      }
      epoch += 1;
      publish();
      stepSmoothed();
    };
    const unsubscribe = lenis.on("scroll", publish);
    registerScrollDriver(tick);
    registerScroller({
      scrollTo(target, options) {
        const immediate = options?.immediate || scrollProgress.reducedMotion;
        lenis.scrollTo(target, {
          offset: options?.offset ?? 0,
          immediate,
          force: true,
        });
        if (immediate) {
          publish();
          snapScrollProgress();
        }
      },
    });
    const onMotion = () => applyMotion(media.matches);
    media.addEventListener("change", onMotion);
    const seek = (progress: number) => {
      const next = Math.min(1, Math.max(0, progress));
      lenis.scrollTo(lenis.dimensions.limit.y * next, { immediate: true, force: true });
      setScrollProgress(lenis.limit > 0 ? lenis.progress : next);
      snapScrollProgress();
    };
    const view = window as Window & {
      __oneCommandSeek?: (progress: number) => void;
      __oneCommandMotion?: () => MotionHandle;
    };
    view.__oneCommandSeek = seek;
    view.__oneCommandMotion = () => ({
      reduced: scrollProgress.reducedMotion,
      current: scrollProgress.current,
      smoothed: scrollProgress.smoothed,
      tier: sceneQuality.tier,
      dprCap: sceneQuality.dpr,
      sparks: sparkBudget(),
      stars: 2600,
      dof: sceneQuality.dof && sceneQuality.tier === "high" && !sceneQuality.degraded && !scrollProgress.reducedMotion,
      smoothWheel: lenis.options.smoothWheel,
      lerp: lenis.options.lerp,
      wheel: lenis.options.wheelMultiplier,
      touch: lenis.options.touchMultiplier,
      degraded: sceneQuality.degraded,
      handoff: actHandoff(scrollProgress.smoothed, scrollProgress.reducedMotion),
    });
    let raf = 0;
    const boot = (now: number) => {
      if (canvasClockIsLive()) {
        raf = 0;
        return;
      }
      tick(now);
      raf = requestAnimationFrame(boot);
    };
    raf = requestAnimationFrame(boot);
    publish();
    snapScrollProgress();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      media.removeEventListener("change", onMotion);
      registerScrollDriver(null);
      registerScroller(null);
      delete view.__oneCommandSeek;
      delete view.__oneCommandMotion;
      unsubscribe();
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
