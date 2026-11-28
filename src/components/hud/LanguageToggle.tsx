"use client";

import { Magnetic } from "@/components/motion/Magnetic";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { locale, dictionary, toggleLocale } = useLanguage();

  return (
    <Magnetic className="shrink-0">
      <button
        type="button"
        onClick={toggleLocale}
        aria-label={dictionary.nav.languageToggle}
        className="group inline-flex min-h-10 shrink-0 items-center gap-0.5 rounded-2xl border border-white/15 p-[3px] font-mono text-xs transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] sm:min-h-0"
      >
        <span
          className={`rounded-[13px] px-2.5 py-1 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out-expo)] sm:px-3 ${
            locale === "en" ? "bg-white font-semibold text-[#0a0c12]" : "text-[#8C93A3] hover:text-ink group-focus-visible:text-ink"
          }`}
        >
          EN
        </span>
        <span className="text-white/30" aria-hidden>
          |
        </span>
        <span
          className={`rounded-[13px] px-2.5 py-1 font-fa transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out-expo)] sm:px-3 ${
            locale === "fa" ? "bg-white font-semibold text-[#0a0c12]" : "text-[#8C93A3] hover:text-ink group-focus-visible:text-ink"
          }`}
        >
          فارسی
        </span>
      </button>
    </Magnetic>
  );
}
