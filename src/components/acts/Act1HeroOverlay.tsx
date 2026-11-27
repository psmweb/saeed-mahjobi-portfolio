"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePresentationSeconds, windowOpacity } from "./usePresentation";

export function Act1HeroOverlay() {
  const { dictionary, locale } = useLanguage();
  const seconds = usePresentationSeconds();
  const opacity = windowOpacity(seconds, 0, 0.35, 6.35, 7);
  const typed = Math.floor(dictionary.heroStage.prompt.length * Math.min(1, Math.max(0, (seconds - 0.4) / 1.6)));
  const command = dictionary.heroStage.prompt.slice(0, typed);
  const hidden = opacity < 0.04;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{ opacity }}
      data-act="1"
      data-opacity={opacity.toFixed(2)}
      aria-hidden={hidden}
    >
      <div className="absolute start-4 top-20 max-w-[13.5rem] sm:start-14 sm:top-28 sm:max-w-3xl">
        <h1
          className={
            locale === "fa"
              ? "font-fa text-5xl leading-tight text-white sm:text-7xl"
              : "font-hero-display text-5xl leading-none text-white sm:text-8xl"
          }
          style={{ textShadow: "0 0 28px rgba(245,158,11,0.55)" }}
        >
          {dictionary.heroStage.displayName}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#EDEDE6] sm:text-lg">{dictionary.heroStage.tagline}</p>
      </div>
      <div
        className="portrait-slot absolute end-3 top-24 h-40 w-28 sm:end-16 sm:top-32 sm:h-72 sm:w-52"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(245,158,11,0.22), rgba(20,16,12,0.35) 42%, rgba(5,7,12,0) 72%)",
        }}
      />
      <div className="pointer-events-auto absolute start-3 bottom-14 w-[min(100%-4.5rem,520px)] rounded-2xl border border-white/12 bg-[rgba(10,12,19,0.9)] shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:start-12">
        <div className="flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
          <i className="size-2.5 rounded-full bg-[#FF5F57]" />
          <i className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <i className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <p className="px-4 py-3 font-mono text-sm text-white sm:text-base">
          <span className="text-[#F2B544]">&gt; </span>
          {command}
          <span className="ms-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#F59E0B] align-middle motion-safe:animate-pulse" />
        </p>
        <ul className="flex flex-wrap gap-2 px-4 pb-4">
          {dictionary.heroStage.pills.map((pill) => (
            <li key={pill}>
              <span
                tabIndex={0}
                className="inline-flex rounded-full border border-[#F2B544]/50 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#FFD27A] outline-none hover:border-[#F59E0B] hover:bg-[#F59E0B]/15 focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                {pill}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
