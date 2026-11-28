"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { subscribeSmoothed } from "@/lib/scrollProgress";

/**
 * Subscribe to the damped clock without storing the sample in React state.
 * The listener runs on the same turn as the clock, including seek. Write
 * `opacity`, `filter`, and `transform` on a DOM node from here. Call
 * `setState` only when a discrete value changes, and bail out when it has not.
 */
export function useSmoothedProgress(onProgress: (progress: number) => void) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  useEffect(() => subscribeSmoothed((value) => onProgressRef.current(value)), []);
}

/**
 * Mirror one overlay frame onto a mutable bag and the live node.
 * Pass a copy of the bag into React (`style={{ ...bag }}`). Dev mode freezes
 * the object it receives, so the bag itself must stay writable.
 */
export function writeOverlayFrame(
  node: HTMLElement | null,
  bag: CSSProperties,
  frame: { opacity: number; filter?: string; transform?: string },
) {
  bag.opacity = frame.opacity;
  bag.filter = frame.filter ?? "";
  if (frame.transform !== undefined) bag.transform = frame.transform;
  if (!node) return;
  node.style.opacity = String(frame.opacity);
  node.style.filter = frame.filter ?? "";
  if (frame.transform !== undefined) node.style.transform = frame.transform;
  node.setAttribute("data-opacity", frame.opacity.toFixed(2));
}
