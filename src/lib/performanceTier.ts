/**
 * Load-time scene budget. Signals: viewport width, devicePixelRatio,
 * hardwareConcurrency, deviceMemory (when the browser exposes it), and a
 * coarse pointer. The starfield stays at the approved 2600 points on every
 * tier: those points are in the hold frames, and the resting picture has to
 * match. Sparks, the depth veil, and the pixel-ratio cap are what scale.
 */

export type PerformanceTier = "high" | "medium" | "low";

export type SceneQuality = {
  tier: PerformanceTier;
  /** Renderer cap. The canvas still floors at 1. */
  dpr: number;
  /** Ship-burst instances. The mesh is allocated at 36. */
  sparks: number;
  /** Fullscreen depth veil. Low tier and a runtime decline skip it. */
  dof: boolean;
  /** Set by drei PerformanceMonitor after a sustained drop. */
  degraded: boolean;
};

export const sceneQuality: SceneQuality = {
  tier: "high",
  dpr: 2,
  sparks: 36,
  dof: true,
  degraded: false,
};

const listeners = new Set<() => void>();

function budgetFor(tier: PerformanceTier): Pick<SceneQuality, "dpr" | "sparks" | "dof"> {
  if (tier === "low") return { dpr: 1.25, sparks: 10, dof: false };
  if (tier === "medium") return { dpr: 1.5, sparks: 18, dof: false };
  return { dpr: 2, sparks: 36, dof: true };
}

export function detectTier(): PerformanceTier {
  const width = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = width < 768;
  const lowMemory = memory !== undefined && memory <= 4;

  if (narrow && (coarse || cores <= 4 || lowMemory || dpr >= 2)) return "low";
  if (narrow || coarse || cores <= 2 || lowMemory || dpr >= 3) return "medium";
  return "high";
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function applyTier(tier: PerformanceTier) {
  const budget = budgetFor(tier);
  sceneQuality.tier = tier;
  sceneQuality.dpr = budget.dpr;
  sceneQuality.sparks = budget.sparks;
  sceneQuality.dof = budget.dof;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.tier = tier;
    document.documentElement.dataset.dprCap = String(budget.dpr);
  }
  emit();
}

export function markDegraded(degraded: boolean) {
  if (sceneQuality.degraded === degraded) return;
  sceneQuality.degraded = degraded;
  emit();
}

/** Instances drawn for the ship burst. A decline tightens the load-time budget. */
export function sparkBudget() {
  if (!sceneQuality.degraded) return sceneQuality.sparks;
  return Math.min(sceneQuality.sparks, 8);
}

export function depthVeilEnabled() {
  return sceneQuality.dof && sceneQuality.tier === "high" && !sceneQuality.degraded;
}

export function subscribeQuality(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let watching = false;

export function ensureSceneQuality() {
  if (watching || typeof window === "undefined") return;
  watching = true;
  const refresh = () => applyTier(detectTier());
  refresh();
  window.addEventListener("resize", refresh);
  window.matchMedia("(pointer: coarse)").addEventListener("change", refresh);
}

if (typeof window !== "undefined") ensureSceneQuality();
