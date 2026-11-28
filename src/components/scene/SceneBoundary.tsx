"use client";

import { Component, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

function SceneMessage({ status }: { status: "loading" | "unavailable" }) {
  const { dictionary } = useLanguage();
  const label = status === "loading" ? dictionary.scene.loading : dictionary.scene.unavailable;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-end justify-start p-6">
      <p className="max-w-sm font-mono text-[13px] leading-relaxed text-amber/80">{label}</p>
    </div>
  );
}

type BoundaryProps = { children: ReactNode };
type BoundaryState = { failed: boolean };

export class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <SceneMessage status="unavailable" />;
    return this.props.children;
  }
}

export function SceneLoading() {
  return <SceneMessage status="loading" />;
}
