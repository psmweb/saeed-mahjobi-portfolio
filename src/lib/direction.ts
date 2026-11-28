import gsap from "gsap";
import type { Direction, Locale } from "@/data/i18n/types";

// Nothing in the page tweens through GSAP. Sleep the ticker so it does not
// keep a second animation frame beside the WebGL clock.
if (typeof window !== "undefined") gsap.ticker.sleep();

export function directionFor(locale: Locale): Direction {
  return locale === "fa" ? "rtl" : "ltr";
}

/**
 * Flip a horizontal offset when the document is RTL.
 * Vertical scroll stays natural in both languages.
 */
export function mirrorX(value: number, dir: Direction): number {
  return dir === "rtl" ? -value : value;
}

export function mirrorVector(
  vector: readonly [number, number, number],
  dir: Direction,
): [number, number, number] {
  return [mirrorX(vector[0], dir), vector[1], vector[2]];
}

export function clampProgress(value: number): number {
  return gsap.utils.clamp(0, 1, value);
}
