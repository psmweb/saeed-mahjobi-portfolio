import { DEMO_BADGE } from "../agents";
import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "Saeed Mahjobi — ONE COMMAND",
    description:
      "Bilingual portfolio of Saeed Mahjobi. Six active products, a 2020 archive, and five humanoid agent rigs.",
  },
  brand: {
    command: "ONE COMMAND",
    name: "Saeed Mahjobi",
  },
  profile: {
    english: "English (Fluent / Professional)",
    persian: "Persian (Native)",
  },
  demoBadge: DEMO_BADGE.en,
  nav: {
    aria: "Portfolio acts",
    languageToggle: "Switch language",
  },
  acts: {
    command: {
      kicker: "Act 01",
      title: "ONE COMMAND",
      body: "Saeed Mahjobi. English (Fluent / Professional). Persian (Native).",
    },
    evolution: {
      kicker: "Act 02",
      title: "Evolution",
      body: "2020 archive is the one dated mark. The rest of the catalog is listed without a year.",
    },
    ventures: {
      kicker: "Act 03",
      title: "Venture stage",
      body: "Six active products.",
    },
    arena: {
      kicker: "Act 04",
      title: "Agent arena",
      body: "Five humanoid agent rigs. Anything you can run here is a live simulation and a demo.",
    },
    finale: {
      kicker: "Act 05",
      title: "Command center",
      body: "ONE COMMAND. The page direction follows the language.",
    },
  },
  lanes: {
    active: "Active",
    catalog: "Catalog",
    archive: "Archive",
  },
  ventureNames: {
    "archive-2020": "2020 archive",
    "mikham-miara": "Mikham + Miara",
    "battery-store": "Battery Store",
    "trader-bot": "Trader Bot",
    honarmarket: "Honarmarket",
    "yadaki-yar": "Yadaki Yar",
    "sandoq-yar": "Sandoq-Yar",
    xchange: "Xchange",
    "rap-historical": "Rap Historical",
  },
  metricLabels: {
    businesses: "businesses",
    categories: "categories",
    onlineServices: "online services",
    frontend: "",
    backend: "",
    pullRequest: "",
    loc: "LOC",
    language: "",
    ciTests: "CI tests",
    liveTrading: "",
    designs: "designs",
    version: "",
    stack: "",
    form: "",
    year: "",
  },
  metricValues: {
    liveTrading: "Live trading disarmed by default",
    form: "Offline barcode POS PWA",
  },
  hud: {
    batteryLabel: "Scroll charge",
    logTitle: "Live build log",
    logIdle: "Standing by",
  },
  scene: {
    loading: "Opening the obsidian stage",
    unavailable: "3D stage unavailable on this device.",
  },
  arena: {
    skeletonNote: "Skeleton rig",
    slotLabel: "Agent",
  },
  emptyVentures: "No active products are listed.",
  heroPrompt: "one --open portfolio",
  resume: {
    en: "Resume (EN)",
    fa: "Resume (FA)",
  },
};
