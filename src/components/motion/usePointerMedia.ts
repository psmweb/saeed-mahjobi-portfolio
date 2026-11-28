"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function matches(query: string) {
  return window.matchMedia(query).matches;
}

/** True when the visitor asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => subscribe("(prefers-reduced-motion: reduce)", onChange),
    () => matches("(prefers-reduced-motion: reduce)"),
    () => false,
  );
}

/**
 * Pointer follow is allowed only for a fine pointer that can hover,
 * and never when reduced motion is on. Touch and coarse pointers stay still.
 */
export function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const stopHover = subscribe("(hover: hover) and (pointer: fine)", onChange);
      const stopReduce = subscribe("(prefers-reduced-motion: reduce)", onChange);
      return () => {
        stopHover();
        stopReduce();
      };
    },
    () => matches("(hover: hover) and (pointer: fine)") && !matches("(prefers-reduced-motion: reduce)"),
    () => false,
  );
}

/** Resting border box, ignoring a transform this interaction already applied. */
export function readRestBox(node: HTMLElement): DOMRect {
  const previous = node.style.transform;
  if (previous) node.style.transform = "none";
  const box = node.getBoundingClientRect();
  node.style.transform = previous;
  return box;
}
