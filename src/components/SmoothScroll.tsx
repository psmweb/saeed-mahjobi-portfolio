"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { mirrorX } from "@/lib/direction";
import { registerScroller, scrollProgress, setScrollProgress } from "@/lib/scrollProgress";

/** Smooth vertical scroll. Progress is written to a ref the 3D loop reads directly. */
export function SmoothScroll() {
  const { dir } = useLanguage();

  useEffect(() => {
    scrollProgress.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      virtualScroll: (data) => {
        data.deltaX = mirrorX(data.deltaX, dir);
        return true;
      },
    });
    registerScroller(lenis);
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max <= 0 ? 0 : window.scrollY / max);
    };
    const seek = (progress: number) => {
      const next = Math.min(1, Math.max(0, progress));
      lenis.scrollTo(lenis.dimensions.limit.y * next, { immediate: true });
      measure();
    };
    const view = window as Window & { __oneCommandSeek?: (progress: number) => void };
    view.__oneCommandSeek = seek;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      measure();
      requestAnimationFrame(tick);
    };
    tick();
    return () => {
      alive = false;
      registerScroller(null);
      delete view.__oneCommandSeek;
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
