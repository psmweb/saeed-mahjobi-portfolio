"use client";

import { AGENT_TINT_HEX, agents } from "@/data/agents";
import { useLanguage } from "@/context/LanguageContext";
import { ActFrame } from "./ActFrame";

export function Act4AgentArena() {
  const { dictionary } = useLanguage();

  return (
    <ActFrame id="arena">
      <div className="flex flex-wrap items-center gap-3">
        <p className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan">
          {dictionary.demoBadge}
        </p>
        <p className="text-sm text-muted">{dictionary.arena.skeletonNote}</p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {agents.map((agent, index) => (
          <li key={agent.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span
              className="block size-2.5 rounded-full"
              style={{ backgroundColor: AGENT_TINT_HEX[agent.tint] }}
            />
            <p className="mt-4 font-mono text-sm text-ink">
              {dictionary.arena.slotLabel} {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-muted">{agent.id}</p>
          </li>
        ))}
      </ul>
    </ActFrame>
  );
}
