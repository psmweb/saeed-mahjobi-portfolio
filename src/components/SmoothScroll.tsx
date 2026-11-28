"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { actHandoff } from "@/lib/actHandoff";
import { mirrorX } from "@/lib/direction";
import { sceneQuality, sparkBudget } from "@/lib/performanceTier";
import {
  registerScroller,
  scrollProgress,
  setScrollProgress,
  smoothedIsStale,
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
  handoff: ReturnType<typeof actHandoff>;
};

/** Smooth vertical scroll. Lenis writes progress; the WebGL loop damps it. */
export function SmoothScroll() {
  const { dir } = useLanguage();

  useEffect(() => {
    syncReducedMotion();
    const reduced = scrollProgress.reducedMotion;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      syncTouch: false,
      smoothWheel: !reduced,
      lerp: reduced ? 1 : 0.1,
      virtualScroll: (data) => {
        data.deltaX = mirrorX(data.deltaX, dir);
        return true;
      },
    });
    const publish = () => {
      setScrollProgress(lenis.progress);
    };
    const unsubscribe = lenis.on("scroll", publish);
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
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      const next = syncReducedMotion(media.matches);
      lenis.options.lerp = next ? 1 : 0.1;
      lenis.options.smoothWheel = !next;
      if (next) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        publish();
        snapScrollProgress();
      }
    };
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
      degraded: sceneQuality.degraded,
      smoothWheel: lenis.options.smoothWheel,
      lerp: lenis.options.lerp,
      handoff: actHandoff(scrollProgress.smoothed, scrollProgress.reducedMotion),
    });
    let last = performance.now();
    let raf = 0;
    const follow = (now: number) => {
      if (smoothedIsStale()) stepSmoothed((now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    publish();
    snapScrollProgress();
    return () => {
      cancelAnimationFrame(raf);
      media.removeEventListener("change", onMotion);
      registerScroller(null);
      delete view.__oneCommandSeek;
      delete view.__oneCommandMotion;
      unsubscribe();
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
