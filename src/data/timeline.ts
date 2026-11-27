import { ventures, type VentureId } from "./ventures";

/**
 * Only 2020 is a verified year, and it belongs to the archive entry.
 * Other rows stay undated so the scaffold cannot invent a chronology.
 */
export type TimelineEntry = {
  id: VentureId;
  year: "2020" | null;
};

const verifiedYears: Partial<Record<VentureId, "2020">> = {
  "archive-2020": "2020",
};

export const timeline: readonly TimelineEntry[] = ventures.map((venture) => ({
  id: venture.id,
  year: verifiedYears[venture.id] ?? null,
}));
