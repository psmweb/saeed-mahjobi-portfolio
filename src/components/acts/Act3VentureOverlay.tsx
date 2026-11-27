"use client";

import { useEffect, useState } from "react";
import { STAGE_ACCENTS, readClock, venturePlacardOpacity } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import { subscribeScroll } from "@/lib/scrollProgress";

const ACCENT_DOTS: Record<number, readonly [string, string] | null> = {
  0: null,
  1: ["#10B981", "#F59E0B"],
  2: ["#38BDF8", "#10B981"],
};

export function Act3VentureOverlay() {
  const { dictionary, dir, locale } = useLanguage();
  const [internal, setInternal] = useState(0);

  useEffect(() => subscribeScroll((progress) => setInternal(readClock(progress).internal)), []);

  const active = dictionary.ventureStages
    .map((stage, index) => ({ stage, index, opacity: venturePlacardOpacity(internal, index) }))
    .find((item) => item.opacity > 0.02);

  if (!active) return null;

  const { stage, index, opacity } = active;
  const accent = STAGE_ACCENTS[index] ?? STAGE_ACCENTS[0];
  const dots = ACCENT_DOTS[index];
  const shift = (1 - opacity) * (dir === "rtl" ? 28 : -28);
  const latinChip = !/[\u0600-\u06FF]/.test(stage.chip);

  return (
    <div
      className="pointer-events-none fixed z-20 w-[min(17.75rem,calc(100%-5.25rem))] start-3 bottom-14 top-auto sm:bottom-auto sm:start-10 sm:top-[clamp(5.25rem,38vh,300px)] sm:w-[318px]"
      style={{ opacity, transform: `translateX(${shift}px)` }}
      data-act="3"
      data-venture={stage.id}
      data-opacity={opacity.toFixed(2)}
      aria-hidden={opacity < 0.04}
    >
      <article
        className="rounded-2xl border bg-[linear-gradient(180deg,rgba(22,26,38,0.78),rgba(10,12,19,0.86))] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md sm:px-[22px] sm:py-5"
        style={{ borderColor: `${accent}66` }}
      >
        <p
          className={
            locale === "fa"
              ? "font-mono text-[11px] text-balance"
              : "font-mono text-[11px] tracking-[0.16em]"
          }
          style={{ color: accent }}
        >
          {stage.kicker}
          {dots ? (
            <span className="ms-2 inline-flex translate-y-[-1px] gap-1 align-middle" aria-hidden>
              {dots.map((color) => (
                <i key={color} className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </span>
          ) : null}
        </p>
        <h2 className="mt-2.5 font-display text-[1.65rem] leading-[1.05] text-white sm:text-[2.15rem]">{stage.title}</h2>
        <p className="mt-2.5 text-[13px] leading-snug text-[#B4BAC6] sm:text-[13.5px] sm:leading-relaxed">{stage.body}</p>
        <p className="mt-2.5 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-[#8C93A3]">{stage.stack}</p>
        <p className="mt-3.5">
          <span
            dir={latinChip ? "ltr" : undefined}
            className="inline-flex rounded-[10px] bg-gradient-to-br from-[#FFD27A] to-[#F2B544] px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.04em] text-[#120d02] shadow-[0_0_18px_rgba(242,181,68,0.28)] sm:text-xs"
          >
            {stage.chip}
          </span>
        </p>
      </article>
    </div>
  );
}
