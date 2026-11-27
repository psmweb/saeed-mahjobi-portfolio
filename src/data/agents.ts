/**
 * Five humanoid agent slots for the obsidian stage.
 * These are scene rigs, not extra catalog products.
 * Any interactive task built on top of them must wear DEMO_BADGE.
 * ARENA_ROLES matches the reference Act 4 roster (color, prop, order).
 */

export const ARENA_ROLES = [
  { id: "frontend", color: "#38BDF8", prop: "frame" },
  { id: "backend", color: "#10B981", prop: "server" },
  { id: "executive", color: "#F59E0B", prop: "halo" },
  { id: "uiux", color: "#A78BFA", prop: "prism" },
  { id: "video", color: "#FB923C", prop: "lens" },
] as const;

export type ArenaProp = (typeof ARENA_ROLES)[number]["prop"];

export const ARENA_TARGETS = [
  { id: "battery-store", color: "#38BDF8", texture: "/textures/ventures/battery-store.png" },
  { id: "trader-bot", color: "#10B981", texture: "/textures/ventures/trader-bot.png" },
  { id: "mikham-miara", color: "#F59E0B", texture: "/textures/ventures/mikham.png" },
  { id: "honarmarket", color: "#A78BFA", texture: "/textures/ventures/honarmarket.png" },
  { id: "yadaki-yar", color: "#FB923C", texture: "/textures/ventures/yadaki-yar.png" },
] as const;

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
