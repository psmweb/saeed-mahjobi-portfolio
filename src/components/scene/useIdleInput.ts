"use client";

import { useEffect, useRef, useState } from "react";

const ACTIVITY = ["scroll", "wheel", "touchstart", "touchmove", "touchend"] as const;

/**
 * True only after `quietMs` without scroll, wheel, or touch.
 * Input on a frame clears the budget, including when that frame ran long, so a
 * hitch during scroll cannot open the gate. A slow frame with no input still
 * counts: a still page is allowed to step the ratio down.
 * `idleRef` updates in that frame, before the following React effect.
 */
export function useIdleInput(quietMs = 500) {
  const idleRef = useRef(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let quiet = 0;
    let lastFrame = performance.now();
    let sawActivity = false;
    let raf = 0;

    const markActive = () => {
      sawActivity = true;
      quiet = 0;
      if (idleRef.current) {
        idleRef.current = false;
        setIdle(false);
      }
    };

    const tick = (now: number) => {
      const dt = now - lastFrame;
      lastFrame = now;
      if (sawActivity) quiet = 0;
      else quiet += dt;
      sawActivity = false;
      if (quiet >= quietMs && !idleRef.current) {
        idleRef.current = true;
        setIdle(true);
      }
      raf = requestAnimationFrame(tick);
    };

    const options: AddEventListenerOptions = { capture: true, passive: true };
    for (const name of ACTIVITY) window.addEventListener(name, markActive, options);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      for (const name of ACTIVITY) window.removeEventListener(name, markActive, options);
    };
  }, [quietMs]);

  return { idle, idleRef };
}
