"use client";

import dynamic from "next/dynamic";
import { Act1HeroCommand } from "./acts/Act1HeroCommand";
import { Act2Evolution } from "./acts/Act2Evolution";
import { Act3VentureStage } from "./acts/Act3VentureStage";
import { Act4AgentArena } from "./acts/Act4AgentArena";
import { Act5FinaleCommandCenter } from "./acts/Act5FinaleCommandCenter";
import { BatteryScrollMeter } from "./hud/BatteryScrollMeter";
import { GlassNavbar } from "./hud/GlassNavbar";
import { LiveBuildLog } from "./hud/LiveBuildLog";
import { SceneBoundary, SceneLoading } from "./scene/SceneBoundary";
import { SmoothScroll } from "./SmoothScroll";

const PortfolioCanvas = dynamic(
  () => import("./scene/PortfolioCanvas").then((mod) => mod.PortfolioCanvas),
  { ssr: false, loading: () => <SceneLoading /> },
);

export function PortfolioShell() {
  return (
    <>
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <SceneBoundary>
          <PortfolioCanvas />
        </SceneBoundary>
      </div>
      <GlassNavbar />
      <BatteryScrollMeter />
      <LiveBuildLog />
      <main className="relative z-10 bg-gradient-to-b from-obsidian/88 via-obsidian/72 to-obsidian/90">
        <Act1HeroCommand />
        <Act2Evolution />
        <Act3VentureStage />
        <Act4AgentArena />
        <Act5FinaleCommandCenter />
      </main>
    </>
  );
}
