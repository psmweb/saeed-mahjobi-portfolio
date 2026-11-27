"use client";

import { timeline } from "@/data/timeline";
import { formatMetric, ventures } from "@/data/ventures";
import { useLanguage } from "@/context/LanguageContext";
import { ActFrame } from "./ActFrame";

export function Act2Evolution() {
  const { dictionary } = useLanguage();
  const copy = {
    labels: dictionary.metricLabels,
    liveTrading: dictionary.metricValues.liveTrading,
    form: dictionary.metricValues.form,
  };

  return (
    <ActFrame id="evolution">
      <ol className="relative space-y-5 border-s border-amber/30 ps-6">
        {timeline.map((entry) => {
          const venture = ventures.find((item) => item.id === entry.id);
          if (!venture) return null;
          const facts = venture.metrics.map((metric) => formatMetric(metric, copy));
          return (
            <li key={entry.id} className="relative">
              <span className="absolute -start-[1.7rem] top-1.5 size-2.5 rounded-full bg-amber" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {entry.year ? (
                  <span className="font-mono text-xs text-amber">{entry.year}</span>
                ) : (
                  <span className="font-mono text-xs text-muted">{dictionary.lanes[venture.lane]}</span>
                )}
                <span className="text-base text-ink">{dictionary.ventureNames[entry.id]}</span>
              </div>
              {facts.length > 0 ? (
                <p className="mt-1 text-sm text-muted">{facts.join(" · ")}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </ActFrame>
  );
}
