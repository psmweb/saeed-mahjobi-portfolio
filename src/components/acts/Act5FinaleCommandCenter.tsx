"use client";

import { useEffect, useState } from "react";
import {
  finaleApprovePulse,
  finaleLineOpacity,
  finaleLocaleLock,
  finaleWipe,
  readClock,
} from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import { en } from "@/data/i18n/en";
import { fa } from "@/data/i18n/fa";
import { resumes } from "@/data/resumes";
import { scrollProgress, subscribeScroll } from "@/lib/scrollProgress";

const GITHUB = "https://github.com/psmweb";

type FinaleState = {
  wipeProgress: number;
  wipeOpacity: number;
  lines: readonly [number, number, number, number, number];
  locked: boolean;
  pulse: boolean;
  show: boolean;
};

const HIDDEN: FinaleState = {
  wipeProgress: 0,
  wipeOpacity: 0,
  lines: [0, 0, 0, 0, 0],
  locked: false,
  pulse: false,
  show: false,
};

function readFinale(): FinaleState {
  const internal = readClock(scrollProgress.current).internal;
  const reduced = scrollProgress.reducedMotion;
  if (internal < 23.4) return HIDDEN;
  if (reduced) {
    if (internal < 23.45) return HIDDEN;
    return {
      wipeProgress: 1,
      wipeOpacity: 0,
      lines: [1, 1, 1, 1, 1],
      locked: true,
      pulse: finaleApprovePulse(internal),
      show: true,
    };
  }
  const wipe = finaleWipe(internal);
  const lines = [0, 1, 2, 3, 4].map((index) => finaleLineOpacity(internal, index)) as [
    number,
    number,
    number,
    number,
    number,
  ];
  const show = wipe.opacity > 0.02 || lines.some((opacity) => opacity > 0.02);
  return {
    wipeProgress: wipe.progress,
    wipeOpacity: wipe.opacity,
    lines,
    locked: finaleLocaleLock(internal),
    pulse: finaleApprovePulse(internal),
    show,
  };
}

function same(a: FinaleState, b: FinaleState) {
  if (a.show !== b.show || a.locked !== b.locked || a.pulse !== b.pulse) return false;
  if (Math.abs(a.wipeOpacity - b.wipeOpacity) > 0.03) return false;
  if (Math.abs(a.wipeProgress - b.wipeProgress) > 0.03) return false;
  return a.lines.every((opacity, index) => Math.abs(opacity - b.lines[index]) < 0.03);
}

function lineStyle(opacity: number) {
  return {
    opacity,
    transform: `translateX(${(1 - opacity) * -28}px)`,
  };
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070C]";

export function Act5FinaleCommandCenter() {
  const { dictionary, locale } = useLanguage();
  const [state, setState] = useState<FinaleState>(HIDDEN);
  const [approved, setApproved] = useState(false);
  const copy = locale === "fa" ? fa.finaleStage : en.finaleStage;
  const persian = fa.finaleStage;
  const mirror = state.locked || locale === "fa";

  useEffect(
    () =>
      subscribeScroll(() => {
        const next = readFinale();
        setState((current) => (same(current, next) ? current : next));
      }),
    [],
  );

  const [kicker, name, closing, actions, languages] = state.lines;
  const wipeState = state.wipeOpacity > 0.02 ? "running" : state.wipeProgress >= 0.999 ? "done" : "idle";
  const beamLeft = `${(-0.328125 + 1.328125 * state.wipeProgress) * 100}%`;

  return (
    <>
      <section id="finale" aria-label={dictionary.acts.finale.title} className="min-h-[100svh]">
        <h2 className="sr-only">{dictionary.acts.finale.title}</h2>
        <p className="sr-only">{dictionary.acts.finale.body}</p>
      </section>
      <div
        aria-hidden
        data-wipe={wipeState}
        className="pointer-events-none fixed inset-y-0 z-[26] w-[32.8125vw] mix-blend-screen"
        style={{
          opacity: state.wipeOpacity,
          left: beamLeft,
          background:
            "linear-gradient(90deg, rgba(255,210,122,0), rgba(255,210,122,0.55) 45%, #FFF3D6 50%, rgba(255,210,122,0.55) 55%, rgba(255,210,122,0))",
        }}
      />
      {state.show ? (
        <div
          className="pointer-events-none fixed z-30 w-[min(41.25rem,calc(100%-9.25rem))] text-start"
          style={{ top: "clamp(4.6rem, 11vh, 7.25rem)", right: "4.75rem" }}
          dir={mirror ? "rtl" : "ltr"}
          lang={mirror ? "fa" : "en"}
          data-act="5"
          data-finale-dir={mirror ? "rtl" : "ltr"}
          data-wipe={wipeState}
        >
          <p
            data-finale="kicker"
            className="font-fa text-[13px] font-semibold tracking-[0.02em] text-[#F2B544] sm:text-sm"
            style={lineStyle(kicker)}
          >
            {mirror ? persian.kicker : copy.kicker}
          </p>
          <h2
            data-finale="headline"
            data-finale-lockup={locale === "fa" ? "fa" : "en"}
            lang={locale === "fa" ? "fa" : "en"}
            dir={locale === "fa" ? "rtl" : "ltr"}
            className={
              locale === "fa"
                ? "mt-1.5 bg-[linear-gradient(180deg,#fff_35%,#C9CCD6)] bg-clip-text font-fa text-[2.15rem] font-black leading-[1.25] text-transparent sm:text-[4rem]"
                : "font-hero-display mt-1.5 w-full text-right text-[2.15rem] leading-none text-white sm:text-[4rem]"
            }
            style={lineStyle(name)}
          >
            {locale === "fa" ? persian.name : copy.name}
          </h2>
          {locale === "en" ? (
            <p
              data-finale="headline-fa"
              lang="fa"
              className="mt-0.5 bg-[linear-gradient(180deg,#fff_35%,#C9CCD6)] bg-clip-text font-fa text-[1.4rem] font-black leading-[1.2] text-transparent sm:text-[2.65rem]"
              style={lineStyle(name)}
            >
              {persian.name}
            </p>
          ) : null}
          <p
            data-finale="closing"
            className="mt-1 max-w-[36rem] font-fa text-[15px] font-semibold leading-snug text-[#EDEDE6] sm:text-[1.65rem] sm:leading-[1.6]"
            style={lineStyle(closing)}
          >
            {mirror ? persian.closingLead : copy.closingLead}{" "}
            <span className="text-[#F2B544]">{mirror ? persian.closingAccent : copy.closingAccent}</span>
          </p>
          {locale === "en" && mirror ? (
            <p
              data-finale="closing-en"
              lang="en"
              dir="ltr"
              className="mt-0.5 w-full text-right text-[13px] leading-snug text-[#EDEDE6] sm:text-lg"
              style={lineStyle(closing)}
            >
              {en.finaleStage.closingLead} <span className="text-[#F2B544]">{en.finaleStage.closingAccent}</span>
            </p>
          ) : null}
          <div
            dir="ltr"
            className="pointer-events-auto mt-4 flex w-full flex-wrap justify-end gap-2 sm:mt-5 sm:gap-2.5"
            style={lineStyle(actions)}
            inert={actions < 0.45}
          >
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer noopener"
              data-finale-link="github"
              className={`inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.06] px-3 font-mono text-xs text-[#EDEDE6] transition-colors hover:border-white/40 hover:bg-white/[0.12] hover:text-white active:border-[#F2B544] active:bg-[#F2B544]/20 active:text-white sm:h-11 sm:px-4 sm:text-[13px] ${focusRing}`}
            >
              {copy.github}
            </a>
            <a
              href={resumes.en}
              download
              data-finale-link="resume-en"
              className={`inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.08] px-3 font-display text-[13px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/[0.14] active:border-[#F2B544] active:bg-[#F2B544]/25 sm:h-11 sm:px-4 ${focusRing}`}
            >
              {copy.resumeEn}
            </a>
            <a
              href={resumes.fa}
              download
              data-finale-link="resume-fa"
              className={`inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.08] px-3 font-display text-[13px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/[0.14] active:border-[#F2B544] active:bg-[#F2B544]/25 sm:h-11 sm:px-4 ${focusRing}`}
            >
              {copy.resumeFa}
            </a>
            <button
              type="button"
              data-finale-approve={approved ? "on" : "ready"}
              aria-pressed={approved}
              onClick={() => setApproved((current) => !current)}
              className={`inline-flex h-10 items-center rounded-full bg-gradient-to-br from-[#FFD27A] to-[#F2B544] px-3 font-display text-[13px] font-semibold text-[#120d02] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] active:brightness-95 sm:h-11 sm:px-4 ${
                state.pulse ? "finale-approve-pulse" : ""
              } ${approved ? "ring-2 ring-[#fff3d6] ring-offset-2 ring-offset-[#05070C]" : ""} ${focusRing}`}
            >
              {copy.approve}
            </button>
          </div>
          <p
            dir="ltr"
            data-finale="languages"
            className="mt-3 w-full text-pretty text-right font-mono text-xs tracking-[0.04em] text-[#A9B0BE] [text-shadow:0_1px_8px_#05070C] sm:mt-4 sm:text-[13px] sm:tracking-[0.06em]"
            style={lineStyle(languages)}
          >
            {dictionary.profile.english} · {dictionary.profile.persian}
          </p>
        </div>
      ) : null}
    </>
  );
}
