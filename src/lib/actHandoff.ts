import {
  ACT_BOUNDARY_INTERNAL,
  HANDOFF_VIEWPORTS,
  PRESENTATION_SECONDS,
  SCROLL_VIEWPORTS,
  presentationForInternal,
} from "@/components/scene/cinema";
import { duration, easeInOutCubic } from "@/lib/motion";

/**
 * Scroll-driven handoff between consecutive acts.
 *
 * The window is `HANDOFF_VIEWPORTS` (0.35 viewport) of the scroll, which is
 * 1.4s of the 52s clock, or `duration.micro` when reduced motion is on.
 * Nothing here uses a timer: `pulse` is 0 outside the window and 1 on the
 * boundary, and `mix` runs 0 → 1 across that window with a cubic. Hold frames
 * sit outside every window, so they keep the approved opacity, light, and focus.
 */

export type ActHandoff = {
  /** 0 outside a boundary, 1 on the boundary. */
  pulse: number;
  /** 0 at the start of the window, 1 at the end. */
  mix: number;
  from: number;
  to: number;
  /** Presentation seconds of the active boundary. */
  at: number;
  half: number;
  reduced: boolean;
  /** -1 when the clock is outside every window. */
  boundary: number;
};

const IDLE_HANDOFF: ActHandoff = {
  pulse: 0,
  mix: 0,
  from: 0,
  to: 1,
  at: 0,
  half: 0,
  reduced: false,
  boundary: -1,
};

const clamp01 = (value: number) => (value <= 0 ? 0 : value >= 1 ? 1 : value);

export function actHandoff(progress: number, reduced: boolean): ActHandoff {
  const presentation = clamp01(progress) * PRESENTATION_SECONDS;
  const windowSeconds = reduced
    ? duration.micro
    : (HANDOFF_VIEWPORTS / SCROLL_VIEWPORTS) * PRESENTATION_SECONDS;
  const half = windowSeconds / 2;
  let boundary = -1;
  let nearest = half;
  for (let index = 0; index < ACT_BOUNDARY_INTERNAL.length; index += 1) {
    const at = presentationForInternal(ACT_BOUNDARY_INTERNAL[index]);
    const distance = Math.abs(presentation - at);
    if (distance < nearest) {
      nearest = distance;
      boundary = index;
    }
  }
  if (boundary < 0) return reduced ? { ...IDLE_HANDOFF, reduced: true } : IDLE_HANDOFF;
  const at = presentationForInternal(ACT_BOUNDARY_INTERNAL[boundary]);
  const along = (presentation - (at - half)) / (half * 2);
  const unit = clamp01(along);
  return {
    pulse: Math.sin(Math.PI * unit),
    mix: easeInOutCubic(unit),
    from: boundary,
    to: boundary + 1,
    at,
    half,
    reduced,
    boundary,
  };
}

/**
 * Per-act key, hemisphere, and fog. Act 1 matches the resting rig
 * (`#fff1dc` at 1.6, sky `#c9d4ff`). The blend is applied only while
 * `pulse` is above zero and is dropped the moment the window closes.
 */
export type ActLight = {
  key: string;
  keyIntensity: number;
  hemi: string;
  hemiIntensity: number;
  fog: string;
  fogDensity: number;
};

export const ACT_LIGHTS: readonly ActLight[] = [
  { key: "#fff1dc", keyIntensity: 1.6, hemi: "#c9d4ff", hemiIntensity: 0.5, fog: "#05070C", fogDensity: 0.02 },
  { key: "#d7e6ff", keyIntensity: 1.28, hemi: "#b7c6ef", hemiIntensity: 0.62, fog: "#070B14", fogDensity: 0.03 },
  { key: "#ffe3b5", keyIntensity: 1.82, hemi: "#e6d2a8", hemiIntensity: 0.44, fog: "#0B0905", fogDensity: 0.02 },
  { key: "#fff4e4", keyIntensity: 2.05, hemi: "#c9d4ff", hemiIntensity: 0.52, fog: "#05070C", fogDensity: 0.026 },
  { key: "#ffd29a", keyIntensity: 1.72, hemi: "#f0d2aa", hemiIntensity: 0.58, fog: "#080C15", fogDensity: 0.018 },
];

const MAX_BLUR = 8;

/**
 * Overlay opacity for one act. Outside the window this is the approved curve.
 * Outgoing copy can only dim. Incoming copy eases in early only when that
 * copy is actually on screen by the end of the window, so a later act does
 * not flash and disappear.
 */
export function blendBoundaryOpacity(
  act: number,
  natural: number,
  naturalExit: number,
  handoff: ActHandoff,
): number {
  if (handoff.boundary < 0 || handoff.pulse <= 0) return natural;
  const outgoing = act === handoff.from;
  const incoming = act === handoff.to;
  if (!outgoing && !incoming) return natural;
  if (outgoing) {
    const keep = 1 - handoff.pulse * handoff.mix * (handoff.reduced ? 1 : 0.75);
    return Math.min(1, Math.max(0, natural * keep));
  }
  if (naturalExit < 0.45) return natural;
  const next = natural + (handoff.mix - natural) * handoff.pulse;
  return Math.min(1, Math.max(0, next));
}

/** Blur in pixels. Zero at rest, under reduced motion, and on a hidden overlay. */
export function handoffBlur(act: number, opacity: number, handoff: ActHandoff): number {
  if (handoff.reduced || handoff.pulse <= 0 || opacity < 0.04) return 0;
  if (act === handoff.from) return handoff.pulse * handoff.mix * MAX_BLUR;
  if (act === handoff.to) return handoff.pulse * (1 - handoff.mix) * MAX_BLUR;
  return 0;
}

export function transitionFilter(blur: number): string | undefined {
  return blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined;
}
