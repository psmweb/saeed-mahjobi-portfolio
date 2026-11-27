import type { MetricKey, VentureId } from "../ventures";

export const ACT_ORDER = ["command", "evolution", "ventures", "arena", "finale"] as const;

export type ActId = (typeof ACT_ORDER)[number];

export type Locale = "en" | "fa";

export type Direction = "ltr" | "rtl";

export type ActCopy = {
  kicker: string;
  title: string;
  body: string;
};

export type Dictionary = {
  meta: { title: string; description: string };
  brand: { command: string; name: string };
  profile: { english: string; persian: string };
  demoBadge: string;
  nav: { aria: string; languageToggle: string };
  acts: Record<ActId, ActCopy>;
  lanes: { active: string; catalog: string; archive: string };
  ventureNames: Record<VentureId, string>;
  metricLabels: Record<MetricKey, string>;
  metricValues: { liveTrading: string; form: string };
  hud: { batteryLabel: string; logTitle: string; logIdle: string };
  scene: { loading: string; unavailable: string };
  arena: { skeletonNote: string; slotLabel: string };
  emptyVentures: string;
  heroPrompt: string;
};
