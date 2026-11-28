"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";
import { springPreset } from "@/lib/motion";
import { readRestBox, useFinePointer } from "./usePointerMedia";

const MAX_PX = 6;

const microSpring = {
  stiffness: springPreset.micro.stiffness,
  damping: springPreset.micro.damping,
  mass: springPreset.micro.mass,
};

/**
 * Pull an element toward the pointer by at most 6px, then spring it home.
 * The delta is in client pixels, so the control moves toward the cursor in
 * both LTR and RTL. `mirrorX` is for authored horizontal motion, not for
 * inverting a physical pull.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, max = MAX_PX) {
  const fine = useFinePointer();
  const hovering = useRef(false);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const box = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, microSpring);
  const springY = useSpring(y, microSpring);

  useEffect(() => {
    const write = () => {
      const node = ref.current;
      if (!node) return;
      const tx = springX.get();
      const ty = springY.get();
      if (!hovering.current && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05) {
        node.style.transform = "";
        node.style.willChange = "";
        return;
      }
      node.style.willChange = "transform";
      node.style.transform = `translate3d(${tx.toFixed(3)}px, ${ty.toFixed(3)}px, 0)`;
    };
    const node = ref.current;
    const stopX = springX.on("change", write);
    const stopY = springY.on("change", write);
    return () => {
      stopX();
      stopY();
      cancelAnimationFrame(frame.current);
      if (!node) return;
      node.style.transform = "";
      node.style.willChange = "";
    };
  }, [ref, springX, springY]);

  useEffect(() => {
    if (fine) return;
    hovering.current = false;
    box.current = null;
    x.set(0);
    y.set(0);
  }, [fine, x, y]);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!fine || event.pointerType === "touch") return;
    point.current.x = event.clientX;
    point.current.y = event.clientY;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      if (!hovering.current || !box.current) box.current = readRestBox(node);
      const rect = box.current;
      const dx = point.current.x - (rect.left + rect.width / 2);
      const dy = point.current.y - (rect.top + rect.height / 2);
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));
      hovering.current = true;
      x.set(nx * max);
      y.set(ny * max);
    });
  };

  const onPointerLeave = () => {
    hovering.current = false;
    box.current = null;
    x.set(0);
    y.set(0);
  };

  return { onPointerMove, onPointerLeave };
}

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const bind = useMagnetic(ref);

  return (
    <span ref={ref} className={`inline-flex ${className}`} onPointerMove={bind.onPointerMove} onPointerLeave={bind.onPointerLeave}>
      {children}
    </span>
  );
}
