"use client";

import { actSectionHeight } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";

/** Scroll landmark for Act 1. The visible hero is the fixed overlay. */
export function Act1HeroCommand() {
  const { dictionary } = useLanguage();

  return (
    <section id="command" aria-label={dictionary.acts.command.title} style={{ height: actSectionHeight(0) }} />
  );
}
