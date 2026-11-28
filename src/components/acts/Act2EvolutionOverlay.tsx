"use client";

import { mapPresentationTime } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import { usePresentationSeconds, windowOpacity } from "./usePresentation";

const arabic = /[\u0600-\u06FF]/;

export function Act2EvolutionOverlay() {
  const { dictionary, locale } = useLanguage();
  const seconds = usePresentationSeconds();
  const opacity = windowOpacity(seconds, 7, 7.45, 13.3, 14);
  const hidden = opacity < 0.04;
  const internal = mapPresentationTime(seconds);
  const index = internal < 6.6 ? 0 : internal < 8.1 ? 1 : 2;
  const beat = dictionary.evolutionStage.beats[index] ?? dictionary.evolutionStage.beats[0];
  const persian = locale === "fa";
  const titleFace = persian && arabic.test(beat.title) ? "font-fa" : "font-mono";
  const detailFace = persian && arabic.test(beat.detail) ? "font-fa" : "font-mono";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-12 z-20 px-4 sm:px-12"
      style={{ opacity }}
      data-act="2"
      data-opacity={opacity.toFixed(2)}
      data-beat={beat.year}
      aria-hidden={hidden}
    >
      <div className="max-w-xl rounded-2xl border border-white/15 bg-[rgba(12,15,24,0.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5">
        <p className={`text-xs text-[#F2B544] sm:text-[13px] ${persian ? "font-fa" : "font-mono tracking-[0.14em] sm:tracking-[0.18em]"}`}>
          {dictionary.evolutionStage.kicker}
        </p>
        <p className="mt-2 text-white">
          <span className={`text-[1.35rem] sm:text-[1.7rem] ${beat.accent ? "text-[#F2B544]" : ""} ${persian ? "font-fa font-black" : "font-display font-semibold"}`}>
            {beat.year}
          </span>
          <span className={`ms-2 text-sm sm:text-base ${titleFace} ${persian && titleFace === "font-fa" ? "font-semibold" : "tracking-[0.02em]"}`}>
            · {beat.title}
          </span>
        </p>
        <p className={`mt-2 text-xs text-[#8C93A3] sm:text-[13px] ${detailFace} ${detailFace === "font-mono" ? "tracking-[0.04em]" : ""}`}>
          {beat.detail}
        </p>
      </div>
    </div>
  );
}
