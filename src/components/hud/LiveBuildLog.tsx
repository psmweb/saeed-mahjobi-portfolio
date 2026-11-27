"use client";

import { Terminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Dictionary } from "@/data/i18n/types";
import { formatMetric, ventures } from "@/data/ventures";

function buildLines(dictionary: Dictionary): string[] {
  const copy = {
    labels: dictionary.metricLabels,
    liveTrading: dictionary.metricValues.liveTrading,
    form: dictionary.metricValues.form,
  };
  return [
    dictionary.brand.command,
    dictionary.brand.name,
    dictionary.profile.english,
    dictionary.profile.persian,
    `${dictionary.lanes.active} · 6`,
    ...ventures.map((venture) => {
      const name = dictionary.ventureNames[venture.id];
      const facts = venture.metrics.map((metric) => formatMetric(metric, copy));
      return facts.length > 0 ? `${name} · ${facts.join(" · ")}` : `${dictionary.lanes[venture.lane]} · ${name}`;
    }),
  ];
}

export function LiveBuildLog() {
  const { dictionary } = useLanguage();
  const lines = useMemo(() => buildLines(dictionary), [dictionary]);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setVisible(lines.length);
      return;
    }
    setVisible(1);
    const id = window.setInterval(() => {
      setVisible((count) => (count >= lines.length ? count : count + 1));
    }, 700);
    return () => window.clearInterval(id);
  }, [lines]);

  const shown = lines.slice(0, visible);
  const latest = shown.at(-1) ?? dictionary.hud.logIdle;

  return (
    <aside
      aria-live="polite"
      className="fixed z-30 overflow-hidden border border-white/10 bg-obsidian/80 font-mono text-[11px] leading-relaxed text-emerald shadow-2xl backdrop-blur-md max-md:inset-x-0 max-md:bottom-0 max-md:border-x-0 max-md:border-b-0 md:inset-e-4 md:bottom-4 md:w-[22rem] md:rounded-xl rtl:md:bottom-16"
    >
      <header className="flex items-center gap-2 px-3 py-2 text-amber md:border-b md:border-white/10">
        <Terminal className="size-3.5 shrink-0" aria-hidden />
        <span className="shrink-0">{dictionary.hud.logTitle}</span>
        <span className="min-w-0 truncate text-emerald md:hidden">
          <span className="text-amber">› </span>
          {latest}
        </span>
      </header>
      <ol className="hidden max-h-36 space-y-1 overflow-auto px-3 py-2 md:block">
        {shown.length === 0 ? <li className="text-muted">{dictionary.hud.logIdle}</li> : null}
        {shown.map((line, index) => (
          <li key={`${index}-${line}`} className="break-words">
            <span className="text-amber">› </span>
            {line}
          </li>
        ))}
      </ol>
    </aside>
  );
}
