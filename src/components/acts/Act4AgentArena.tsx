"use client";

import { useEffect, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { readClock } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";
import {
  arenaHud,
  isArenaPlaying,
  sampleArenaTime,
  startArenaReplay,
  subscribeArena,
  type ArenaHud,
  type ArenaMode,
} from "@/lib/arenaReplay";
import { scrollProgress, subscribeScroll } from "@/lib/scrollProgress";

type OverlayState = ArenaHud & { mode: ArenaMode };

const HIDDEN: OverlayState = {
  mode: "scroll",
  opacity: 0,
  toast: 0,
  online: 0,
  done: 0,
  phase: "online",
  shipped: false,
};

function readOverlay(now: number): OverlayState {
  const internal = readClock(scrollProgress.current).internal;
  const sample = sampleArenaTime(internal, now, scrollProgress.reducedMotion);
  const hud = arenaHud(sample.t);
  if (sample.mode === "scroll") return { mode: sample.mode, ...hud };
  return {
    mode: sample.mode,
    opacity: 1,
    toast: sample.mode === "hold" ? 1 : hud.toast,
    online: 5,
    done: sample.mode === "hold" ? 5 : hud.done,
    phase: sample.mode === "hold" ? "shipped" : hud.phase,
    shipped: sample.mode === "hold" ? true : hud.shipped,
  };
}

function same(a: OverlayState, b: OverlayState) {
  return (
    a.mode === b.mode &&
    a.phase === b.phase &&
    a.shipped === b.shipped &&
    a.online === b.online &&
    a.done === b.done &&
    Math.abs(a.opacity - b.opacity) < 0.03 &&
    Math.abs(a.toast - b.toast) < 0.03
  );
}

export function Act4AgentArena() {
  const { dictionary, locale } = useLanguage();
  const copy = dictionary.arena;
  const script = locale === "fa" ? "font-fa" : "font-mono";
  const [state, setState] = useState<OverlayState>(HIDDEN);

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    let seen = false;
    const paint = () => {
      const next = readOverlay(performance.now());
      setState((current) => (same(current, next) ? current : next));
      if (isArenaPlaying()) frame = requestAnimationFrame(paint);
    };
    const stopScroll = subscribeScroll((progress) => {
      const internal = readClock(progress).internal;
      if (internal >= 22.85) seen = true;
      window.clearTimeout(timer);
      if (!seen && !scrollProgress.reducedMotion && !isArenaPlaying() && internal >= 20.62 && internal < 22.55) {
        timer = window.setTimeout(() => {
          const now = readClock(scrollProgress.current).internal;
          if (!seen && now >= 20.62 && now < 22.55 && !isArenaPlaying()) {
            seen = true;
            startArenaReplay();
          }
        }, 480);
      }
      paint();
    });
    const stopArena = subscribeArena(() => {
      cancelAnimationFrame(frame);
      paint();
    });
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      stopScroll();
      stopArena();
    };
  }, []);

  const playing = state.mode === "play";
  const active = state.opacity > 0.08;
  const settled = state.opacity > 0.92;
  const status =
    state.phase === "online"
      ? `${copy.statusOnline} ${state.online}/5`
      : state.phase === "building"
        ? copy.statusBuilding
        : state.phase === "converging"
          ? copy.statusConverging
          : copy.statusShipped;
  const counter = `${state.done}/5 ✓${state.shipped ? ` · ${copy.shippedMark}` : ""}`;

  return (
    <>
      <section id="arena" aria-label={dictionary.acts.arena.title} className="min-h-[100svh]">
        <h2 className="sr-only">{dictionary.acts.arena.title}</h2>
        <p className="sr-only">{dictionary.acts.arena.body}</p>
      </section>
      {state.opacity > 0.02 ? (
        <>
          <div
            className="pointer-events-none fixed inset-x-3 top-[4.85rem] z-30 flex flex-col gap-2 sm:inset-x-8 sm:top-[5.35rem] sm:flex-row sm:items-start sm:justify-between"
            style={{ opacity: state.opacity }}
            data-act="4"
            data-phase={state.phase}
            data-mode={state.mode}
          >
            <TiltCard className="pointer-events-auto max-w-full rounded-3xl border border-white/10 bg-[rgba(14,17,26,0.78)] px-3.5 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:max-w-[62%] sm:rounded-full sm:px-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-snug text-white">
                <span className={`${script} text-[12px] text-[#8C93A3] ${locale === "fa" ? "" : "tracking-[0.14em]"}`}>
                  <SplitReveal text={copy.kicker} active={active} settled={settled} />
                </span>
                <span className={`${locale === "fa" ? "font-fa" : "font-display"} text-[15px] font-semibold sm:text-[17px]`}>
                  <SplitReveal text={copy.headline} active={active} settled={settled} delay={0.04} />
                </span>
                <span className={`${script} text-[12px] text-[#3DDC97]`} aria-live="polite">
                  {status}
                </span>
              </p>
            </TiltCard>
            <TiltCard className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 self-end rounded-3xl border border-white/10 bg-[rgba(14,17,26,0.78)] px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:rounded-full sm:px-3.5">
              <span data-demo-badge={dictionary.demoBadge} className={`${script} text-xs text-[#8C93A3] ${locale === "fa" ? "" : "tracking-[0.04em]"}`}>
                {dictionary.demoBadge}
              </span>
              <span className="font-mono text-[12px] text-[#EDEDE6]" dir="ltr">{copy.shipTitle}</span>
              <span className={`${script} text-[12px] text-[#EDEDE6]`}>{counter}</span>
              <Magnetic>
                <button
                  type="button"
                  data-ship-replay="true"
                  aria-pressed={playing}
                  aria-label={`${copy.replay} ${copy.shipTitle}. ${dictionary.demoBadge}`}
                  onClick={() => startArenaReplay()}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] sm:min-h-0 sm:py-1.5 sm:text-[13px] ${script} ${
                    playing
                      ? "border-[#F2B544] bg-[#F2B544] text-[#120d02]"
                      : "border-white/20 bg-white/[0.06] text-[#EDEDE6] hover:border-[#F59E0B] hover:bg-[#F59E0B]/15 hover:text-white focus-visible:border-[#F59E0B] focus-visible:bg-[#F59E0B]/15 focus-visible:text-white active:border-[#F2B544] active:bg-[#F2B544] active:text-[#120d02]"
                  }`}
                >
                  {playing ? copy.replaying : copy.replay}
                </button>
              </Magnetic>
            </TiltCard>
          </div>
          <div
            className="pointer-events-none fixed inset-x-4 bottom-14 z-30 flex justify-center"
            style={{ opacity: state.opacity * state.toast }}
            data-ship-toast={state.toast > 0.05 ? "on" : "off"}
          >
            <p className={`max-w-full rounded-[10px] bg-gradient-to-br from-[#FFD27A] to-[#F2B544] px-3.5 py-2 text-center text-[12px] font-semibold leading-snug text-[#120d02] shadow-[0_0_18px_rgba(242,181,68,0.28)] sm:text-[13px] ${script}`}>
              {copy.toast} · {dictionary.demoBadge}
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}
