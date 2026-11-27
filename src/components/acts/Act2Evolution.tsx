"use client";

import { useLanguage } from "@/context/LanguageContext";

/** Scroll landmark for Act 2. The visible evolution copy is the fixed overlay. */
export function Act2Evolution() {
  const { dictionary } = useLanguage();

  return <section id="evolution" aria-label={dictionary.acts.evolution.title} className="min-h-[100svh]" />;
}
