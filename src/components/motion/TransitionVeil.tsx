"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { actHandoff } from "@/lib/actHandoff";
import { depthVeilEnabled, sceneQuality, subscribeQuality } from "@/lib/performanceTier";
import { scrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "./usePointerMedia";
import { useSmoothedProgress } from "./useSmoothedProgress";

type VeilMode = "off" | "fade" | "live";

type VeilState = {
  mode: VeilMode;
  from: number;
  to: number;
};

const REST_VEIL: VeilState = { mode: "off", from: 0, to: 1 };

function sameVeil(current: VeilState, next: VeilState) {
  return current.mode === next.mode && current.from === next.from && current.to === next.to;
}

/**
 * Depth-of-field feel for the act handoff. A DOM vignette, plus a very small
 * backdrop blur on the high tier only. No postprocessing pass, so the draw
 * call count does not move. The node is absent outside the window.
 * Opacity, blur, and the gradient are written on the node from the clock.
 */
export function TransitionVeil() {
  const reduced = usePrefersReducedMotion();
  const nodeRef = useRef<HTMLDivElement>(null);
  const fadeStyle = useRef<CSSProperties>({ opacity: 0 });
  const liveStyle = useRef<CSSProperties>({ opacity: 0 });
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [veil, setVeil] = useState<VeilState>(REST_VEIL);

  const paintRef = useRef<(progress: number) => void>(() => {});
  paintRef.current = (progress) => {
    const handoff = actHandoff(progress, reducedRef.current || scrollProgress.reducedMotion);
    let mode: VeilMode = "off";
    if (handoff.pulse >= 0.02) {
      if (handoff.reduced) mode = "fade";
      else if (sceneQuality.tier !== "low" && !sceneQuality.degraded) mode = "live";
    }
    const blur = mode === "live" && depthVeilEnabled() ? handoff.pulse * 2.2 : 0;
    if (mode === "fade") fadeStyle.current.opacity = handoff.pulse * 0.18;
    if (mode === "live") {
      const filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "";
      liveStyle.current.opacity = handoff.pulse;
      liveStyle.current.background = `radial-gradient(ellipse at center, rgba(5,7,12,0) 38%, rgba(5,7,12,${(0.42 + handoff.pulse * 0.22).toFixed(3)}) 100%)`;
      liveStyle.current.backdropFilter = filter;
      liveStyle.current.WebkitBackdropFilter = filter;
    }
    const node = nodeRef.current;
    if (node && mode !== "off") {
      node.style.opacity = String(mode === "fade" ? handoff.pulse * 0.18 : handoff.pulse);
      if (mode === "live") {
        node.style.background = String(liveStyle.current.background ?? "");
        const filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "";
        node.style.backdropFilter = filter;
        node.style.setProperty("-webkit-backdrop-filter", filter);
        node.setAttribute("data-act-veil", blur > 0.2 ? "dof" : "vignette");
      } else {
        node.setAttribute("data-act-veil", "fade");
      }
      node.setAttribute("data-from", String(handoff.from));
      node.setAttribute("data-to", String(handoff.to));
      node.setAttribute("data-pulse", handoff.pulse.toFixed(3));
    }
    const next: VeilState = { mode, from: handoff.from, to: handoff.to };
    setVeil((current) => (sameVeil(current, next) ? current : next));
  };

  useSmoothedProgress((progress) => paintRef.current(progress));
  useEffect(() => subscribeQuality(() => paintRef.current(scrollProgress.smoothed)), []);
  useEffect(() => {
    paintRef.current(scrollProgress.smoothed);
  }, [reduced, veil.mode]);

  if (veil.mode === "off") return null;

  if (veil.mode === "fade") {
    return (
      <div
        ref={nodeRef}
        aria-hidden
        data-act-veil="fade"
        data-from={veil.from}
        data-to={veil.to}
        className="pointer-events-none fixed inset-0 z-[15] bg-[#05070C]"
        style={{ ...fadeStyle.current }}
      />
    );
  }

  return (
    <div
      ref={nodeRef}
      aria-hidden
      data-from={veil.from}
      data-to={veil.to}
      className="pointer-events-none fixed inset-0 z-[15]"
      style={{ ...liveStyle.current }}
    />
  );
}
