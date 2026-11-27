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
    const publish = () => {
      const limit = lenis.dimensions.limit.y;
      setScrollProgress(limit <= 0 ? 0 : lenis.animatedScroll / limit);
    };
    publish();
    const unsubscribe = lenis.on("scroll", publish);
    return () => {
      unsubscribe();
      registerScroller(null);
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
