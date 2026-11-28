"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePresentationSeconds, windowOpacity } from "./usePresentation";

export function Act2EvolutionOverlay() {
  const { dictionary } = useLanguage();
  const seconds = usePresentationSeconds();
  const opacity = windowOpacity(seconds, 7, 7.45, 13.3, 14);
  const hidden = opacity < 0.04;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-12 z-20 px-4 sm:px-12"
      style={{ opacity }}
      data-act="2"
      data-opacity={opacity.toFixed(2)}
      aria-hidden={hidden}
    >
      <div className="max-w-xl rounded-2xl border border-white/15 bg-[rgba(12,15,24,0.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5">
        <p className="font-mono text-xs tracking-[0.14em] text-[#F2B544] sm:text-[13px] sm:tracking-[0.18em]">02 · 2016 → 2026</p>
        <ol className="mt-3 space-y-2">
          {dictionary.evolutionStage.items.map((item) => (
            <li key={item.year} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-hero-display text-2xl text-white sm:text-3xl">{item.year}</span>
              <span className="text-sm text-[#EDEDE6] sm:text-base">{item.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
