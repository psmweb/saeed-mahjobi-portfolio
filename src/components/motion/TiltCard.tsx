"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { springPreset } from "@/lib/motion";
import { readRestBox, useFinePointer } from "./usePointerMedia";

const MAX_DEG = 5;

const uiSpring = {
  stiffness: springPreset.ui.stiffness,
  damping: springPreset.ui.damping,
  mass: springPreset.ui.mass,
};

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article";
} & Omit<HTMLAttributes<HTMLElement>, "style" | "className" | "children" | "onPointerMove" | "onPointerLeave">;

/**
 * Tilt toward the pointer by at most 5 degrees and lay a soft specular
 * highlight under the cursor. Rest clears the transform so the card paints
 * exactly as it does without the effect. Rotation is in client space: the
 * face turns toward the pointer in both reading directions.
 */
export function TiltCard({ children, className, style, as = "div", ...rest }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const sheen = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const hovering = useRef(false);
  const frame = useRef(0);
  const hideTimer = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const box = useRef<DOMRect | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, uiSpring);
  const springY = useSpring(rotateY, uiSpring);

  useEffect(() => {
    const write = () => {
      const node = ref.current;
      if (!node) return;
      const rx = springX.get();
      const ry = springY.get();
      if (!hovering.current && Math.abs(rx) < 0.04 && Math.abs(ry) < 0.04) {
        node.style.transform = "";
        node.style.willChange = "";
        return;
      }
      node.style.willChange = "transform";
      node.style.transform = `perspective(900px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
    };
    const node = ref.current;
    const stopX = springX.on("change", write);
    const stopY = springY.on("change", write);
    return () => {
      stopX();
      stopY();
      cancelAnimationFrame(frame.current);
      window.clearTimeout(hideTimer.current);
      if (!node) return;
      node.style.transform = "";
      node.style.willChange = "";
    };
  }, [springX, springY]);

  useEffect(() => {
    if (fine) return;
    hovering.current = false;
    box.current = null;
    rotateX.set(0);
    rotateY.set(0);
    if (sheen.current) {
      sheen.current.style.opacity = "0";
      sheen.current.style.background = "";
      sheen.current.classList.add("hidden");
    }
  }, [fine, rotateX, rotateY]);

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
      const px = Math.max(0, Math.min(1, (point.current.x - rect.left) / Math.max(rect.width, 1)));
      const py = Math.max(0, Math.min(1, (point.current.y - rect.top) / Math.max(rect.height, 1)));
      hovering.current = true;
      rotateY.set((px - 0.5) * 2 * MAX_DEG);
      rotateX.set((0.5 - py) * 2 * MAX_DEG);
      const gloss = sheen.current;
      if (!gloss) return;
      window.clearTimeout(hideTimer.current);
      gloss.classList.remove("hidden");
      gloss.style.opacity = "1";
      gloss.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 28%, transparent 58%)`;
    });
  };

  const onPointerLeave = () => {
    hovering.current = false;
    box.current = null;
    rotateX.set(0);
    rotateY.set(0);
    const gloss = sheen.current;
    if (!gloss) return;
    gloss.style.opacity = "0";
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!hovering.current) gloss.classList.add("hidden");
    }, 320);
  };

  const Tag = as;

  return (
    <Tag
      {...rest}
      ref={(node) => {
        ref.current = node;
      }}
      className={`relative ${className ?? ""}`}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
      <span
        ref={sheen}
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden rounded-[inherit] opacity-0 transition-opacity duration-[var(--dur-ui)] ease-[var(--ease-out-expo)]"
      />
    </Tag>
  );
}
