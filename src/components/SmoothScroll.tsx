"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { mirrorX } from "@/lib/direction";

/** Smooth vertical scroll. Horizontal wheel deltas flip with the writing direction. */
export function SmoothScroll() {
  const { dir } = useLanguage();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      virtualScroll: (data) => {
        data.deltaX = mirrorX(data.deltaX, dir);
        return true;
      },
    });
    return () => {
      lenis.destroy();
    };
  }, [dir]);

  return null;
}
