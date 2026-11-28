"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { locale, dictionary, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={dictionary.nav.languageToggle}
      className="inline-flex min-h-10 shrink-0 items-center gap-0.5 rounded-2xl border border-white/15 p-[3px] font-mono text-xs sm:min-h-0"
    >
      <span className={`rounded-[13px] px-2.5 py-1 sm:px-3 ${locale === "en" ? "bg-white font-semibold text-[#0a0c12]" : "text-[#8C93A3] hover:text-ink"}`}>
        EN
      </span>
      <span className="text-white/30" aria-hidden>
        |
      </span>
      <span className={`rounded-[13px] px-2.5 py-1 font-fa sm:px-3 ${locale === "fa" ? "bg-white font-semibold text-[#0a0c12]" : "text-[#8C93A3] hover:text-ink"}`}>
        فارسی
      </span>
    </button>
  );
}
