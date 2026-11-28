import * as THREE from "three";
import { easeInOutCubic } from "@/lib/motion";

/** Presentation clock in the reference. Scroll 0–1 maps onto this. */
export const PRESENTATION_SECONDS = 52;

/**
 * Scroll travel of the whole show, in viewports.
 * Section heights are this travel plus the viewport already on screen at the end,
 * so `scrollHeight - innerHeight` is `SCROLL_VIEWPORTS` times the viewport.
 * Heights use `svh`, not raw pixels.
 */
export const SCROLL_VIEWPORTS = 13;

/** Act-cut crossfade, in viewports of that travel. 0.35 / 13 of the 52s clock. */
export const HANDOFF_VIEWPORTS = 0.35;

const KN: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [5.6, 4],
  [7, 5],
  [13.7, 9.7],
  [14.2, 10.15],
  [34.0, 17.55],
  [34.7, 18.1],
  [44, 23.5],
  [52, 27.5],
];

const STW: ReadonlyArray<readonly [number, number]> = [0, 1, 2, 3, 4, 5].map((k) => [
  10.15 + k * 1.2648,
  10.15 + k * 1.2648 + 1.0736,
]);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const eo = (x: number) => 1 - (1 - x) ** 3;
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const ss = (x: number) => x * x * (3 - 2 * x);

const secants = KN.slice(0, -1).map((_, index) => {
  const [x0, y0] = KN[index];
  const [x1, y1] = KN[index + 1];
  return (y1 - y0) / (x1 - x0);
});

/**
 * One slope per knot, so internal speed has no step.
 * The venture run (14.2s → 34.0s) keeps its secant at both ends, which leaves
 * that span linear and gives each Act 3 slot 700–800px at a 900px viewport.
 * The 13.7s–14.2s join is a monotone cubic from the previous slope down onto
 * that venture slope, replacing the old 0.90 → 0.38 step.
 */
const openingSlope = secants[0];
const ventureSlope = secants[4];
const knotSlope = [
  openingSlope,
  openingSlope,
  openingSlope,
  secants[2],
  ventureSlope,
  ventureSlope,
  secants[6],
  secants[6],
  secants[7],
];

function segmentIsLinear(index: number): boolean {
  const slope = secants[index];
  return Math.abs(knotSlope[index] - slope) < 1e-9 && Math.abs(knotSlope[index + 1] - slope) < 1e-9;
}

/** Cubic Hermite on a segment. `t` is 0–1. Endpoint slopes are per second. */
function hermite(t: number, y0: number, y1: number, m0: number, m1: number, span: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * span * m0 +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * span * m1
  );
}

function samplePresentation(index: number, tr: number): number {
  const [x0, y0] = KN[index];
  const [x1, y1] = KN[index + 1];
  const span = x1 - x0;
  if (span === 0) return y0;
  const t = (tr - x0) / span;
  if (segmentIsLinear(index)) return y0 + (y1 - y0) * t;
  return hermite(t, y0, y1, knotSlope[index], knotSlope[index + 1], span);
}

/** Map a 0–52s presentation time onto the reference scene clock. */
export function mapPresentationTime(tr: number): number {
  if (tr <= 0) return 0;
  if (tr >= PRESENTATION_SECONDS) return KN[KN.length - 1][1];
  for (let index = 0; index < KN.length - 1; index += 1) {
    if (tr <= KN[index + 1][0]) return samplePresentation(index, tr);
  }
  return KN[KN.length - 1][1];
}

/** Internal-clock cuts between the five acts. `chapterIndex` reads these. */
export const ACT_BOUNDARY_INTERNAL = [4.8, 9.9, 17.6, 23.5] as const;

export function chapterIndex(internalT: number): number {
  if (internalT < ACT_BOUNDARY_INTERNAL[0]) return 0;
  if (internalT < ACT_BOUNDARY_INTERNAL[1]) return 1;
  if (internalT < ACT_BOUNDARY_INTERNAL[2]) return 2;
  if (internalT < ACT_BOUNDARY_INTERNAL[3]) return 3;
  return 4;
}

/** Inverse of `mapPresentationTime`. Linear spans are closed-form. Cubic joins are searched. */
export function presentationForInternal(internal: number): number {
  const end = KN[KN.length - 1][1];
  const time = Math.min(end, Math.max(0, internal));
  for (let index = 0; index < KN.length - 1; index += 1) {
    const [x0, y0] = KN[index];
    const [x1, y1] = KN[index + 1];
    if (time > y1) continue;
    const span = y1 - y0;
    if (span === 0 || segmentIsLinear(index)) {
      return span === 0 ? x0 : x0 + ((x1 - x0) * (time - y0)) / span;
    }
    let lo = 0;
    let hi = 1;
    const width = x1 - x0;
    for (let step = 0; step < 48; step += 1) {
      const mid = (lo + hi) / 2;
      const y = hermite(mid, y0, y1, knotSlope[index], knotSlope[index + 1], width);
      if (y < time) lo = mid;
      else hi = mid;
    }
    return x0 + hi * width;
  }
  return PRESENTATION_SECONDS;
}

const presentationMarks = [
  0,
  ...ACT_BOUNDARY_INTERNAL.map((internal) => presentationForInternal(internal)),
  PRESENTATION_SECONDS,
];

/**
 * Scroll progress where Act 3 opens.
 * The cut is `ACT_BOUNDARY_INTERNAL[1]` (internal 9.9), inverted through the
 * monotone time map and divided by the 52s show.
 */
export const ACT3_SCROLL_START =
  presentationForInternal(ACT_BOUNDARY_INTERNAL[1]) / PRESENTATION_SECONDS;

/** Scroll travel of each act, in viewports. Sum is `SCROLL_VIEWPORTS`. */
export const ACT_SCROLL_VIEWPORTS: readonly number[] = presentationMarks.slice(0, -1).map((start, index) => {
  return ((presentationMarks[index + 1] - start) / PRESENTATION_SECONDS) * SCROLL_VIEWPORTS;
});

/** Section block size. The last act includes the viewport already visible at rest. */
export function actSectionHeight(index: number): string {
  const travel = ACT_SCROLL_VIEWPORTS[index] ?? 0;
  const screens = travel + (index === ACT_SCROLL_VIEWPORTS.length - 1 ? 1 : 0);
  return `${screens * 100}svh`;
}

/** Shortest act, as a fraction of the scroll. One wheel frame cannot jump past it. */
export function shortestActProgress(): number {
  return Math.min(...ACT_SCROLL_VIEWPORTS) / SCROLL_VIEWPORTS;
}

const PRODUCT_LOG_AT = STW.map(([start]) => start - 0.05);

/** Internal-clock beats for the bottom telemetry line. */
export const LOG_AT = [
  0, 1, 2.6, 5, 7.6, 9.8, ...PRODUCT_LOG_AT, 17.6, 20.8, 22.7, 23.6, 25,
];

export function logIndex(internalT: number): number {
  let index = 0;
  for (let i = 0; i < LOG_AT.length; i += 1) {
    if (internalT >= LOG_AT[i]) index = i;
  }
  return index;
}

const UP = new THREE.Vector3(0, 1, 0);
const C2 = new THREE.Vector3(1, 0, -46);
const S0 = new THREE.Vector3(24, 0, -70);
const SD = new THREE.Vector3(16, 0, -5);

function stageAt(index: number, out: THREE.Vector3): THREE.Vector3 {
  return out.copy(S0).addScaledVector(SD, index);
}

const stageFive = stageAt(5, new THREE.Vector3());
const arenaOrigin = stageFive.clone().add(new THREE.Vector3(14, 0, -26));
const finaleOrigin = arenaOrigin.clone().add(new THREE.Vector3(0, 18, -6));
const storyOrigin = new THREE.Vector3(0.3, 2.35, 1.6);
const hero = new THREE.Vector3(-0.6, 0.15, 12.4);
const heroTarget = new THREE.Vector3(-0.6, 0, 0);
const arcTarget = C2.clone().add(new THREE.Vector3(0, 0.55, 0));
const arenaCamera = arenaOrigin.clone().add(new THREE.Vector3(0, 0.9, 9.6));
const arenaLook = arenaOrigin.clone().add(new THREE.Vector3(0, 0.45, 0));
const finaleCamera = finaleOrigin.clone().add(new THREE.Vector3(0, 0.2, 12));
const finaleLook = finaleOrigin.clone();

const arcScratch = new THREE.Vector3();
function arcPosition(angle: number, out: THREE.Vector3): THREE.Vector3 {
  arcScratch.set(13.5 * Math.sin(angle), 1.5, 13.5 * Math.cos(angle));
  return out.copy(C2).add(arcScratch);
}

const aOf = (t: number) =>
  0.05 * seg(t, 5, 6.1) + eio(seg(t, 6.1, 6.8)) + eio(seg(t, 7.7, 8.45)) + 0.08 * seg(t, 8.45, 9.7);

const path = new THREE.CatmullRomCurve3([
  hero.clone().add(new THREE.Vector3(0, 0, -0.4)),
  new THREE.Vector3(0.3, 1.6, 7),
  storyOrigin.clone().add(new THREE.Vector3(0, 0, 1.2)),
  storyOrigin.clone().add(new THREE.Vector3(0, 0, -2)),
  new THREE.Vector3(1, 1.8, -16),
  arcPosition(0, new THREE.Vector3()),
]);

const position = new THREE.Vector3();
const target = new THREE.Vector3();
let roll = 0;
let fov = 40;

const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const vC = new THREE.Vector3();
const vD = new THREE.Vector3();
const vE = new THREE.Vector3();
const off = new THREE.Vector3();

function lookOffset(index: number, out: THREE.Vector3): THREE.Vector3 {
  stageAt(index, out);
  out.x += -1.55;
  out.y += 0.05;
  return out;
}

function viewOffset(index: number, out: THREE.Vector3): THREE.Vector3 {
  stageAt(index, out);
  out.x += -1.55;
  out.y += 0.25;
  out.z += 10.6;
  return out;
}

function camRaw(t: number) {
  roll = 0;
  const time = Math.max(0, t);
  if (time < 4) {
    const k = eo(seg(time, 0, 1.8));
    position.set(-1.8, 1.4, 15.5).lerp(hero, k);
    position.z -= seg(time, 1.8, 4) * 0.45;
    position.x += Math.sin(time * 0.5) * 0.1;
    target.copy(heroTarget);
    return;
  }
  if (time < 5) {
    const u = eio(seg(time, 4, 5));
    path.getPointAt(u, position);
    path.getPointAt(Math.min(1, u + 0.05), target);
    if (u < 0.08) target.lerp(heroTarget, 1 - u / 0.08);
    roll = Math.sin(Math.PI * u) * 0.25;
    return;
  }
  if (time < 9.7) {
    arcPosition(aOf(time), position);
    target.copy(arcTarget);
    position.y += Math.sin((time - 5) * 0.8) * 0.2;
    return;
  }
  if (time < 10.15) {
    const k = eio(seg(time, 9.7, 10.15));
    arcPosition(aOf(9.7), position).lerp(viewOffset(0, vA), k);
    position.y += Math.sin(Math.PI * k) * 1.4;
    target.copy(arcTarget).lerp(lookOffset(0, vB), eo(seg(time, 9.7, 10.1)));
    roll = -Math.sin(Math.PI * k) * 0.1;
    return;
  }
  for (let k = 0; k < 6; k += 1) {
    const [a, b] = STW[k];
    if (time <= b) {
      const d = seg(time, a, b);
      const ang = lerp(-0.13, 0.13, eio(d));
      off.set(-1.55, 0.25 + 0.25 * Math.sin(Math.PI * d), 10.6 - 0.6 * eio(d));
      off.applyAxisAngle(UP, ang);
      stageAt(k, position).add(off);
      lookOffset(k, target);
      return;
    }
    if (k < 5 && time < STW[k + 1][0]) {
      const p = eio(seg(time, b, STW[k + 1][0]));
      vA.set(-1.55, 0.25, 10).applyAxisAngle(UP, 0.13);
      vB.set(-1.55, 0.25, 10.6).applyAxisAngle(UP, -0.13);
      stageAt(k, vC).add(vA);
      stageAt(k + 1, vD).add(vB);
      vE.copy(vC).lerp(vD, 0.5).add(new THREE.Vector3(0, 0.9, 3.4));
      const start = vC.clone().add(vC.clone().sub(vE).multiplyScalar(0.15));
      const end = vD.clone().add(vD.clone().sub(vE).multiplyScalar(0.15));
      const curve = new THREE.CatmullRomCurve3([start, vC.clone(), vE.clone(), vD.clone(), end]);
      curve.getPoint(0.25 + 0.5 * p, position);
      lookOffset(k, target).lerp(lookOffset(k + 1, vA), ss(p));
      roll = Math.sin(Math.PI * p) * 0.05;
      return;
    }
  }
  if (time < 18.1) {
    const p = eio(seg(time, 17.55, 18.1));
    vA.set(-1.55, 0.25, 10).applyAxisAngle(UP, 0.13);
    stageAt(5, position).add(vA).lerp(arenaCamera, p);
    position.y += Math.sin(Math.PI * p) * 2.5;
    lookOffset(5, target).lerp(arenaLook, p);
    roll = Math.sin(Math.PI * p) * 0.08;
    return;
  }
  if (time < 23.5) {
    const ph = 0.24 * Math.sin((time - 18.1) * 0.62 - 0.4);
    const push = eio(seg(time, 21.2, 22)) * 1.3 - eio(seg(time, 22.9, 23.5)) * 0.6;
    position.copy(arenaLook).add(
      vA.set(Math.sin(ph) * (9.6 - push), 0.45 - push * 0.25, Math.cos(ph) * (9.6 - push)),
    );
    target.copy(arenaLook).add(vB.set(0, -0.1 * push, push * 0.4));
    return;
  }
  const p = eio(seg(time, 23.5, 24.5));
  position.copy(arenaCamera).lerp(finaleCamera, p);
  position.z += Math.sin(Math.PI * p) * 3;
  target.copy(arenaLook).lerp(finaleLook, p);
  target.y += Math.sin(Math.PI * p) * 1.5;
  position.z -= seg(time, 24.5, 27.5) * 0.6;
}

const smoothPosition = new THREE.Vector3();
const smoothTarget = new THREE.Vector3();
const WEIGHTS = [1, 4, 9, 12, 9, 4, 1];
const WINDOW = 0.07;

function camAt(t: number) {
  let weightSum = 0;
  let rollSum = 0;
  smoothPosition.set(0, 0, 0);
  smoothTarget.set(0, 0, 0);
  for (let i = 0; i < 7; i += 1) {
    const offset = (i - 3) * WINDOW;
    camRaw(t + offset);
    smoothPosition.addScaledVector(position, WEIGHTS[i]);
    rollSum += roll * WEIGHTS[i];
    camRaw(t + offset - 0.09);
    smoothTarget.addScaledVector(target, WEIGHTS[i]);
    weightSum += WEIGHTS[i];
  }
  position.copy(smoothPosition).multiplyScalar(1 / weightSum);
  target.copy(smoothTarget).multiplyScalar(1 / weightSum);
  roll = rollSum / weightSum;
}

function fovAt(t: number): number {
  let breathe = 0;
  const windows: Array<readonly [number, number, number]> = [
    [4, 5, 5],
    [9.7, 10.15, 4],
    ...STW.slice(0, 5).map((window, index) => [window[1], STW[index + 1][0], 4.5] as const),
    [17.55, 18.1, 4],
    [23.5, 24.5, 4],
  ];
  for (const [a, c, amount] of windows) {
    const p = seg(t, a, c);
    if (p > 0 && p < 1) breathe += Math.sin(Math.PI * p) ** 2 * amount;
  }
  return 40 + breathe - 1.2 * seg(t, 18.1, 23.5) * Math.sin(Math.PI * seg(t, 18.1, 23.5));
}

export type CameraSample = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  roll: number;
  fov: number;
};

type CameraKnot = {
  time: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  roll: number;
  fov: number;
};

type CameraSegment = {
  glide: boolean;
  times: number[];
  knots: CameraKnot[];
  positionCurve: THREE.CatmullRomCurve3;
  targetCurve: THREE.CatmullRomCurve3;
};

const HOLD_STEP = 0.05;
const GLIDE_STEP = 0.04;
const KNOT_EPSILON = 1e-4;

function captureKnot(time: number): CameraKnot {
  camAt(time);
  return {
    time,
    position: position.clone(),
    target: target.clone(),
    roll,
    fov: fovAt(time),
  };
}

function dedupeTimes(times: number[]): number[] {
  const sorted = [...times].sort((a, b) => a - b);
  const unique: number[] = [];
  for (const time of sorted) {
    if (unique.length === 0 || time - unique[unique.length - 1] > KNOT_EPSILON) unique.push(time);
  }
  return unique;
}

function timesBetween(start: number, end: number, step: number, extras: readonly number[]): number[] {
  const times = [start, end];
  if (end - start > step) {
    for (let time = start + step; time < end - KNOT_EPSILON; time += step) times.push(time);
  }
  for (const extra of extras) {
    if (extra > start + KNOT_EPSILON && extra < end - KNOT_EPSILON) times.push(extra);
  }
  return dedupeTimes(times);
}

function buildSegment(glide: boolean, start: number, end: number, extras: readonly number[]): CameraSegment {
  const times = timesBetween(start, end, glide ? GLIDE_STEP : HOLD_STEP, glide ? [] : extras);
  const knots = times.map((time) => captureKnot(time));
  return {
    glide,
    times,
    knots,
    positionCurve: new THREE.CatmullRomCurve3(
      knots.map((knot) => knot.position),
      false,
      "centripetal",
    ),
    targetCurve: new THREE.CatmullRomCurve3(
      knots.map((knot) => knot.target),
      false,
      "centripetal",
    ),
  };
}

/**
 * Hold spans reconstruct the approved camera. Every baked knot, including the
 * verification clocks, is copied exactly, so those compositions stay put.
 * Glide spans are the moves between holds. Each span is one centripetal
 * Catmull-Rom curve. Scroll time is eased with a cubic, then the curve is
 * sampled at that eased time so the move still follows the approved path and
 * both endpoints land on the approved pose. Lenis is the scroll smoother.
 */
function buildCameraSegments(): CameraSegment[] {
  const ventureHolds = STW.flatMap(([start]) => [start + 0.45, start + 0.5]);
  const verify = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].map((progress) =>
    mapPresentationTime(progress * PRESENTATION_SECONDS),
  );
  const extras = [
    ...verify,
    2, 2.2, 7.2, 20.4, 22.3, 23.1, 23.15, 26.2,
    ...ventureHolds,
  ];
  const glideSpans: Array<readonly [number, number]> = [
    [0, 1.8],
    [4, 5],
    [9.7, 10.15],
    ...STW.slice(0, 5).map((span, index) => [span[1], STW[index + 1][0]] as const),
    [STW[5][1], 18.1],
    [23.5, 24.5],
  ];
  const regions: Array<{ glide: boolean; start: number; end: number }> = [];
  let cursor = 0;
  for (const [start, end] of glideSpans) {
    if (start - cursor > KNOT_EPSILON) regions.push({ glide: false, start: cursor, end: start });
    regions.push({ glide: true, start, end });
    cursor = end;
  }
  if (27.5 - cursor > KNOT_EPSILON) regions.push({ glide: false, start: cursor, end: 27.5 });
  return regions.map((region) => buildSegment(region.glide, region.start, region.end, extras));
}

const cameraSegments = buildCameraSegments();

function copyKnot(knot: CameraKnot) {
  position.copy(knot.position);
  target.copy(knot.target);
  roll = knot.roll;
  fov = knot.fov;
}

function sampleSegment(segment: CameraSegment, time: number) {
  const last = segment.times.length - 1;
  const start = segment.times[0];
  const end = segment.times[last];
  if (time <= start + KNOT_EPSILON) {
    copyKnot(segment.knots[0]);
    return;
  }
  if (time >= end - KNOT_EPSILON) {
    copyKnot(segment.knots[last]);
    return;
  }
  const glideSpan = end - start;
  const clock = segment.glide ? start + glideSpan * easeInOutCubic((time - start) / glideSpan) : time;
  let index = 0;
  while (index < last - 1 && clock > segment.times[index + 1]) index += 1;
  const span = segment.times[index + 1] - segment.times[index];
  const local = span > 1e-8 ? Math.min(1, Math.max(0, (clock - segment.times[index]) / span)) : 0;
  if (local <= 1e-6) {
    copyKnot(segment.knots[index]);
    return;
  }
  if (local >= 1 - 1e-6) {
    copyKnot(segment.knots[index + 1]);
    return;
  }
  const parameter = (index + local) / last;
  segment.positionCurve.getPoint(parameter, position);
  segment.targetCurve.getPoint(parameter, target);
  roll = lerp(segment.knots[index].roll, segment.knots[index + 1].roll, local);
  fov = lerp(segment.knots[index].fov, segment.knots[index + 1].fov, local);
}

function sampleCinematic(time: number) {
  const clamped = Math.min(27.5, Math.max(0, time));
  for (let index = 0; index < cameraSegments.length; index += 1) {
    const segment = cameraSegments[index];
    const finalSegment = index === cameraSegments.length - 1;
    if (finalSegment || clamped <= segment.times[segment.times.length - 1]) {
      sampleSegment(segment, clamped);
      return;
    }
  }
}

function holdDrift(time: number): number {
  sampleCinematic(time);
  const sampledPosition = position.clone();
  const sampledTarget = target.clone();
  const sampledRoll = roll;
  const sampledFov = fov;
  camAt(time);
  const drift = Math.max(
    sampledPosition.distanceTo(position),
    sampledTarget.distanceTo(target),
    Math.abs(sampledRoll - roll),
    Math.abs(sampledFov - fovAt(time)),
  );
  position.copy(sampledPosition);
  target.copy(sampledTarget);
  roll = sampledRoll;
  fov = sampledFov;
  return drift;
}

const guardedHolds = [
  ...[0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].map((progress) => mapPresentationTime(progress * PRESENTATION_SECONDS)),
  2, 2.2, 7.2, 20.4, 22.3, 23.1, 23.15, 26.2,
  ...STW.flatMap(([start]) => [start + 0.45, start + 0.5]),
];

for (const time of guardedHolds) {
  const drift = holdDrift(time);
  if (drift > 1e-3) {
    throw new Error(`Camera hold drifted at internal ${time.toFixed(4)} by ${drift}`);
  }
}

if (KN.length !== knotSlope.length || KN[4][0] !== 14.2) {
  throw new Error("Presentation knots and slopes are out of step.");
}

for (const [present, internal] of KN) {
  if (Math.abs(mapPresentationTime(present) - internal) > 1e-6) {
    throw new Error(`Presentation knot missed at ${present}s`);
  }
}

function presentationSlope(tr: number): number {
  const dt = 1e-4;
  const left = Math.max(0, tr - dt);
  const right = Math.min(PRESENTATION_SECONDS, tr + dt);
  return (mapPresentationTime(right) - mapPresentationTime(left)) / (right - left);
}

for (let index = 1; index < KN.length - 1; index += 1) {
  const at = KN[index][0];
  const before = presentationSlope(at - 5e-4);
  const after = presentationSlope(at + 5e-4);
  if (Math.abs(before - after) > 0.03) {
    throw new Error(`Camera speed steps at ${at}s (${before.toFixed(3)} to ${after.toFixed(3)})`);
  }
}

let previousInternal = 0;
for (let step = 1; step <= 200; step += 1) {
  const internal = mapPresentationTime((step / 200) * PRESENTATION_SECONDS);
  if (internal + 1e-6 < previousInternal) {
    throw new Error("Presentation map went backwards.");
  }
  previousInternal = internal;
}

/** Sample the reference camera. `progress` is document scroll, 0–1. */
export function sampleCamera(progress: number, reducedMotion: boolean): CameraSample {
  const presentation = clamp01(progress) * PRESENTATION_SECONDS;
  const internal = mapPresentationTime(presentation);
  if (reducedMotion) {
    camRaw(internal);
    roll = 0;
    fov = 40;
  } else {
    sampleCinematic(internal);
  }
  return { position, target, roll, fov };
}

export function readClock(progress: number) {
  const presentation = clamp01(progress) * PRESENTATION_SECONDS;
  const internal = mapPresentationTime(presentation);
  return {
    presentation,
    internal,
    chapter: chapterIndex(internal),
    log: logIndex(internal),
    battery: Math.min(1, presentation / 51),
  };
}

export const ATMOSPHERE_KEYS: ReadonlyArray<readonly [number, string, number, number]> = [
  [0, "#05070C", 0.02, 0.5],
  [4, "#05070C", 0.02, 0.5],
  [4.7, "#2a1a05", 0.06, 0.6],
  [5.2, "#070B14", 0.02, 0.5],
  [9.4, "#070B14", 0.02, 0.5],
  ...STW.flatMap(([a, b], k) => {
    const color = ["#0B0905", "#050A12", "#04100B", "#10060D", "#060818", "#03100F"][k];
    return [
      [a - 0.08, color, 0.016, 0.4] as const,
      [b + 0.08, color, 0.016, 0.4] as const,
    ];
  }),
  [18.1, "#05070C", 0.018, 0.45],
  [23.5, "#05070C", 0.018, 0.45],
  [24.2, "#080C15", 0.016, 0.5],
  [28, "#080C15", 0.016, 0.5],
];

export function atmosphereAt(internalT: number) {
  let i = 0;
  while (i < ATMOSPHERE_KEYS.length - 2 && internalT > ATMOSPHERE_KEYS[i + 1][0]) i += 1;
  const a = ATMOSPHERE_KEYS[i];
  const b = ATMOSPHERE_KEYS[i + 1];
  const k = ss(seg(internalT, a[0], b[0]));
  return {
    from: a[1],
    to: b[1],
    mix: k,
    density: lerp(a[2], b[2], k),
    hemi: lerp(a[3], b[3], k),
  };
}

export function stageNebulaOpacity(internalT: number, index: number): number {
  const [a, b] = STW[index];
  return 0.3 * ss(seg(internalT, a - 0.5, a + 0.1)) * (1 - ss(seg(internalT, b, b + 0.5)));
}

const eo5 = (x: number) => 1 - (1 - x) ** 5;

export function ventureWindow(index: number): readonly [number, number] | null {
  return STW[index] ?? null;
}

/** How fully a venture slab is in frame. Matches the reference stage fade. */
export function venturePresence(internalT: number, index: number): number {
  const span = STW[index];
  if (!span) return 0;
  const [a, b] = span;
  return ss(seg(internalT, a - 0.45, a + 0.1)) * (1 - ss(seg(internalT, b + 0.1, b + 0.5)));
}

/** 0–1 scroll of the UI texture across one venture window. */
export function ventureScroll(internalT: number, index: number): number {
  const span = STW[index];
  if (!span) return 0;
  const [a, b] = span;
  return eio(seg(internalT, a - 0.15, b + 0.1));
}

/** Placard opacity for one venture. Matches the reference HUD curve. */
export function venturePlacardOpacity(internalT: number, index: number): number {
  const span = STW[index];
  if (!span) return 0;
  const [a, b] = span;
  if (!(internalT > a + 0.02 && internalT < b + 0.1)) return 0;
  return eo5(seg(internalT, a + 0.02, a + 0.3)) * (1 - seg(internalT, b - 0.12, b + 0.1));
}

let starSeed = 11;
function rnd() {
  starSeed |= 0;
  starSeed = (starSeed + 0x6d2b79f5) | 0;
  let t = Math.imul(starSeed ^ (starSeed >>> 15), 1 | starSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function createStarPositions(): Float32Array {
  starSeed = 11;
  const count = 2600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = rnd() * 220 - 60;
    positions[i * 3 + 1] = rnd() * 70 - 20;
    positions[i * 3 + 2] = -rnd() * 230 + 30;
  }
  return positions;
}

export const STAGE_ACCENTS = ["#F59E0B", "#38BDF8", "#10B981", "#F472B6", "#60A5FA", "#2DD4BF"] as const;

export function stageWorld(index: number): THREE.Vector3 {
  return stageAt(index, new THREE.Vector3());
}

export const WORLD = {
  c2: C2.clone(),
  arena: arenaOrigin.clone(),
  finale: finaleOrigin.clone(),
};

const spring = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x));

/** Amber beam, reference internal 23.45–24.15. Opacity is the sine envelope. */
export function finaleWipe(internalT: number) {
  const progress = seg(internalT, 23.45, 24.15);
  const opacity = progress > 0 && progress < 1 ? Math.sin(Math.PI * progress) : 0;
  return { progress, opacity };
}

/** Staggered finale lines: 0 kicker, 1 name, 2 closing, 3 actions, 4 languages. */
export function finaleLineOpacity(internalT: number, index: number) {
  return eo(seg(internalT, 24.1 + index * 0.16, 24.6 + index * 0.16));
}

/** Portrait and stage glow, reference internal 24.0–24.9. */
export function finalePortrait(internalT: number) {
  return eo(seg(internalT, 24, 24.9));
}

/** Reference switches the finale block to Persian once the beam has crossed. */
export function finaleLocaleLock(internalT: number) {
  return internalT > 23.9;
}

export function finaleApprovePulse(internalT: number) {
  return internalT > 25.9;
}

/** Pop-in for finale agent `index`, reference internal 24.5 onward. */
export function finaleRobotPop(internalT: number, index: number) {
  return spring(seg(internalT, 24.5 + index * 0.08, 25.1 + index * 0.08));
}
