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

  return (
    <aside
      aria-live="polite"
      className="fixed z-40 w-[min(100%-2rem,22rem)] overflow-hidden rounded-xl border border-white/10 bg-obsidian/80 font-mono text-[11px] leading-relaxed text-emerald shadow-2xl backdrop-blur-md inset-e-4 bottom-4"
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-amber">
        <Terminal className="size-3.5" aria-hidden />
        {dictionary.hud.logTitle}
      </header>
      <ol className="max-h-36 space-y-1 overflow-auto px-3 py-2">
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
