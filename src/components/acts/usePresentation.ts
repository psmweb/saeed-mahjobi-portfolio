"use client";

import { useEffect, useState } from "react";
import { subscribeScroll } from "@/lib/scrollProgress";

export function usePresentationSeconds() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => subscribeScroll((progress) => setSeconds(progress * 52)), []);
  return seconds;
}

export function windowOpacity(time: number, start: number, fadeInEnd: number, fadeOutStart: number, end: number) {
  if (time <= start) return start === 0 ? 1 : 0;
  if (time < fadeInEnd) return (time - start) / (fadeInEnd - start);
  if (time <= fadeOutStart) return 1;
  if (time < end) return (end - time) / (end - fadeOutStart);
  return 0;
}
