const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const ss = (x: number) => x * x * (3 - 2 * x);

/**
 * Portrait frames pull the arena camera back and tighten the row.
 * Desktop eases the same camera out just enough that the five cards clear
 * the battery and the nameplates sit above the build log.
 */
export function arenaFraming(aspect: number, fov: number, internal: number) {
  if (internal <= 17.35 || internal >= 24.7) {
    return { fit: 1, row: 1 };
  }
  const presence = ss(seg(internal, 17.45, 18.15)) * (1 - ss(seg(internal, 24.15, 24.65)));
  if (!(aspect < 1)) {
    return { fit: 1 + 0.2 * presence, row: 1 };
  }
  const safeAspect = Math.max(aspect, 0.35);
  const targetFit = Math.min(1.85, Math.max(1, 0.86 / safeAspect));
  const fit = 1 + (targetFit - 1) * presence;
  const vFov = (fov * Math.PI) / 180;
  const visible = 2 * Math.tan(vFov / 2) * 9.6 * safeAspect * fit;
  const squeezed = Math.min(1, (visible * 0.9) / 8.2);
  const row = 1 + (squeezed - 1) * presence;
  return { fit, row };
}
