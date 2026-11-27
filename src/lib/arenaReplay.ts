import { scrollProgress } from "@/lib/scrollProgress";

/** Reference Act 4 clock, internal seconds. Scroll maps 34.2s–44s onto this. */
export const ARENA_IN = 17.3;
export const ARENA_OUT = 24.6;
const REPLAY_FROM = 20.55;
const REPLAY_TO = 23.5;

export type ArenaPhase = "online" | "building" | "converging" | "shipped";
export type ArenaMode = "scroll" | "play" | "hold";

export type ArenaSample = {
  mode: ArenaMode;
  /** Sequence clock. Scroll, the replay movie, or the rested ship pose. */
  t: number;
};

export type ArenaHud = {
  opacity: number;
  toast: number;
  online: number;
  done: number;
  phase: ArenaPhase;
  shipped: boolean;
};

const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

type Replay = {
  active: boolean;
  hold: boolean;
  latched: boolean;
  startMs: number;
};

const replay: Replay = {
  active: false,
  hold: false,
  latched: false,
  startMs: 0,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeArena(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function arenaHud(t: number): ArenaHud {
  const online = Math.min(5, Math.max(0, Math.floor((t - 18.5) / 0.07) + 1));
  let done = 0;
  for (let i = 0; i < 5; i += 1) if (t > 20.15 + i * 0.16) done += 1;
  const phase: ArenaPhase = t < 19.6 ? "online" : t < 20.7 ? "building" : t < 22.6 ? "converging" : "shipped";
  return {
    opacity: seg(t, 18.6, 19) * (1 - seg(t, 23.3, 23.6)),
    toast: seg(t, 22.9, 23.15) * (1 - seg(t, 23.35, 23.55)),
    online,
    done,
    phase,
    shipped: t > 22.85,
  };
}

export function sampleArenaTime(internal: number, now: number, reduced: boolean): ArenaSample {
  if (reduced) {
    if (replay.latched || internal >= 20.7) return { mode: "hold", t: REPLAY_TO };
    return { mode: "scroll", t: internal };
  }
  if (internal <= ARENA_IN || internal >= ARENA_OUT) {
    replay.active = false;
    replay.hold = false;
    return { mode: "scroll", t: internal };
  }
  if (replay.hold) return { mode: "hold", t: REPLAY_TO };
  if (!replay.active) return { mode: "scroll", t: internal };
  const elapsed = (now - replay.startMs) / 1000;
  if (elapsed >= REPLAY_TO - REPLAY_FROM) {
    replay.active = false;
    replay.hold = true;
    return { mode: "hold", t: REPLAY_TO };
  }
  return { mode: "play", t: REPLAY_FROM + elapsed };
}

/** Play the drop through the celebration. Reduced motion rests on the shipped pose. */
export function startArenaReplay() {
  if (scrollProgress.reducedMotion) {
    replay.active = false;
    replay.hold = true;
    replay.latched = true;
    emit();
    return;
  }
  replay.active = true;
  replay.hold = false;
  replay.latched = true;
  replay.startMs = performance.now();
  emit();
}

export function isArenaPlaying() {
  return replay.active;
}
