"use client";

import { useLanguage } from "@/context/LanguageContext";

/** Scroll landmark for Act 1. The visible hero is the fixed overlay. */
export function Act1HeroCommand() {
  const { dictionary } = useLanguage();

  return <section id="command" aria-label={dictionary.acts.command.title} className="min-h-[100svh]" />;
}
