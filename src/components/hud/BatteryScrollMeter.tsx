"use client";

import { Battery } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { clampProgress } from "@/lib/direction";

export function BatteryScrollMeter() {
  const { dictionary } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(clampProgress(max <= 0 ? 0 : window.scrollY / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const percent = Math.round(progress * 100);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-white/10 md:hidden" aria-hidden>
        <div className="h-full bg-amber" style={{ width: `${percent}%` }} />
      </div>
      <div
        className="fixed top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex inset-e-3 lg:inset-e-5"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={dictionary.hud.batteryLabel}
      >
        <Battery className="size-4 text-amber" aria-hidden />
        <div className="relative h-40 w-7 rounded-md border border-amber/70 p-1">
          <span className="absolute -top-1.5 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-t-sm bg-amber/70" />
          <span
            className="absolute inset-x-1 bottom-1 rounded-sm bg-amber"
            style={{ height: `${percent}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-amber">{percent}</span>
      </div>
    </>
  );
}
