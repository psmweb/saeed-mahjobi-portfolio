"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { subscribeScroll } from "@/lib/scrollProgress";
import { LOG_AT, readClock } from "@/components/scene/cinema";

export function LiveBuildLog() {
  const { dictionary } = useLanguage();
  const [line, setLine] = useState(dictionary.hud.logLines[0] ?? dictionary.hud.logIdle);

  useEffect(() => {
    return subscribeScroll((progress) => {
      const index = readClock(progress).log;
      setLine(dictionary.hud.logLines[index] ?? dictionary.hud.logLines[LOG_AT.length - 1] ?? dictionary.hud.logIdle);
    });
  }, [dictionary]);

  return (
    <aside
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex h-9 items-center gap-2.5 border-t border-white/10 bg-[rgba(8,10,16,0.88)] px-4 font-mono text-xs backdrop-blur-md sm:px-6"
    >
      <span className="size-[7px] shrink-0 rounded-full bg-[#3DDC97] shadow-[0_0_8px_#3DDC97]" />
      <p className="min-w-0 flex-1 truncate text-[#A9B0BE]">{line}</p>
      <p className="hidden shrink-0 tracking-[0.12em] text-[#566070] sm:block">{dictionary.hud.logMark}</p>
    </aside>
  );
}
