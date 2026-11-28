"use client";

import { useEffect, useRef } from "react";
import { PRESENTATION_SECONDS } from "@/components/scene/cinema";
import { easeInOutQuint } from "@/lib/motion";
import { subscribeSmoothed } from "@/lib/scrollProgress";

/**
 * Presentation seconds from the damped clock, without React state.
 * Seek notifies on the same turn. Store a discrete result only when it changes.
 */
export function usePresentationSeconds(onSeconds: (seconds: number) => void) {
  const onSecondsRef = useRef(onSeconds);
  onSecondsRef.current = onSeconds;
  useEffect(
    () => subscribeSmoothed((progress) => onSecondsRef.current(progress * PRESENTATION_SECONDS)),
    [],
  );
}

export function windowOpacity(time: number, start: number, fadeInEnd: number, fadeOutStart: number, end: number) {
  if (time <= start) return start === 0 ? 1 : 0;
  if (time < fadeInEnd) return easeInOutQuint((time - start) / (fadeInEnd - start));
  if (time <= fadeOutStart) return 1;
  if (time < end) return easeInOutQuint((end - time) / (end - fadeOutStart));
  return 0;
}
