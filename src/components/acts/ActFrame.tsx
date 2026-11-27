"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { ActId } from "@/data/i18n/types";

export function ActFrame({
  id,
  heading = "h2",
  concealed = false,
  children,
}: {
  id: ActId;
  heading?: "h1" | "h2";
  concealed?: boolean;
  children?: ReactNode;
}) {
  const { dictionary, dir, mirrorX } = useLanguage();
  const act = dictionary.acts[id];
  const Title = heading;
  const kickerClass =
    dir === "ltr"
      ? "font-mono text-xs uppercase tracking-[0.28em] text-amber"
      : "font-mono text-xs text-amber";

  return (
    <motion.section
      key={dir}
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-5 py-28 sm:px-8${concealed ? " invisible" : ""}`}
      aria-hidden={concealed || undefined}
      initial={{ opacity: 0, x: mirrorX(28) }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <p className={kickerClass}>{act.kicker}</p>
      <Title id={`${id}-title`} className="mt-3 max-w-4xl font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
        {act.title}
      </Title>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{act.body}</p>
      {children ? <div className="mt-10">{children}</div> : null}
    </motion.section>
  );
}
