"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  actHandoff,
  blendBoundaryOpacity,
  handoffBlur,
  transitionFilter,
} from "@/lib/actHandoff";
import { usePrefersReducedMotion } from "@/components/motion/usePointerMedia";
import { useSmoothedProgress } from "@/components/motion/useSmoothedProgress";
import { PRESENTATION_SECONDS } from "@/components/scene/cinema";
import { windowOpacity } from "./usePresentation";

export function Act1HeroOverlay() {
  const { dictionary, locale } = useLanguage();
  const progress = useSmoothedProgress();
  const reduced = usePrefersReducedMotion();
  const seconds = progress * PRESENTATION_SECONDS;
  const naturalAt = (time: number) => windowOpacity(time, 0, 0.35, 6.35, 7);
  const handoff = actHandoff(progress, reduced);
  const natural = naturalAt(seconds);
  const naturalExit = handoff.boundary < 0 ? natural : naturalAt(Math.min(PRESENTATION_SECONDS, handoff.at + handoff.half));
  const opacity = blendBoundaryOpacity(0, natural, naturalExit, handoff);
  const blur = handoffBlur(0, opacity, handoff);
  const typed = Math.floor(dictionary.heroStage.prompt.length * Math.min(1, Math.max(0, (seconds - 0.4) / 1.6)));
  const command = dictionary.heroStage.prompt.slice(0, typed);
  const hidden = opacity < 0.04;
  const persian = locale === "fa";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{ opacity, filter: transitionFilter(blur) }}
      data-act="1"
      data-opacity={opacity.toFixed(2)}
      aria-hidden={hidden}
    >
      <h1
        className={
          persian
            ? "absolute start-4 top-[4.7rem] max-w-[15.5rem] font-fa text-[2.45rem] font-black leading-[1.12] text-white sm:start-[6%] sm:top-[22%] sm:max-w-[32rem] sm:text-[4.4rem]"
            : "absolute start-4 top-[4.7rem] max-w-[16rem] font-hero-display text-[2.8rem] leading-none text-white sm:sr-only"
        }
        style={persian ? { textShadow: "0 0 28px rgba(245,158,11,0.45)" } : undefined}
      >
        {dictionary.heroStage.displayName}
      </h1>
      <p
        className={
          persian
            ? "absolute start-4 top-[11.4rem] max-w-[15.5rem] font-fa text-[13px] leading-relaxed text-[#EDEDE6] sm:start-[6%] sm:top-[46%] sm:max-w-xl sm:text-lg"
            : "absolute start-4 top-[8.5rem] max-w-[16rem] text-sm leading-relaxed text-[#EDEDE6] sm:start-14 sm:top-auto sm:bottom-[16.5rem] sm:max-w-xl sm:text-lg"
        }
      >
        {dictionary.heroStage.tagline}
      </p>
      <div className="pointer-events-auto absolute start-3 bottom-14 w-[min(100%-4.5rem,520px)] rounded-2xl border border-white/12 bg-[rgba(10,12,19,0.9)] shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:start-12">
        <div className="flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
          <i className="size-2.5 rounded-full bg-[#FF5F57]" />
          <i className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <i className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <p className="px-4 py-3 font-mono text-sm text-white sm:text-base" dir="ltr">
          <span className="text-[#F2B544]">&gt; </span>
          {command}
          <span className="ms-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#F59E0B] align-middle motion-safe:animate-pulse" />
        </p>
        <ul className="flex flex-wrap gap-2 px-4 pb-4">
          {dictionary.heroStage.pills.map((pill) => (
            <li key={pill}>
              <span
                tabIndex={0}
                className={`inline-flex rounded-full border border-[#F2B544]/50 bg-white/5 px-2.5 py-1 text-[#FFD27A] outline-none transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out-expo)] hover:border-[#F59E0B] hover:bg-[#F59E0B]/15 focus-visible:border-[#F59E0B] focus-visible:bg-[#F59E0B]/15 focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                  persian ? "font-fa text-xs" : "font-mono text-[11px]"
                }`}
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
