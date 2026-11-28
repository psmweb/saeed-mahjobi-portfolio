"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { usePrefersReducedMotion } from "@/components/motion/usePointerMedia";
import { useSmoothedProgress, writeOverlayFrame } from "@/components/motion/useSmoothedProgress";
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
import { scrollProgress } from "@/lib/scrollProgress";

const ACCENT_DOTS: Record<number, readonly [string, string] | null> = {
  0: null,
  1: ["#10B981", "#F59E0B"],
  2: ["#38BDF8", "#10B981"],
  3: ["#F472B6", "#F59E0B"],
  4: null,
  5: null,
};

type VentureCard = {
  index: number;
  revealed: boolean;
  settled: boolean;
  interactive: boolean;
  hidden: boolean;
};

function sameCard(current: VentureCard | null, next: VentureCard | null) {
  if (current === next) return true;
  if (!current || !next) return false;
  return (
    current.index === next.index &&
    current.revealed === next.revealed &&
    current.settled === next.settled &&
    current.interactive === next.interactive &&
    current.hidden === next.hidden
  );
}

export function Act3VentureOverlay() {
  const { dictionary, dir, locale } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const frameStyle = useRef<CSSProperties>({ opacity: 0, transform: "translateX(0px)" });
  const reducedRef = useRef(reduced);
  const dirRef = useRef(dir);
  const stageCountRef = useRef(dictionary.ventureStages.length);
  reducedRef.current = reduced;
  dirRef.current = dir;
  stageCountRef.current = dictionary.ventureStages.length;
  const [card, setCard] = useState<VentureCard | null>(null);

  const paintRef = useRef<(progress: number) => void>(() => {});
  paintRef.current = (progress) => {
    const handoff = actHandoff(progress, reducedRef.current);
    const internal = readClock(progress).internal;
    let activeIndex = -1;
    let activeOpacity = 0;
    const stageCount = stageCountRef.current;
    for (let index = 0; index < stageCount; index += 1) {
      const placard = venturePlacardOpacity(internal, index);
      if (placard > 0.02) {
        activeIndex = index;
        activeOpacity = placard;
        break;
      }
    }
    const exitInternal =
      handoff.boundary < 0
        ? internal
        : mapPresentationTime(Math.min(PRESENTATION_SECONDS, handoff.at + handoff.half));
    const incomingExit = handoff.to === 2 ? venturePlacardOpacity(exitInternal, 0) : 0;
    if (activeIndex < 0 && handoff.to === 2 && handoff.pulse > 0 && incomingExit >= 0.45) {
      activeIndex = 0;
      activeOpacity = 0;
    }

    if (activeIndex < 0) {
      setCard((current) => (current === null ? current : null));
      return;
    }

    const naturalExit = handoff.to === 2 && activeIndex === 0 ? incomingExit : activeOpacity;
    const opacity = blendBoundaryOpacity(2, activeOpacity, naturalExit, handoff);
    const blur = handoffBlur(2, opacity, handoff);
    const shift = (1 - opacity) * (dirRef.current === "rtl" ? 28 : -28);
    writeOverlayFrame(rootRef.current, frameStyle.current, {
      opacity,
      filter: transitionFilter(blur),
      transform: `translateX(${shift}px)`,
    });
    const next: VentureCard = {
      index: activeIndex,
      revealed: opacity > 0.08,
      settled: opacity > 0.92,
      interactive: opacity > 0.4,
      hidden: opacity < 0.04,
    };
    setCard((current) => (sameCard(current, next) ? current : next));
  };

  useSmoothedProgress((progress) => paintRef.current(progress));
  useEffect(() => {
    paintRef.current(scrollProgress.smoothed);
  }, [reduced, locale, dir, card]);

  if (!card) return null;

  const stage = dictionary.ventureStages[card.index];
  if (!stage) return null;

  const accent = STAGE_ACCENTS[card.index] ?? STAGE_ACCENTS[0];
  const dots = ACCENT_DOTS[card.index];
  const latinChip = !/[\u0600-\u06FF]/.test(stage.chip);
  const parked = stage.satellites
    ? "sm:top-[clamp(4.5rem,28vh,220px)]"
    : "sm:top-[clamp(5.25rem,38vh,300px)]";
  const interactive = card.interactive ? "pointer-events-auto" : "pointer-events-none";

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none fixed z-20 w-[min(17.75rem,calc(100%-5.25rem))] start-3 bottom-14 top-auto sm:bottom-auto sm:start-10 sm:w-[318px] ${parked}`}
      style={{ ...frameStyle.current }}
      data-act="3"
      data-venture={stage.id}
      aria-hidden={card.hidden}
    >
      <TiltCard
        as="article"
        className={`${interactive} rounded-2xl border bg-[linear-gradient(180deg,rgba(22,26,38,0.78),rgba(10,12,19,0.86))] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md sm:px-[22px] sm:py-5`}
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
          <SplitReveal key={stage.id} text={stage.kicker} active={card.revealed} settled={card.settled} />
          {dots ? (
            <span className="ms-2 inline-flex translate-y-[-1px] gap-1 align-middle" aria-hidden>
              {dots.map((color) => (
                <i key={color} className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </span>
          ) : null}
        </p>
        <h2 className="mt-2.5 font-display text-[1.65rem] leading-[1.05] text-white sm:text-[2.15rem]">
          <SplitReveal key={`${stage.id}-title`} text={stage.title} active={card.revealed} settled={card.settled} delay={0.04} />
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
              className={`${interactive} flex items-center justify-between gap-2 rounded-xl border border-white/[0.13] bg-[linear-gradient(180deg,rgba(22,26,38,0.78),rgba(10,12,19,0.82))] px-3.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md`}
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
