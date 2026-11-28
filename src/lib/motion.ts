/**
 * Motion tokens for ONE COMMAND.
 *
 * Durations are seconds. Easings exist three ways so CSS, Motion, and the
 * cinema sampler share one curve: a cubic-bezier array, a CSS string, and a
 * JavaScript function. The CSS custom properties in `src/app/globals.css`
 * (`--dur-*`, `--ease-*`) mirror the numbers below.
 *
 * `cinematic` is an ease-in-out quint kept as a reference curve. Scroll-mapped
 * motion uses `easeInOutCubic`. Springs are critically damped (no bounce).
 */

export const duration = {
  micro: 0.18,
  ui: 0.32,
  reveal: 0.6,
  scene: 1.1,
} as const;

export const easeBezier = {
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
  cinematic: [0.83, 0, 0.17, 1] as [number, number, number, number],
};

export const easeCss = {
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOutCubic: "cubic-bezier(0.65, 0, 0.35, 1)",
  cinematic: "cubic-bezier(0.83, 0, 0.17, 1)",
} as const;

const clampUnit = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t);

/** CSS `cubic-bezier(0.16, 1, 0.3, 1)`. Settles into the destination. */
export function easeOutExpo(t: number): number {
  const x = clampUnit(t);
  if (x === 0 || x === 1) return x;
  return 1 - 2 ** (-10 * x);
}

/** CSS `cubic-bezier(0.65, 0, 0.35, 1)`. */
export function easeInOutCubic(t: number): number {
  const x = clampUnit(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/**
 * Cinematic ease. Matches CSS `cubic-bezier(0.83, 0, 0.17, 1)` in feel:
 * an ease-in-out quint, flat at both holds.
 */
export function easeInOutQuint(t: number): number {
  const x = clampUnit(t);
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - (-2 * x + 2) ** 5 / 2;
}

/** Critically damped springs. `damping = 2 * sqrt(stiffness * mass)`. */
export const springPreset = {
  micro: { type: "spring" as const, stiffness: 520, damping: 42, mass: 0.8 },
  ui: { type: "spring" as const, stiffness: 320, damping: 36, mass: 1 },
  reveal: { type: "spring" as const, stiffness: 180, damping: 27, mass: 1 },
  scene: { type: "spring" as const, stiffness: 90, damping: 19, mass: 1 },
};

/**
 * Lenis is the only scroll smoother. The scene clock copies Lenis progress
 * on the same WebGL frame. There is no second damp on top of this lerp.
 */
export const scrollTuning = {
  lerp: 0.075,
  wheelMultiplier: 0.6,
  touchMultiplier: 1,
} as const;
