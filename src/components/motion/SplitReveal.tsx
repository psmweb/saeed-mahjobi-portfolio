"use client";

import { motion } from "motion/react";
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersReducedMotion } from "./usePointerMedia";

const ARABIC_LETTER = /[\u0600-\u06FF]/;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const REVEAL_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
const REDUCED_FADE = 0.18;
const MASK_IMAGE = "linear-gradient(to bottom, #000 70%, transparent)";

const REDUCED_TRANSITION = { duration: REDUCED_FADE, ease: REVEAL_EASE };

const WORD_TIMING = { duration: 0.7, stagger: 0.06 };
const CHAR_TIMING = { duration: 0.5, stagger: 0.015 };

type Unit = { id: string; value: string; order: number };
type Word = { id: string; text: string; units: Unit[]; gapBefore: string };
type Model = {
  words: Word[];
  mode: "word" | "char";
  lastOrder: number;
  duration: number;
  stagger: number;
};

function characters(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)].map((part) => part.segment);
  }
  return Array.from(value);
}

function buildModel(text: string, mode: "word" | "char"): Model {
  const timing = mode === "word" ? WORD_TIMING : CHAR_TIMING;
  const parts = text.split(/(\s+)/).filter((part) => part.length > 0);
  const words: Word[] = [];
  let order = 0;
  let gapBefore = "";
  parts.forEach((part, index) => {
    if (/^\s+$/.test(part)) {
      gapBefore += part;
      return;
    }
    const values = mode === "word" ? [part] : characters(part);
    const units = values.map((value) => {
      const unit: Unit = { id: `u${order}`, value, order };
      order += 1;
      return unit;
    });
    words.push({ id: `w${index}`, text: part, units, gapBefore });
    gapBefore = "";
  });
  return {
    words,
    mode,
    lastOrder: Math.max(0, order - 1),
    duration: timing.duration,
    stagger: timing.stagger,
  };
}

function lineStyle(): CSSProperties {
  return {
    display: "inline",
    whiteSpace: "nowrap",
    paddingBlock: "0.12em",
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
    maskImage: MASK_IMAGE,
    WebkitMaskImage: MASK_IMAGE,
    maskSize: "100% 240%",
    WebkitMaskSize: "100% 240%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "0% 100%",
    WebkitMaskPosition: "0% 100%",
  };
}

function LineMask({ delay, duration, children }: { delay: number; duration: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const animation = node.animate(
      [
        { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%" },
        { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%" },
      ],
      {
        duration: Math.max(16, duration * 1000),
        delay: Math.max(0, delay) * 1000,
        easing: REVEAL_EASE_CSS,
        fill: "forwards",
      },
    );
    const clear = () => {
      node.style.maskImage = "none";
      node.style.webkitMaskImage = "none";
    };
    animation.addEventListener("finish", clear);
    return () => {
      animation.removeEventListener("finish", clear);
      animation.cancel();
    };
  }, [delay, duration]);

  return (
    <span ref={ref} aria-hidden="true" style={lineStyle()}>
      {children}
    </span>
  );
}

function RevealUnit({
  unit,
  delay,
  duration,
  className,
  tighten,
  onComplete,
}: {
  unit: Unit;
  delay: number;
  duration: number;
  className?: string;
  tighten: boolean;
  onComplete: (order: number, node: HTMLElement) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    if (done) return;
    const node = ref.current;
    if (!node) return;
    const animation = node.animate(
      [
        { opacity: 0, filter: "blur(8px)", transform: "translateY(0.5em)" },
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
      ],
      {
        duration: duration * 1000,
        delay: delay * 1000,
        easing: REVEAL_EASE_CSS,
        fill: "forwards",
      },
    );
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      node.style.opacity = "1";
      node.style.transform = "none";
      node.style.filter = "none";
      node.style.willChange = "auto";
      animation.cancel();
      setDone(true);
      onCompleteRef.current(unit.order, node);
    };
    animation.addEventListener("finish", finish);
    return () => {
      animation.removeEventListener("finish", finish);
      animation.cancel();
    };
  }, [delay, done, duration, unit.order]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        opacity: done ? 1 : 0,
        transform: done ? "none" : "translateY(0.5em)",
        filter: done ? "none" : "blur(8px)",
        willChange: done ? "auto" : "opacity, transform, filter",
        letterSpacing: tighten ? "0px" : undefined,
      }}
    >
      {unit.value}
    </span>
  );
}

function groupLines(root: HTMLElement): number[][] {
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-reveal-word]")];
  const lines: number[][] = [];
  let lastTop = Number.NEGATIVE_INFINITY;
  nodes.forEach((node, index) => {
    const top = node.offsetTop;
    if (lines.length === 0 || top - lastTop > 3) {
      lines.push([index]);
      lastTop = top;
    } else {
      lines[lines.length - 1].push(index);
    }
  });
  return lines.length > 0 ? lines : [[]];
}

function SoftSplit({
  text,
  model,
  delay,
  unitClassName,
  onDone,
}: {
  text: string;
  model: Model;
  delay: number;
  unitClassName?: string;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const finished = useRef(false);
  const [lines, setLines] = useState<number[][] | null>(null);

  useLayoutEffect(() => {
    if (lines) return;
    let cancel = false;
    const measure = () => {
      if (cancel || !rootRef.current) return;
      setLines(groupLines(rootRef.current));
    };
    if (typeof document !== "undefined" && document.fonts && document.fonts.status !== "loaded") {
      void document.fonts.ready.then(measure);
    } else {
      measure();
    }
    return () => {
      cancel = true;
    };
  }, [lines]);

  const finishUnit = (order: number) => {
    if (finished.current || order !== model.lastOrder) return;
    finished.current = true;
    onDoneRef.current();
  };

  const wordNodes = (indices: number[]) =>
    indices.map((wordIndex, position) => {
      const word = model.words[wordIndex];
      if (!word) return null;
      const gap = position === 0 ? "" : word.gapBefore.replace(/[\r\n]+/g, " ");
      return (
        <Fragment key={word.id}>
          {gap}
          <span aria-hidden="true" data-reveal-word="" style={{ display: "inline", whiteSpace: "nowrap" }}>
            {word.units.map((unit) => (
              <RevealUnit
                key={unit.id}
                unit={unit}
                delay={delay + unit.order * model.stagger}
                duration={model.duration}
                className={unitClassName}
                tighten={model.mode === "char"}
                onComplete={finishUnit}
              />
            ))}
          </span>
        </Fragment>
      );
    });

  if (!lines) {
    return (
      <span ref={rootRef} aria-label={text} style={{ display: "inline", opacity: 0 }}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {model.words.map((word) => (
            <Fragment key={word.id}>
              {word.gapBefore}
              <span data-reveal-word="" style={{ display: "inline", whiteSpace: "nowrap" }}>
                {word.text}
              </span>
            </Fragment>
          ))}
        </span>
      </span>
    );
  }

  return (
    <span ref={rootRef} aria-label={text} style={{ display: "inline" }}>
      <span className="sr-only">{text}</span>
      {lines.map((indices, lineIndex) => {
        const orders = indices.flatMap((wordIndex) => model.words[wordIndex]?.units.map((unit) => unit.order) ?? []);
        const first = orders.length > 0 ? Math.min(...orders) : 0;
        const last = orders.length > 0 ? Math.max(...orders) : 0;
        return (
          <Fragment key={indices.join("-") || `line-${lineIndex}`}>
            {lineIndex > 0 ? <br aria-hidden="true" /> : null}
            <LineMask delay={delay + first * model.stagger} duration={(last - first) * model.stagger + model.duration}>
              {wordNodes(indices)}
            </LineMask>
          </Fragment>
        );
      })}
    </span>
  );
}

function ReducedFade({ text, onDone }: { text: string; onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={REDUCED_TRANSITION}
      onAnimationComplete={() => onDoneRef.current()}
      style={{ display: "inline" }}
    >
      {text}
    </motion.span>
  );
}

type Props = {
  text: string;
  active: boolean;
  /** Already inside the act (a seek or a finished fade). Skip the entrance. */
  settled?: boolean;
  /** Extra delay so a subtitle can follow its heading. */
  delay?: number;
  /** Painted on each unit while the reveal runs. Rest renders the raw string. */
  unitClassName?: string;
};

/**
 * Soft split reveal for an act heading.
 * Persian, RTL, and `fa` stay one span per word so joined letters are not cut.
 * Latin splits per character inside nowrap words. The resting render is the
 * original string, so tracking, kerning, and line breaks match the page.
 */
export function SplitReveal({ text, active, settled = false, delay = 0, unitClassName }: Props) {
  const reduced = usePrefersReducedMotion();
  const { locale, dir } = useLanguage();
  const mode = locale === "fa" || dir === "rtl" || ARABIC_LETTER.test(text) ? "word" : "char";
  const model = useMemo(() => buildModel(text, mode), [text, mode]);
  const decided = useRef(false);
  const finished = useRef(false);
  const startedReduced = useRef(false);
  const [, setEpoch] = useState(0);

  if (!active) {
    decided.current = false;
    finished.current = false;
    startedReduced.current = false;
  } else if (!decided.current) {
    decided.current = true;
    startedReduced.current = reduced;
    if (settled || model.words.length === 0) finished.current = true;
  } else if (!finished.current && reduced && !startedReduced.current) {
    finished.current = true;
  } else if (!finished.current && !reduced && startedReduced.current) {
    startedReduced.current = false;
  }

  const finish = () => {
    finished.current = true;
    setEpoch((value) => value + 1);
  };

  if (!active || finished.current) return text;
  if (startedReduced.current) return <ReducedFade text={text} onDone={finish} />;

  return <SoftSplit text={text} model={model} delay={delay} unitClassName={unitClassName} onDone={finish} />;
}
