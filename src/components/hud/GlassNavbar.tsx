"use client";

import { Command } from "lucide-react";
import { ACT_ORDER } from "@/data/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function GlassNavbar() {
  const { dictionary } = useLanguage();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-obsidian/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <a href="#command" className="inline-flex items-center gap-2 font-display text-sm text-ink">
          <Command className="size-4 text-amber" aria-hidden />
          {dictionary.brand.command}
        </a>
        <nav aria-label={dictionary.nav.aria} className="ms-auto hidden items-center gap-5 md:flex">
          {ACT_ORDER.map((id) => (
            <a key={id} href={`#${id}`} className="text-sm text-muted transition-colors hover:text-ink">
              {dictionary.acts[id].title}
            </a>
          ))}
        </nav>
        <div className="ms-auto md:ms-0">
          <LanguageToggle />
        </div>
      </div>
      <nav aria-label={dictionary.nav.aria} className="flex gap-4 overflow-x-auto px-5 pb-3 md:hidden">
        {ACT_ORDER.map((id) => (
          <a key={id} href={`#${id}`} className="shrink-0 text-sm text-muted">
            {dictionary.acts[id].title}
          </a>
        ))}
      </nav>
    </header>
  );
}
