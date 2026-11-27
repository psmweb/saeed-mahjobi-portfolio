"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDictionary } from "@/data/i18n";
import type { Dictionary, Direction, Locale } from "@/data/i18n/types";
import { directionFor, mirrorX } from "@/lib/direction";

type LanguageContextValue = {
  locale: Locale;
  dir: Direction;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  mirrorX: (value: number) => number;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  const dir = directionFor(locale);
  const root = document.documentElement;
  root.lang = locale;
  root.dir = dir;
  document.title = getDictionary(locale).meta.title;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const dir = directionFor(locale);
  const dictionary = getDictionary(locale);

  const setLocale = useCallback((next: Locale) => {
    applyDocumentLocale(next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "fa" : "en");
  }, [locale, setLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir,
      dictionary,
      setLocale,
      toggleLocale,
      mirrorX: (amount) => mirrorX(amount, dir),
    }),
    [locale, dir, dictionary, setLocale, toggleLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        dir={dir}
        lang={locale}
        className={dir === "rtl" ? "overflow-x-clip font-fa" : "overflow-x-clip font-sans"}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return value;
}
