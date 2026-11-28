"use client";

import { SplitReveal } from "@/components/motion/SplitReveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { usePrefersReducedMotion } from "@/components/motion/usePointerMedia";
import { useSmoothedProgress } from "@/components/motion/useSmoothedProgress";
import {
  PRESENTATION_SECONDS,
  STAGE_ACCENTS,
  mapPresentationTime,
  readClock,
  venturePlacardOpacity,
} from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import {
  actHandoff,
  blendBoundaryOpacity,
  handoffBlur,
  transitionFilter,
} from "@/lib/actHandoff";

const ACCENT_DOTS: Record<number, readonly [string, string] | null> = {
  0: null,
  1: ["#10B981", "#F59E0B"],
  2: ["#38BDF8", "#10B981"],
  3: ["#F472B6", "#F59E0B"],
  4: null,
  5: null,
};

export function Act3VentureOverlay() {
  const { dictionary, dir, locale } = useLanguage();
  const progress = useSmoothedProgress();
  const reduced = usePrefersReducedMotion();
  const handoff = actHandoff(progress, reduced);
  const internal = readClock(progress).internal;
  const ranked = dictionary.ventureStages.map((stage, index) => ({
    stage,
    index,
    opacity: venturePlacardOpacity(internal, index),
  }));
  let active = ranked.find((item) => item.opacity > 0.02) ?? null;
  const exitInternal =
    handoff.boundary < 0
      ? internal
      : mapPresentationTime(Math.min(PRESENTATION_SECONDS, handoff.at + handoff.half));
  const incomingExit = handoff.to === 2 ? venturePlacardOpacity(exitInternal, 0) : 0;
  if (!active && handoff.to === 2 && handoff.pulse > 0 && incomingExit >= 0.45) {
    const stage = dictionary.ventureStages[0];
    if (stage) active = { stage, index: 0, opacity: 0 };
  }

  if (!active) return null;

  const { stage, index } = active;
  const naturalExit = handoff.to === 2 && index === 0 ? incomingExit : active.opacity;
  const opacity = blendBoundaryOpacity(2, active.opacity, naturalExit, handoff);
  const blur = handoffBlur(2, opacity, handoff);
  const revealed = opacity > 0.08;
  const settled = opacity > 0.92;
  const accent = STAGE_ACCENTS[index] ?? STAGE_ACCENTS[0];
  const dots = ACCENT_DOTS[index];
  const shift = (1 - opacity) * (dir === "rtl" ? 28 : -28);
  const latinChip = !/[\u0600-\u06FF]/.test(stage.chip);
  const parked = stage.satellites
    ? "sm:top-[clamp(4.5rem,28vh,220px)]"
    : "sm:top-[clamp(5.25rem,38vh,300px)]";

  return (
    <div
      className={`pointer-events-none fixed z-20 w-[min(17.75rem,calc(100%-5.25rem))] start-3 bottom-14 top-auto sm:bottom-auto sm:start-10 sm:w-[318px] ${parked}`}
      style={{ opacity, transform: `translateX(${shift}px)`, filter: transitionFilter(blur) }}
      data-act="3"
      data-venture={stage.id}
      data-opacity={opacity.toFixed(2)}
      aria-hidden={opacity < 0.04}
    >
      <TiltCard
        as="article"
        className={`${opacity > 0.4 ? "pointer-events-auto" : "pointer-events-none"} rounded-2xl border bg-[linear-gradient(180deg,rgba(22,26,38,0.78),rgba(10,12,19,0.86))] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md sm:px-[22px] sm:py-5`}
        style={{ borderColor: `${accent}66` }}
      >
        <p
          className={
            locale === "fa"
              ? "font-fa text-xs text-balance sm:text-[13px]"
              : "font-mono text-xs tracking-[0.14em] sm:text-[13px] sm:tracking-[0.16em]"
          }
          style={{ color: accent }}
        >
          <SplitReveal key={stage.id} text={stage.kicker} active={revealed} settled={settled} />
          {dots ? (
            <span className="ms-2 inline-flex translate-y-[-1px] gap-1 align-middle" aria-hidden>
              {dots.map((color) => (
                <i key={color} className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </span>
          ) : null}
        </p>
        <h2 className="mt-2.5 font-display text-[1.65rem] leading-[1.05] text-white sm:text-[2.15rem]">
          <SplitReveal key={`${stage.id}-title`} text={stage.title} active={revealed} settled={settled} delay={0.04} />
        </h2>
        <p className="mt-2.5 text-[13px] leading-snug text-pretty text-[#B4BAC6] sm:text-[13.5px] sm:leading-relaxed">{stage.body}</p>
        <p
          className={`mt-2.5 text-xs leading-relaxed text-pretty text-[#8C93A3] sm:text-[13px] ${
            locale === "fa" && /[\u0600-\u06FF]/.test(stage.stack) ? "font-fa" : "font-mono tracking-[0.04em]"
          }`}
        >
          {stage.stack}
        </p>
        <p className="mt-3.5">
          <span
            dir={latinChip ? "ltr" : undefined}
            className={
              stage.chip.length > 28
                ? `inline-block max-w-full text-pretty rounded-[10px] bg-gradient-to-br from-[#FFD27A] to-[#F2B544] px-3 py-1.5 text-[11px] font-semibold leading-snug text-[#120d02] shadow-[0_0_18px_rgba(242,181,68,0.28)] sm:text-xs ${latinChip ? "font-mono tracking-[0.04em]" : "font-fa"}`
                : `inline-flex rounded-[10px] bg-gradient-to-br from-[#FFD27A] to-[#F2B544] px-3 py-1.5 text-[11px] font-semibold text-[#120d02] shadow-[0_0_18px_rgba(242,181,68,0.28)] sm:text-xs ${latinChip ? "font-mono tracking-[0.04em]" : "font-fa"}`
            }
          >
            {stage.chip}
          </span>
        </p>
        {stage.barcode ? (
          <p
            dir="ltr"
            data-barcode={stage.barcode}
            className="mt-2.5 font-mono text-[12px] tracking-[0.14em] sm:text-[13px]"
            style={{ color: accent }}
          >
            {stage.barcode}
          </p>
        ) : null}
      </TiltCard>
      {stage.satellites ? (
        <div className="mt-2 flex flex-col gap-2" data-satellites={stage.id}>
          {stage.satellites.map((item) => (
            <TiltCard
              key={item.id}
              data-satellite={item.id}
              className={`${opacity > 0.4 ? "pointer-events-auto" : "pointer-events-none"} flex items-center justify-between gap-2 rounded-xl border border-white/[0.13] bg-[linear-gradient(180deg,rgba(22,26,38,0.78),rgba(10,12,19,0.82))] px-3.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md`}
            >
              <span className="font-display text-[13px] font-semibold leading-none text-white">{item.title}</span>
              <span
                dir="ltr"
                className="max-w-[62%] text-end font-mono text-[10px] leading-snug tracking-[0.03em] text-[#8C93A3] sm:text-[11px]"
              >
                {item.detail}
              </span>
            </TiltCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
