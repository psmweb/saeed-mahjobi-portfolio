"use client";

import { useEffect, useState } from "react";
import { actHandoff } from "@/lib/actHandoff";
import { depthVeilEnabled, sceneQuality, subscribeQuality } from "@/lib/performanceTier";
import { scrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "./usePointerMedia";
import { useSmoothedProgress } from "./useSmoothedProgress";

function useQualityVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeQuality(() => setVersion((current) => current + 1)), []);
  return version;
}

/**
 * Depth-of-field feel for the act handoff. A DOM vignette, plus a very small
 * backdrop blur on the high tier only. No postprocessing pass, so the draw
 * call count does not move. The node is absent outside the window.
 */
export function TransitionVeil() {
  const progress = useSmoothedProgress();
  const reduced = usePrefersReducedMotion();
  useQualityVersion();
  const handoff = actHandoff(progress, reduced || scrollProgress.reducedMotion);
  if (handoff.pulse < 0.02) return null;

  if (handoff.reduced) {
    return (
      <div
        aria-hidden
        data-act-veil="fade"
        data-from={handoff.from}
        data-to={handoff.to}
        data-pulse={handoff.pulse.toFixed(3)}
        className="pointer-events-none fixed inset-0 z-[15] bg-[#05070C]"
        style={{ opacity: handoff.pulse * 0.18 }}
      />
    );
  }

  if (sceneQuality.tier === "low" || sceneQuality.degraded) return null;

  const blur = depthVeilEnabled() ? handoff.pulse * 2.2 : 0;
  return (
    <div
      aria-hidden
      data-act-veil={blur > 0.2 ? "dof" : "vignette"}
      data-from={handoff.from}
      data-to={handoff.to}
      data-pulse={handoff.pulse.toFixed(3)}
      className="pointer-events-none fixed inset-0 z-[15]"
      style={{
        opacity: handoff.pulse,
        background: `radial-gradient(ellipse at center, rgba(5,7,12,0) 38%, rgba(5,7,12,${(0.42 + handoff.pulse * 0.22).toFixed(3)}) 100%)`,
        backdropFilter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
        WebkitBackdropFilter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    />
  );
}
