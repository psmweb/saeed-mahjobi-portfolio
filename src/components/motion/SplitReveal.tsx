"use client";

import { motion } from "motion/react";
import { Fragment, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { mirrorX } from "@/lib/direction";
import { duration, easeBezier } from "@/lib/motion";
import { usePrefersReducedMotion } from "./usePointerMedia";

const ARABIC_LETTER = /[\u0600-\u06FF]/;
const STAGGER = 0.03;

type Piece = { value: string; gap: boolean; order: number };

function splitUnits(text: string): Piece[] {
  const source =
    ARABIC_LETTER.test(text)
      ? text.split(/(\s+)/).filter((part) => part.length > 0)
      : typeof Intl !== "undefined" && "Segmenter" in Intl
        ? [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)].map((part) => part.segment)
        : Array.from(text);
  let order = 0;
  return source.map((value) => {
    const gap = /^\s+$/.test(value);
    const piece = { value, gap, order: gap ? 0 : order };
    if (!gap) order += 1;
    return piece;
  });
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
 * Split reveal for an act heading. Persian stays per word so joined letters
 * and ligatures are not cut. Latin may split per grapheme. The resting render
 * is the original string, so tracking and line breaks match the page.
 * Horizontal travel uses `mirrorX` and comes from the inline-start side.
 */
export function SplitReveal({ text, active, settled = false, delay = 0, unitClassName }: Props) {
  const reduced = usePrefersReducedMotion();
  const { dir } = useLanguage();
  const decided = useRef(false);
  const finished = useRef(false);
  const [, setEpoch] = useState(0);

  if (!active) {
    decided.current = false;
    finished.current = false;
  } else if (!decided.current) {
    decided.current = true;
    if (settled || reduced) finished.current = true;
  }

  const play = active && !finished.current && !reduced;
  if (!play) return text;

  const pieces = splitUnits(text);
  let lastOrder = 0;
  for (const piece of pieces) {
    if (!piece.gap && piece.order > lastOrder) lastOrder = piece.order;
  }
  const fromX = mirrorX(-6, dir);
  const finish = () => {
    finished.current = true;
    setEpoch((value) => value + 1);
  };

  const units: ReactNode[] = pieces.map((piece, index) => {
    if (piece.gap) return <Fragment key={`gap-${index}`}>{piece.value}</Fragment>;
    return (
      <motion.span
        key={`${index}-${piece.value}`}
        className={`inline-block ${unitClassName ?? ""}`}
        initial={{ opacity: 0, x: fromX, y: "0.35em" }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration: duration.reveal,
          delay: delay + piece.order * STAGGER,
          ease: easeBezier.easeOutExpo,
        }}
        onAnimationComplete={piece.order === lastOrder ? finish : undefined}
      >
        {piece.value}
      </motion.span>
    );
  });

  return units;
}
