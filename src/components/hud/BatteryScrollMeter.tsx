"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { subscribeScroll } from "@/lib/scrollProgress";
import { readClock } from "@/components/scene/cinema";

export function BatteryScrollMeter() {
  const { dictionary } = useLanguage();
  const [level, setLevel] = useState(0);

  useEffect(() => subscribeScroll((progress) => setLevel(readClock(progress).battery)), []);

  const percent = Math.round(level * 100);

  return (
    <div
      className="pointer-events-none fixed top-[28%] z-40 flex flex-col items-center gap-2 inset-e-2 sm:inset-e-4 lg:inset-e-5"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={dictionary.hud.batteryLabel}
    >
      <div className="relative h-36 w-[18px] rounded-[6px] border-[1.5px] border-white/30 sm:h-[250px]">
        <span className="absolute -top-1.5 left-1/2 h-1 w-[7px] -translate-x-1/2 rounded-t-[2px] bg-white/35" />
        <span
          className="absolute inset-x-[2px] bottom-[2px] rounded-[3px] bg-gradient-to-t from-[#C98A1E] to-[#FFD27A] shadow-[0_0_14px_rgba(242,181,68,0.7)]"
          style={{ height: `${level * 100}%`, maxHeight: "calc(100% - 4px)" }}
        />
      </div>
      <span className="font-mono text-xs text-[#F2B544] sm:text-[13px]">
        {percent}%{percent >= 100 ? " ✓" : ""}
      </span>
    </div>
  );
}
