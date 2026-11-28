"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { mirrorX } from "@/lib/direction";
import { registerScroller, scrollProgress, setScrollProgress, snapScrollProgress } from "@/lib/scrollProgress";

/** Smooth vertical scroll. Lenis writes progress; the WebGL loop damps it. */
export function SmoothScroll() {
  const { dir } = useLanguage();

  useEffect(() => {
    scrollProgress.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      syncTouch: false,
      smoothWheel: !scrollProgress.reducedMotion,
      lerp: scrollProgress.reducedMotion ? 1 : 0.1,
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
        lenis.scrollTo(target, {
          offset: options?.offset ?? 0,
          immediate: options?.immediate,
          force: true,
        });
        if (options?.immediate) {
          publish();
          snapScrollProgress();
        }
      },
    });
    const seek = (progress: number) => {
      const next = Math.min(1, Math.max(0, progress));
      lenis.scrollTo(lenis.dimensions.limit.y * next, { immediate: true, force: true });
      setScrollProgress(lenis.limit > 0 ? lenis.progress : next);
      snapScrollProgress();
    };
    const view = window as Window & { __oneCommandSeek?: (progress: number) => void };
    view.__oneCommandSeek = seek;
    publish();
    snapScrollProgress();
    return () => {
      registerScroller(null);
      delete view.__oneCommandSeek;
      unsubscribe();
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
