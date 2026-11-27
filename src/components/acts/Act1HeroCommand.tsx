"use client";

import { portraits } from "@/data/portraits";
import { useLanguage } from "@/context/LanguageContext";
import { Portrait } from "../Portrait";
import { ActFrame } from "./ActFrame";

export function Act1HeroCommand() {
  const { dictionary } = useLanguage();

  return (
    <ActFrame id="command" heading="h1">
      <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_240px]">
        <p className="font-mono text-sm text-cyan sm:text-base">
          <span className="text-amber">&gt;</span> {dictionary.heroPrompt}
        </p>
        <Portrait
          src={portraits.editorial}
          alt={dictionary.brand.name}
          priority
          className="w-full max-w-[240px] justify-self-start md:justify-self-end"
        />
      </div>
    </ActFrame>
  );
}
