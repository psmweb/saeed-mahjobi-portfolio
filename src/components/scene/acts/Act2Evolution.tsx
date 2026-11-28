"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { scrollProgress } from "@/lib/scrollProgress";
import { readClock } from "../cinema";
import { ExtrudedWord } from "./ExtrudedWord";
import { obsidianMetal } from "./metals";

const C2 = new THREE.Vector3(1, 0, -46);

const eo5 = (x: number) => 1 - (1 - x) ** 5;
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

function atR(theta: number, radius: number, y: number) {
  return new THREE.Vector3(C2.x + Math.sin(theta) * radius, y, C2.z + Math.cos(theta) * radius);
}

function tangent(theta: number) {
  return new THREE.Vector3(Math.cos(theta), 0, -Math.sin(theta));
}

function normal(theta: number) {
  return new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta));
}

const P16 = atR(0, 4, 0);
const CODE16 = atR(0, 5, 0);
const BASE20 = atR(1, 3.6, 0);
const TAN20 = tangent(1);
const NRM20 = normal(1);
const P20 = atR(1, 3.6, 0);
const BASE26 = atR(2, 3.4, 0);
const TAN26 = tangent(2);
const P26 = atR(2, 3.4, 0);

/** u, restY, normal offset, yaw. Matches the reference archive arc. */
const ARCHIVE = [
  { u: -2.72, y: 0.15, o: 0, r: 0.16, title: "PSM Web Developer" },
  { u: 0, y: 0.05, o: 0.48, r: 0, title: "Fitness Point" },
  { u: 2.72, y: 0.15, o: 0, r: -0.16, title: "Brewery" },
] as const;

const STACK = [
  { x: -2.28, title: "Next.js", line: "15", detail: "React 19 · TypeScript" },
  { x: -0.76, title: "NestJS", line: "10", detail: "Prisma 6 · PostgreSQL" },
  { x: 0.76, title: "~50K LOC", line: "Python", detail: "plugin architecture" },
  { x: 2.28, title: "886", line: "CI tests", detail: "all green" },
] as const;

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (context) draw(context, width, height);
  texture.needsUpdate = true;
  return texture;
}

function displayFace() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.documentElement).getPropertyValue("--font-space").trim() || "sans-serif";
}

function monoFace() {
  if (typeof document === "undefined") return "monospace";
  return getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "monospace";
}

function codePlate() {
  return canvasTexture(1024, 512, (context, width, height) => {
    const mono = monoFace();
    context.fillStyle = "#0A0D15";
    roundRect(context, 0, 0, width, height, 28);
    context.fill();
    context.strokeStyle = "rgba(242,181,68,0.8)";
    context.lineWidth = 3;
    roundRect(context, 2, 2, width - 4, height - 4, 26);
    context.stroke();
    context.font = `700 26px ${mono}`;
    context.fillStyle = "#F2B544";
    context.fillText("INDEX.HTML · 2016 · FIRST LINES", 40, 62);
    const lines = [
      "<!DOCTYPE html>",
      "<html>",
      "  <head><title>Hello</title></head>",
      "  <body>",
      "    <h1>Hello, world.</h1>",
      "  </body>",
      "</html>",
    ];
    context.font = `32px ${mono}`;
    lines.forEach((line, index) => {
      context.fillStyle = index === 4 ? "#FFFFFF" : "#8C93A3";
      context.fillText(line, 44, 124 + index * 50);
    });
  });
}

type ArchiveMood = "portfolio" | "fitness" | "brewery";

function fitSize(context: CanvasRenderingContext2D, text: string, face: string, maxWidth: number, size: number) {
  let next = size;
  context.font = `700 ${next}px ${face}`;
  while (next > 28 && context.measureText(text).width > maxWidth) {
    next -= 2;
    context.font = `700 ${next}px ${face}`;
  }
  return next;
}

function browserChrome(context: CanvasRenderingContext2D, width: number) {
  context.fillStyle = "rgba(255,255,255,0.06)";
  context.fillRect(0, 0, width, 52);
  for (const [index, color] of ["#FF5F57", "#FEBC2E", "#28C840"].entries()) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(36 + index * 26, 26, 7, 0, Math.PI * 2);
    context.fill();
  }
}

function paintMark(context: CanvasRenderingContext2D, cx: number, cy: number, scale: number, color: string) {
  context.save();
  context.translate(cx, cy);
  context.scale(scale, scale);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 10;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();
  context.arc(0, -8, 78, Math.PI * 1.08, Math.PI * 1.92);
  context.stroke();
  roundRect(context, -54, 8, 108, 86, 8);
  context.stroke();
  context.beginPath();
  context.moveTo(0, -96);
  context.lineTo(46, -28);
  context.lineTo(-46, -28);
  context.closePath();
  context.stroke();
  context.restore();
}

/** Mini site on the archive glass. The name stays on this texture; there is no under-placard. */
function archiveScreen(title: string, mood: ArchiveMood) {
  return canvasTexture(1280, 820, (context, width, height) => {
    const display = displayFace();
    const mono = monoFace();
    const wash = context.createLinearGradient(0, 0, width, height);
    if (mood === "fitness") {
      wash.addColorStop(0, "#141A14");
      wash.addColorStop(1, "#070A08");
    } else if (mood === "brewery") {
      wash.addColorStop(0, "#24170F");
      wash.addColorStop(1, "#100C09");
    } else {
      wash.addColorStop(0, "#121722");
      wash.addColorStop(1, "#080A10");
    }
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    const glow = context.createRadialGradient(width * 0.78, height * 0.42, 40, width * 0.78, height * 0.42, 420);
    glow.addColorStop(0, mood === "fitness" ? "rgba(61,220,151,0.16)" : "rgba(242,181,68,0.16)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    browserChrome(context, width);

    const accent = mood === "fitness" ? "#F5C451" : mood === "brewery" ? "#E7A15A" : "#F2B544";
    const accentInk = "#1A1206";
    context.fillStyle = accent;
    roundRect(context, 56, 74, 22, 22, 5);
    context.fill();
    context.fillStyle = "#F4F6FB";
    context.font = `700 26px ${display}`;
    const brand = mood === "fitness" ? "FITNESS POINT" : mood === "brewery" ? "STUDIO" : "PSM";
    context.fillText(brand, 92, 93);
    context.fillStyle = "rgba(255,255,255,0.42)";
    context.font = `600 18px ${mono}`;
    const links = mood === "fitness" ? ["Train", "Studio"] : mood === "brewery" ? ["Mark", "Work"] : ["Work", "Studio"];
    links.forEach((link, index) => {
      context.fillText(link, width - 250 + index * 112, 92);
    });

    const lines =
      mood === "fitness" ? ["FITNESS", "POINT"] : mood === "brewery" ? ["BREWERY"] : ["PSM WEB", "DEVELOPER"];
    let cursor = 210;
    lines.forEach((line) => {
      const size = fitSize(context, line, display, 620, mood === "brewery" ? 92 : 78);
      context.fillStyle = "#F7F8FB";
      context.font = `700 ${size}px ${display}`;
      context.fillText(line, 64, cursor);
      cursor += size + 8;
    });
    context.fillStyle = "rgba(255,255,255,0.62)";
    context.font = `400 26px ${display}`;
    const sub =
      mood === "fitness" ? "A bold training page." : mood === "brewery" ? "Warm studio mark." : "Website design.";
    context.fillText(sub, 68, cursor + 18);
    const cta = mood === "fitness" ? "Start" : "View work";
    context.font = `700 24px ${display}`;
    const ctaWidth = Math.ceil(context.measureText(cta).width) + 56;
    context.fillStyle = accent;
    roundRect(context, 64, cursor + 48, ctaWidth, 58, 29);
    context.fill();
    context.fillStyle = accentInk;
    context.fillText(cta, 92, cursor + 86);

    const panelX = 760;
    const panelY = 168;
    const panelW = 456;
    const panelH = 520;
    context.fillStyle = mood === "brewery" ? "rgba(42,28,18,0.92)" : "rgba(8,10,16,0.72)";
    roundRect(context, panelX, panelY, panelW, panelH, 28);
    context.fill();
    context.strokeStyle = accent;
    context.lineWidth = 3;
    roundRect(context, panelX, panelY, panelW, panelH, 28);
    context.stroke();

    if (mood === "brewery") {
      paintMark(context, panelX + panelW / 2, panelY + 230, 1.35, accent);
      context.fillStyle = "rgba(255,255,255,0.7)";
      context.font = `700 22px ${mono}`;
      context.textAlign = "center";
      context.fillText(title.toUpperCase(), panelX + panelW / 2, panelY + panelH - 56);
      context.textAlign = "left";
    } else if (mood === "fitness") {
      const tiles = [
        { label: "TRAIN", tint: "#F5C451" },
        { label: "MOVE", tint: "#3DDC97" },
        { label: "FOCUS", tint: "#F7F8FB" },
      ];
      tiles.forEach((tile, index) => {
        const y = panelY + 36 + index * 156;
        context.fillStyle = "rgba(255,255,255,0.05)";
        roundRect(context, panelX + 28, y, panelW - 56, 136, 18);
        context.fill();
        context.fillStyle = tile.tint;
        roundRect(context, panelX + 48, y + 28, 18, 80, 9);
        context.fill();
        context.fillStyle = "#F7F8FB";
        context.font = `700 36px ${display}`;
        context.fillText(tile.label, panelX + 88, y + 64);
        context.fillStyle = "rgba(255,255,255,0.28)";
        roundRect(context, panelX + 88, y + 84, 220, 14, 7);
        context.fill();
      });
    } else {
      for (let index = 0; index < 3; index += 1) {
        const y = panelY + 36 + index * 156;
        context.fillStyle = "rgba(255,255,255,0.04)";
        roundRect(context, panelX + 28, y, panelW - 56, 140, 16);
        context.fill();
        context.fillStyle = index === 0 ? accent : "rgba(242,181,68,0.28)";
        roundRect(context, panelX + 48, y + 28, 120, 84, 12);
        context.fill();
        context.fillStyle = "rgba(255,255,255,0.7)";
        roundRect(context, panelX + 188, y + 36, 180, 16, 8);
        context.fill();
        context.fillStyle = "rgba(255,255,255,0.22)";
        roundRect(context, panelX + 188, y + 68, 140, 12, 6);
        context.fill();
      }
    }

    context.fillStyle = accent;
    context.font = `700 22px ${mono}`;
    context.fillText(title, 68, height - 36);
    context.fillStyle = "rgba(255,255,255,0.45)";
    context.fillText("2020", width - 140, height - 36);
  });
}

function stackCard(title: string, line: string, detail: string) {
  return canvasTexture(512, 1366, (context, width, height) => {
    const display = displayFace();
    const mono = monoFace();
    const wash = context.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, "#141A2A");
    wash.addColorStop(1, "#080B12");
    context.fillStyle = wash;
    roundRect(context, 0, 0, width, height, 30);
    context.fill();
    context.strokeStyle = "#F2B544";
    context.lineWidth = 4;
    roundRect(context, 3, 3, width - 6, height - 6, 28);
    context.stroke();
    context.fillStyle = "#F2B544";
    context.font = `700 28px ${mono}`;
    context.fillText("2026 · AI-NATIVE", 36, 76);
    context.fillStyle = "#ffffff";
    context.font = `700 78px ${display}`;
    context.fillText(title, 32, 250);
    context.font = `700 92px ${display}`;
    context.fillText(line, 32, 360);
    context.fillStyle = "#8C93A3";
    context.font = `400 28px ${mono}`;
    context.fillText(detail, 36, 470);
    for (let index = 0; index < 12; index += 1) {
      const alpha = 0.18 + 0.06 * (index % 3);
      context.fillStyle = index % 3 ? `rgba(242,181,68,${alpha})` : `rgba(61,220,151,${alpha})`;
      const bar = (width - 72) * (0.35 + (0.6 * ((index * 37) % 10)) / 10);
      roundRect(context, 36, 620 + index * 52, bar, 18, 9);
      context.fill();
    }
    context.fillStyle = "#3DDC97";
    context.font = `700 26px ${mono}`;
    context.fillText("● PASSING", 36, height - 56);
  });
}

function ScreenFace({ map, args, position }: { map: THREE.Texture; args: [number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position} dispose={null}>
      <planeGeometry args={args} />
      <meshBasicMaterial map={map} transparent toneMapped={false} />
    </mesh>
  );
}

function YearWord({
  text,
  gold,
  width,
}: {
  text: string;
  gold?: boolean;
  width: number;
}) {
  return (
    <ExtrudedWord text={text} size={gold ? 1.2 : 1.1} depth={0.4} trackingEm={0.02} center width={width} curveSegments={4}>
      <meshPhysicalMaterial
        color={gold ? "#FFC24D" : "#F2F3F7"}
        metalness={1}
        roughness={gold ? 0.2 : 0.16}
        clearcoat={gold ? 0.8 : 1}
        clearcoatRoughness={gold ? 0.12 : 0.1}
        emissive={gold ? "#B86A00" : "#000000"}
        emissiveIntensity={gold ? 0.55 : 0}
        envMapIntensity={gold ? 2 : 2.2}
      />
    </ExtrudedWord>
  );
}

/** 2016 lines, 2020 archive arc, and 2026 stack. The monoliths and stray cube are gone. */
export function Act2Evolution() {
  const root = useRef<THREE.Group>(null);
  const year16 = useRef<THREE.Group>(null);
  const code = useRef<THREE.Group>(null);
  const year20 = useRef<THREE.Group>(null);
  const year26 = useRef<THREE.Group>(null);
  const panels = useRef<Array<THREE.Group | null>>([]);
  const cards = useRef<Array<THREE.Group | null>>([]);

  const panelGeometry = useMemo(() => new RoundedBoxGeometry(3.4, 2.2, 0.14, 2, 0.05), []);
  const cardGeometry = useMemo(() => new RoundedBoxGeometry(1.5, 4, 0.3, 2, 0.06), []);
  const plates = useMemo(
    () => ({
      code: codePlate(),
      screens: ARCHIVE.map((item) =>
        archiveScreen(item.title, item.title === "Brewery" ? "brewery" : item.title === "Fitness Point" ? "fitness" : "portfolio"),
      ),
      cards: STACK.map((item) => stackCard(item.title, item.line, item.detail)),
    }),
    [],
  );

  useFrame(() => {
    const node = root.current;
    if (!node) return;
    const { internal: t } = readClock(scrollProgress.smoothed);
    node.visible = t > 4.4 && t < 10.4;
    if (!node.visible) return;

    if (year16.current) {
      const y = lerp(-4, 0.2, eo5(seg(t, 4.9, 5.7))) - 6 * eio(seg(t, 6.4, 7));
      year16.current.position.set(P16.x, y, P16.z);
      year16.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      year16.current.visible = t > 4.85 && t < 7.05 && y > -3.2;
    }
    if (code.current) {
      const y = lerp(-6, -1.15, eo5(seg(t, 5, 5.8))) - 6 * eio(seg(t, 6.4, 7));
      code.current.position.set(CODE16.x, y, CODE16.z);
      code.current.rotation.y = 0;
      code.current.visible = t > 4.95 && t < 7.05 && y > -3.4;
    }
    if (year20.current) {
      const y = lerp(-3, 1.78, eo5(seg(t, 6.2, 6.9))) + 7 * eio(seg(t, 7.6, 8.4));
      year20.current.position.set(P20.x, y, P20.z);
      year20.current.rotation.y = 1;
      year20.current.visible = t > 6.2 && t < 8.4 && y < 6;
    }
    if (year26.current) {
      const y = lerp(-3, 2.5, eo5(seg(t, 8, 8.7)));
      year26.current.position.set(P26.x, y, P26.z);
      year26.current.rotation.y = 2;
      year26.current.visible = t > 8 && y > -2.6;
    }

    panels.current.forEach((group, index) => {
      if (!group) return;
      const item = ARCHIVE[index];
      if (!item) return;
      const fin = eo5(seg(t, 6.2 + index * 0.1, 6.9 + index * 0.1));
      const sw = eio(seg(t, 7.6 + index * 0.07, 8.3 + index * 0.07));
      const sign = index === 1 ? 0 : Math.sign(item.u);
      group.position.copy(BASE20).addScaledVector(TAN20, item.u + sign * sw * 3.2).addScaledVector(NRM20, item.o - sw * (index === 1 ? 3.5 : 1.5));
      group.position.y = lerp(-4.5, item.y, fin) - sw * (index === 1 ? 5 : 2.5);
      group.rotation.set(index === 1 ? sw * 0.9 : 0, 1 + item.r + (index === 1 ? 0 : -sign * sw * 1.25), 0);
      group.visible = t > 6.1 && t < 8.5 && fin > 0.02;
    });

    cards.current.forEach((group, index) => {
      if (!group) return;
      const item = STACK[index];
      if (!item) return;
      const p = eo5(seg(t, 8.05 + index * 0.1, 8.8 + index * 0.1));
      group.position.copy(BASE26).addScaledVector(TAN26, item.x);
      group.position.y = lerp(-7, 0.15, p);
      group.rotation.y = 2 + (1 - p) * 0.8;
      group.visible = t > 8.05 && p > 0.02;
    });
  });

  return (
    <group ref={root} name="act-2-evolution" visible={false}>
      <group ref={year16}>
        <YearWord text="2016" width={3.68} />
      </group>
      <group ref={code}>
        <ScreenFace map={plates.code} args={[3.2, 1.6]} position={[0, 0, 0]} />
      </group>
      <group ref={year20}>
        <YearWord text="2020" width={2.15} />
      </group>
      {ARCHIVE.map((item, index) => (
        <group
          key={item.title}
          ref={(node) => {
            panels.current[index] = node;
          }}
        >
          <mesh dispose={null} geometry={panelGeometry} material={obsidianMetal} />
          <ScreenFace map={plates.screens[index]!} args={[3.22, 2.02]} position={[0, 0, 0.08]} />
        </group>
      ))}
      <group ref={year26}>
        <YearWord text="2026" gold width={2.61} />
      </group>
      {STACK.map((item, index) => (
        <group
          key={item.title}
          ref={(node) => {
            cards.current[index] = node;
          }}
        >
          <mesh dispose={null} geometry={cardGeometry} material={obsidianMetal} />
          <ScreenFace map={plates.cards[index]!} args={[1.38, 3.72]} position={[0, 0, 0.16]} />
        </group>
      ))}
    </group>
  );
}
