"use client";

import { ACT_ORDER } from "@/data/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToAct, subscribeScroll } from "@/lib/scrollProgress";
import { readClock } from "@/components/scene/cinema";
import { useEffect, useState } from "react";
import { LanguageToggle } from "./LanguageToggle";

export function GlassNavbar() {
  const { dictionary, locale } = useLanguage();
  const [chapter, setChapter] = useState(0);

  useEffect(
    () =>
      subscribeScroll((progress) => {
        const next = readClock(progress).chapter;
        setChapter((current) => (current === next ? current : next));
      }),
    [],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-[18px]">
      <div className="pointer-events-auto mx-auto flex h-[50px] max-w-[1180px] items-center gap-2 rounded-full border border-white/10 bg-[rgba(14,17,26,0.72)] px-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:gap-3 sm:px-3">
        <a href="#command" className="inline-flex shrink-0 items-center gap-2 rounded-full ps-1">
          <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#FFD27A] to-[#C98A1E] font-display text-[13px] font-semibold text-[#120d02]">
            SM
          </span>
          <span className="hidden font-display text-sm tracking-[0.16em] text-ink sm:inline">
            {dictionary.hud.brand}
          </span>
        </a>
        <nav aria-label={dictionary.nav.aria} className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          {ACT_ORDER.map((id, index) => {
            const active = chapter === index;
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollToAct(id)}
                aria-current={active ? "true" : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-2.5 text-xs transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out-expo)] sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-[13px] ${
                  locale === "fa" ? "font-fa" : "font-mono tracking-[0.08em]"
                } ${
                  active
                    ? "bg-[#F2B544] text-[#120d02]"
                    : "text-[#6C7383] hover:bg-white/10 hover:text-ink"
                }`}
              >
                <span className="sm:hidden">{dictionary.hud.chapters[index]?.split(" ")[0]}</span>
                <span className="hidden sm:inline">{dictionary.hud.chapters[index]}</span>
              </button>
            );
          })}
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}
