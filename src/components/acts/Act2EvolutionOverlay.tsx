"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { usePrefersReducedMotion } from "@/components/motion/usePointerMedia";
import { useSmoothedProgress, writeOverlayFrame } from "@/components/motion/useSmoothedProgress";
import { PRESENTATION_SECONDS, mapPresentationTime } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import {
  actHandoff,
  blendBoundaryOpacity,
  handoffBlur,
  transitionFilter,
} from "@/lib/actHandoff";
import { scrollProgress } from "@/lib/scrollProgress";
import { windowOpacity } from "./usePresentation";

const arabic = /[\u0600-\u06FF]/;

type BeatFrame = {
  index: number;
  active: boolean;
  settled: boolean;
  interactive: boolean;
  hidden: boolean;
};

const REST_BEAT: BeatFrame = {
  index: 0,
  active: false,
  settled: false,
  interactive: false,
  hidden: true,
};

function sameBeat(current: BeatFrame, next: BeatFrame) {
  return (
    current.index === next.index &&
    current.active === next.active &&
    current.settled === next.settled &&
    current.interactive === next.interactive &&
    current.hidden === next.hidden
  );
}

export function Act2EvolutionOverlay() {
  const { dictionary, locale } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const frameStyle = useRef<CSSProperties>({ opacity: 0 });
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [beatFrame, setBeatFrame] = useState<BeatFrame>(REST_BEAT);

  const paintRef = useRef<(progress: number) => void>(() => {});
  paintRef.current = (progress) => {
    const seconds = progress * PRESENTATION_SECONDS;
    const naturalAt = (time: number) => windowOpacity(time, 7, 7.45, 13.3, 14);
    const handoff = actHandoff(progress, reducedRef.current);
    const natural = naturalAt(seconds);
    const naturalExit =
      handoff.boundary < 0 ? natural : naturalAt(Math.min(PRESENTATION_SECONDS, handoff.at + handoff.half));
    const opacity = blendBoundaryOpacity(1, natural, naturalExit, handoff);
    const blur = handoffBlur(1, opacity, handoff);
    writeOverlayFrame(rootRef.current, frameStyle.current, { opacity, filter: transitionFilter(blur) });
    const internal = mapPresentationTime(seconds);
    const next: BeatFrame = {
      index: internal < 6.6 ? 0 : internal < 8.1 ? 1 : 2,
      active: opacity > 0.08,
      settled: opacity > 0.92,
      interactive: opacity > 0.4,
      hidden: opacity < 0.04,
    };
    setBeatFrame((current) => (sameBeat(current, next) ? current : next));
  };

  useSmoothedProgress((progress) => paintRef.current(progress));
  useEffect(() => {
    paintRef.current(scrollProgress.smoothed);
  }, [reduced, locale]);

  const beat = dictionary.evolutionStage.beats[beatFrame.index] ?? dictionary.evolutionStage.beats[0];
  const persian = locale === "fa";
  const titleFace = persian && arabic.test(beat.title) ? "font-fa" : "font-mono";
  const detailFace = persian && arabic.test(beat.detail) ? "font-fa" : "font-mono";

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 bottom-12 z-20 px-4 sm:px-12"
      style={{ ...frameStyle.current }}
      data-act="2"
      data-beat={beat.year}
      aria-hidden={beatFrame.hidden}
    >
      <TiltCard className={`${beatFrame.interactive ? "pointer-events-auto" : "pointer-events-none"} max-w-xl rounded-2xl border border-white/15 bg-[rgba(12,15,24,0.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5`}>
        <p className={`text-xs text-[#F2B544] sm:text-[13px] ${persian ? "font-fa" : "font-mono tracking-[0.14em] sm:tracking-[0.18em]"}`}>
          <SplitReveal text={dictionary.evolutionStage.kicker} active={beatFrame.active} settled={beatFrame.settled} />
        </p>
        <p className="mt-2 text-white">
          <span className={`text-[1.35rem] sm:text-[1.7rem] ${beat.accent ? "text-[#F2B544]" : ""} ${persian ? "font-fa font-black" : "font-display font-semibold"}`}>
            <SplitReveal text={beat.year} active={beatFrame.active} settled={beatFrame.settled} />
          </span>
          <span className={`ms-2 text-sm sm:text-base ${titleFace} ${persian && titleFace === "font-fa" ? "font-semibold" : "tracking-[0.02em]"}`}>
            <SplitReveal text={`· ${beat.title}`} active={beatFrame.active} settled={beatFrame.settled} delay={0.04} />
          </span>
        </p>
        <p className={`mt-2 text-xs text-[#8C93A3] sm:text-[13px] ${detailFace} ${detailFace === "font-mono" ? "tracking-[0.04em]" : ""}`}>
          <SplitReveal text={beat.detail} active={beatFrame.active} settled={beatFrame.settled} delay={0.08} />
        </p>
      </TiltCard>
    </div>
  );
}
