"use client";

import { actSectionHeight } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";

/** Scroll landmark for Act 2. The visible evolution copy is the fixed overlay. */
export function Act2Evolution() {
  const { dictionary } = useLanguage();

  return (
    <section id="evolution" aria-label={dictionary.acts.evolution.title} style={{ height: actSectionHeight(1) }} />
  );
}
