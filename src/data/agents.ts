/**
 * Five humanoid agent slots for the obsidian stage.
 * These are scene rigs, not extra catalog products.
 * Any interactive task built on top of them must wear DEMO_BADGE.
 */

export const DEMO_BADGE = {
  en: "Live simulation · demo",
  fa: "شبیه‌سازی زنده · دمو",
} as const;

export type AgentId = "agent-01" | "agent-02" | "agent-03" | "agent-04" | "agent-05";

export type AgentTint = "amber" | "emerald" | "cyan";

export type AgentAct = "command" | "evolution" | "ventures" | "arena" | "finale";

export type AgentSlot = {
  id: AgentId;
  act: AgentAct;
  tint: AgentTint;
};

export const AGENT_TINT_HEX: Record<AgentTint, string> = {
  amber: "#F59E0B",
  emerald: "#10B981",
  cyan: "#38BDF8",
};

export const agents = [
  { id: "agent-01", act: "command", tint: "amber" },
  { id: "agent-02", act: "evolution", tint: "cyan" },
  { id: "agent-03", act: "ventures", tint: "emerald" },
  { id: "agent-04", act: "arena", tint: "amber" },
  { id: "agent-05", act: "finale", tint: "cyan" },
] as const satisfies readonly AgentSlot[];

const agentRosterComplete: (typeof agents)["length"] extends 5 ? true : never = true;

export { agentRosterComplete };
