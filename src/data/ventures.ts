/**
 * Verified portfolio facts for the scaffold.
 *
 * Active set (6): Mikham + Miara, Battery Store, Trader Bot, Honarmarket,
 * Yadaki Yar, Sandoq-Yar.
 * Also listed: Xchange, Rap Historical, and the 2020 archive.
 *
 * Numbers, versions, and stack names below are the catalog figures.
 * Display sentences live in src/data/i18n so English and Persian stay paired.
 * Do not add geography, currency, prices, barcode prefixes, or names
 * that are outside this catalog.
 */

export type VentureId =
  | "archive-2020"
  | "mikham-miara"
  | "battery-store"
  | "trader-bot"
  | "honarmarket"
  | "yadaki-yar"
  | "sandoq-yar"
  | "xchange"
  | "rap-historical";

export type VentureLane = "active" | "catalog" | "archive";

export type MetricKey =
  | "businesses"
  | "categories"
  | "onlineServices"
  | "frontend"
  | "backend"
  | "pullRequest"
  | "loc"
  | "language"
  | "ciTests"
  | "liveTrading"
  | "designs"
  | "version"
  | "stack"
  | "form"
  | "year";

export type VentureMetric = {
  key: MetricKey;
  value: string;
};

export type Venture = {
  id: VentureId;
  lane: VentureLane;
  metrics: readonly VentureMetric[];
};

export const ventures = [
  {
    id: "archive-2020",
    lane: "archive",
    metrics: [{ key: "year", value: "2020" }],
  },
  {
    id: "mikham-miara",
    lane: "active",
    metrics: [
      { key: "businesses", value: "400K+" },
      { key: "categories", value: "13" },
      { key: "onlineServices", value: "5" },
    ],
  },
  {
    id: "battery-store",
    lane: "active",
    metrics: [
      { key: "frontend", value: "Next.js 15" },
      { key: "backend", value: "NestJS" },
      { key: "pullRequest", value: "PR #201" },
    ],
  },
  {
    id: "trader-bot",
    lane: "active",
    metrics: [
      { key: "loc", value: "~50K" },
      { key: "language", value: "Python" },
      { key: "ciTests", value: "886" },
      { key: "liveTrading", value: "disarmed-by-default" },
    ],
  },
  {
    id: "honarmarket",
    lane: "active",
    metrics: [{ key: "designs", value: "1,450+" }],
  },
  {
    id: "yadaki-yar",
    lane: "active",
    metrics: [
      { key: "version", value: "v0.7.0" },
      { key: "stack", value: "FastAPI + PostgreSQL" },
    ],
  },
  {
    id: "sandoq-yar",
    lane: "active",
    metrics: [{ key: "form", value: "offline-barcode-pos-pwa" }],
  },
  {
    id: "xchange",
    lane: "catalog",
    metrics: [],
  },
  {
    id: "rap-historical",
    lane: "catalog",
    metrics: [],
  },
] as const satisfies readonly Venture[];

const catalogComplete: Exclude<
  VentureId,
  (typeof ventures)[number]["id"]
> extends never
  ? true
  : never = true;

export const activeVentures = ventures.filter(
  (venture): venture is Extract<(typeof ventures)[number], { lane: "active" }> =>
    venture.lane === "active",
);

type ActiveId = (typeof activeVentures)[number]["id"];

export const ACTIVE_PRODUCT_IDS = [
  "mikham-miara",
  "battery-store",
  "trader-bot",
  "honarmarket",
  "yadaki-yar",
  "sandoq-yar",
] as const satisfies readonly ActiveId[];

const activeCountComplete: Exclude<ActiveId, (typeof ACTIVE_PRODUCT_IDS)[number]> extends never
  ? (typeof ACTIVE_PRODUCT_IDS)["length"] extends 6
    ? true
    : never
  : never = true;

if (ACTIVE_PRODUCT_IDS.length !== activeVentures.length) {
  throw new Error("Active product roster does not match the catalog.");
}

export { activeCountComplete, catalogComplete };

export function formatMetric(
  metric: VentureMetric,
  copy: {
    labels: Record<MetricKey, string>;
    liveTrading: string;
    form: string;
  },
): string {
  if (metric.key === "liveTrading") return copy.liveTrading;
  if (metric.key === "form") return copy.form;
  const label = copy.labels[metric.key];
  return label ? `${metric.value} ${label}` : metric.value;
}
