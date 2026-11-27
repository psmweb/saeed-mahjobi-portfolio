"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { locale, dictionary, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={dictionary.nav.languageToggle}
      className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-white/5 px-3 py-1.5 font-mono text-xs text-ink"
    >
      <Languages className="size-3.5 text-amber" aria-hidden />
      <span className={locale === "en" ? "text-amber" : "text-muted"}>EN</span>
      <span className="text-white/25" aria-hidden>
        /
      </span>
      <span className={locale === "fa" ? "text-amber" : "text-muted"}>فا</span>
    </button>
  );
}
