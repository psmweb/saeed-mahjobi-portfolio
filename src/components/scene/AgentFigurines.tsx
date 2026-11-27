"use client";

import { AGENT_TINT_HEX, agents } from "@/data/agents";
import { useLanguage } from "@/context/LanguageContext";
import { mirrorVector } from "@/lib/direction";
import { HumanoidSkeleton } from "./HumanoidSkeleton";

const SPAN = 0.95;

/** Five typed humanoid slots. Positions mirror when the page is RTL. */
export function AgentFigurines() {
  const { dir } = useLanguage();

  return (
    <group name="agent-figurines" position={[0, 0, -0.4]}>
      {agents.map((agent, index) => {
        const position = mirrorVector(
          [(index - (agents.length - 1) / 2) * SPAN, 0, index % 2 === 0 ? 0 : -0.28],
          dir,
        );
        return (
          <group key={agent.id} name={agent.id} position={position}>
            <HumanoidSkeleton color={AGENT_TINT_HEX[agent.tint]} scale={0.78} />
          </group>
        );
      })}
    </group>
  );
}
