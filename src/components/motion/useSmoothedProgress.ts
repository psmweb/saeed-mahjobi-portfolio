"use client";

import { useEffect, useState } from "react";
import { subscribeSmoothed } from "@/lib/scrollProgress";

/** Presentation progress from the damped clock. Seek updates it on the same turn. */
export function useSmoothedProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(
    () =>
      subscribeSmoothed((value) => {
        setProgress((current) => (current === value ? current : value));
      }),
    [],
  );
  return progress;
}
