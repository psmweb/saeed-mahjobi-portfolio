"use client";

import { agents } from "@/data/agents";
import { portraits } from "@/data/portraits";
import { activeVentures } from "@/data/ventures";
import { useLanguage } from "@/context/LanguageContext";
import { Portrait } from "../Portrait";
import { ActFrame } from "./ActFrame";

export function Act5FinaleCommandCenter() {
  const { dictionary } = useLanguage();

  const stats = [
    { label: dictionary.lanes.active, value: String(activeVentures.length) },
    { label: dictionary.lanes.archive, value: "2020" },
    { label: dictionary.arena.slotLabel, value: String(agents.length) },
  ];

  return (
    <ActFrame id="finale">
      <div className="grid items-center gap-8 md:grid-cols-[180px_minmax(0,1fr)]">
        <Portrait src={portraits.cutout} alt={dictionary.brand.name} className="w-full max-w-[180px]" />
        <div>
          <p className="font-mono text-sm text-cyan">
            <span className="text-amber">&gt;</span> {dictionary.heroPrompt}
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 px-3 py-3">
                <dt className="text-xs text-muted">{stat.label}</dt>
                <dd className="mt-2 font-display text-2xl text-amber">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-ink">{dictionary.brand.name}</p>
        </div>
      </div>
    </ActFrame>
  );
}
