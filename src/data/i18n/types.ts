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

export type VentureSatellite = {
  id: "xchange" | "rap-historical";
  title: string;
  detail: string;
};

export type VentureStageCopy = {
  id: "mikham-miara" | "battery-store" | "trader-bot" | "honarmarket" | "yadaki-yar" | "sandoq-yar";
  kicker: string;
  title: string;
  body: string;
  stack: string;
  chip: string;
  barcode?: string;
  satellites?: readonly [VentureSatellite, VentureSatellite];
};

export type ArenaTargetCopy = {
  title: string;
  badge: string;
};

export type ArenaCopy = {
  skeletonNote: string;
  slotLabel: string;
  kicker: string;
  headline: string;
  shipTitle: string;
  statusOnline: string;
  statusBuilding: string;
  statusConverging: string;
  statusShipped: string;
  shippedMark: string;
  replay: string;
  replaying: string;
  toast: string;
  queued: string;
  building: string;
  done: string;
  task: string;
  shipLine: string;
  shipVersion: string;
  shipped: string;
  roles: readonly [string, string, string, string, string];
  targets: readonly [ArenaTargetCopy, ArenaTargetCopy, ArenaTargetCopy, ArenaTargetCopy, ArenaTargetCopy];
};

export type FinaleStageCopy = {
  kicker: string;
  name: string;
  closingLead: string;
  closingAccent: string;
  github: string;
  resumeEn: string;
  resumeFa: string;
  approve: string;
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
  hud: {
    batteryLabel: string;
    logTitle: string;
    logMark: string;
    logIdle: string;
    brand: string;
    chapters: string[];
    logLines: string[];
  };
  scene: { loading: string; unavailable: string };
  arena: ArenaCopy;
  emptyVentures: string;
  heroPrompt: string;
  resume: { en: string; fa: string };
  finaleStage: FinaleStageCopy;
  heroStage: {
    displayName: string;
    tagline: string;
    prompt: string;
    pills: [string, string, string];
  };
  evolutionStage: {
    items: [{ year: string; title: string }, { year: string; title: string }, { year: string; title: string }];
  };
  ventureStages: readonly [
    VentureStageCopy,
    VentureStageCopy,
    VentureStageCopy,
    VentureStageCopy,
    VentureStageCopy,
    VentureStageCopy,
  ];
};
