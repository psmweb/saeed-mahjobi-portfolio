"use client";

import { formatMetric, ventures, type Venture, type VentureLane } from "@/data/ventures";
import { useLanguage } from "@/context/LanguageContext";
import { ActFrame } from "./ActFrame";

const laneOrder: readonly VentureLane[] = ["active", "catalog", "archive"];

export function Act3VentureStage() {
  const { dictionary } = useLanguage();
  const copy = {
    labels: dictionary.metricLabels,
    liveTrading: dictionary.metricValues.liveTrading,
    form: dictionary.metricValues.form,
  };

  return (
    <ActFrame id="ventures">
      <div className="space-y-10">
        {laneOrder.map((lane) => {
          const group = ventures.filter((venture) => venture.lane === lane);
          return (
            <section key={lane} aria-label={dictionary.lanes[lane]}>
              <h3 className="font-mono text-xs text-emerald">{dictionary.lanes[lane]}</h3>
              {group.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{dictionary.emptyVentures}</p>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((venture) => (
                    <VentureCard key={venture.id} venture={venture} copy={copy} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </ActFrame>
  );
}

function VentureCard({
  venture,
  copy,
}: {
  venture: Venture;
  copy: Parameters<typeof formatMetric>[1];
}) {
  const { dictionary } = useLanguage();
  const facts = venture.metrics.map((metric) => formatMetric(metric, copy));

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
      <p className="font-display text-xl text-ink">{dictionary.ventureNames[venture.id]}</p>
      {facts.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {facts.map((fact) => (
            <li key={fact} className="rounded-full border border-amber/30 px-2.5 py-1 font-mono text-[11px] text-amber-soft">
              {fact}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
