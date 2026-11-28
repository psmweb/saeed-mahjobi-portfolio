"use client";

import { useEffect, useState } from "react";
import { easeInOutCubic } from "@/lib/motion";
import { subscribeSmoothed } from "@/lib/scrollProgress";

/** Presentation seconds from the scroll clock. Seek lands on the same turn. */
export function usePresentationSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => subscribeSmoothed((progress) => setSeconds(progress * 52)), []);
  return seconds;
}

export function windowOpacity(time: number, start: number, fadeInEnd: number, fadeOutStart: number, end: number) {
  if (time <= start) return start === 0 ? 1 : 0;
  if (time < fadeInEnd) return easeInOutCubic((time - start) / (fadeInEnd - start));
  if (time <= fadeOutStart) return 1;
  if (time < end) return easeInOutCubic((end - time) / (end - fadeOutStart));
  return 0;
}
