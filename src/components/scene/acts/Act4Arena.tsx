"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARENA_ROLES, ARENA_TARGETS } from "@/data/agents";
import { getDictionary } from "@/data/i18n";
import type { Dictionary, Locale } from "@/data/i18n/types";
import { scrollProgress } from "@/lib/scrollProgress";
import { ARENA_IN, ARENA_OUT, arenaHud, sampleArenaTime } from "@/lib/arenaReplay";
import { arenaFraming } from "../arenaFraming";
import { WORLD, readClock } from "../cinema";
import { createRobotKit, poseRobot, type RobotRig } from "./act4Robot";

const HOME_X = [-3.7, -1.85, 0, 1.85, 3.7];
const TARGET_X = [-4.9, -2.45, 0, 2.45, 4.9];
const RING = [Math.PI / 2, Math.PI * 0.78, Math.PI, Math.PI * 1.22, Math.PI * 1.5];
const CUBE = new THREE.Vector3(0, -1, 1.9);

const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const eo = (x: number) => 1 - (1 - x) ** 3;
const eo5 = (x: number) => 1 - (1 - x) ** 5;
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const ss = (x: number) => x * x * (3 - 2 * x);
const eback = (x: number) => {
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
const spring = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x));

const up = new THREE.Vector3(0, 1, 0);
const dir = new THREE.Vector3();
const hand = new THREE.Vector3();
const ringScratch = new THREE.Vector3();
const aimScratch = new THREE.Vector3();
const dummy = new THREE.Object3D();

type Paint = {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  texture: THREE.CanvasTexture;
  context: CanvasRenderingContext2D;
  key: string;
  image?: HTMLImageElement | null;
};

type Pedestals = {
  body: THREE.InstancedMesh;
  ring: THREE.InstancedMesh;
  glow: THREE.InstancedMesh;
};

type Runtime = {
  robots: RobotRig[];
  labels: Paint[];
  pedestals: Pedestals;
  targets: Paint[];
  beamCore: THREE.InstancedMesh;
  beamGlow: THREE.InstancedMesh;
  cube: THREE.Mesh;
  cubeGlow: THREE.Mesh;
  cubeGlowMaterial: THREE.MeshBasicMaterial;
  cubeCanvases: CanvasRenderingContext2D[];
  cubeTextures: THREE.CanvasTexture[];
  cubeKey: string;
  shock: THREE.Mesh;
  shockMaterial: THREE.MeshBasicMaterial;
  shockFill: THREE.Mesh;
  shockFillMaterial: THREE.MeshBasicMaterial;
  bulb: THREE.PointLight;
  sparks: THREE.InstancedMesh;
  sparkMaterial: THREE.MeshBasicMaterial;
  locale: Locale;
  copy: Dictionary;
};

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

function fontOf(variable: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || "sans-serif";
}

function radialTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.35, `${color}88`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  texture.needsUpdate = true;
  return texture;
}

function additive(color: string, opacity: number, map?: THREE.Texture) {
  return new THREE.MeshBasicMaterial({
    color,
    map,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    fog: false,
  });
}

function basic(map: THREE.Texture, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    map,
    transparent: opacity < 1,
    opacity,
    toneMapped: false,
    fog: false,
    depthWrite: false,
  });
}

function canvasPaint(width: number, height: number): Omit<Paint, "mesh" | "key" | "material"> & {
  material: THREE.MeshBasicMaterial;
} {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = basic(texture);
  return { texture, context, material };
}

function axis(x: number, row: number, mirrored: boolean) {
  const next = x * row;
  return mirrored ? -next : next;
}

/** Portrait frames inset the wide status cards so they clear the battery. */
function cardPlacement(index: number, row: number, mirrored: boolean) {
  const narrow = row < 0.98;
  const squeeze = narrow ? 0.68 : 1;
  const scale = narrow ? Math.min(0.72, (1.7 * row) / 2.3) : 1;
  return { x: axis((TARGET_X[index] ?? 0) * squeeze, row, mirrored), scale };
}

function ringAt(index: number, row: number, mirrored: boolean, out: THREE.Vector3) {
  const angle = RING[index] ?? 0;
  out.set(axis(Math.sin(angle) * 2.05, row, mirrored), CUBE.y + 0.35, CUBE.z + Math.cos(angle) * 1.45);
  return out;
}

const beamDummy = new THREE.Object3D();
const pedestalBodyLocal = new THREE.Matrix4();
const pedestalGlowLocal = new THREE.Matrix4().makeRotationX(-Math.PI / 2).setPosition(0, 0.08, 0);
const pedestalRingLocal = new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(0, 0.07, 0);
const pedestalGroup = new THREE.Matrix4();
const pedestalOut = new THREE.Matrix4();
const pedestalPos = new THREE.Vector3();
const pedestalQuat = new THREE.Quaternion();
const pedestalScale = new THREE.Vector3();

function writePedestal(mesh: THREE.InstancedMesh, index: number, local: THREE.Matrix4, x: number, scale: number) {
  pedestalPos.set(x, -2.12, 0.6);
  pedestalScale.set(scale, scale, scale);
  pedestalGroup.compose(pedestalPos, pedestalQuat, pedestalScale);
  mesh.setMatrixAt(index, pedestalOut.multiplyMatrices(pedestalGroup, local));
}

function placePedestals(runtime: Runtime, xs: readonly number[], scales: readonly number[]) {
  for (let index = 0; index < 5; index += 1) {
    const x = xs[index] ?? 0;
    const scale = scales[index] ?? 0;
    writePedestal(runtime.pedestals.body, index, pedestalBodyLocal, x, scale);
    writePedestal(runtime.pedestals.glow, index, pedestalGlowLocal, x, scale);
    writePedestal(runtime.pedestals.ring, index, pedestalRingLocal, x, scale);
  }
  runtime.pedestals.body.instanceMatrix.needsUpdate = true;
  runtime.pedestals.glow.instanceMatrix.needsUpdate = true;
  runtime.pedestals.ring.instanceMatrix.needsUpdate = true;
}

function writeBeam(runtime: Runtime, index: number, from: THREE.Vector3, to: THREE.Vector3, amount: number) {
  const hide = () => {
    beamDummy.position.set(0, 0, 0);
    beamDummy.quaternion.identity();
    beamDummy.scale.set(0, 0, 0);
    beamDummy.updateMatrix();
    runtime.beamCore.setMatrixAt(index, beamDummy.matrix);
    runtime.beamGlow.setMatrixAt(index, beamDummy.matrix);
  };
  if (amount <= 0) {
    hide();
    return;
  }
  dir.copy(to).sub(from);
  const length = dir.length();
  if (length < 1e-4) {
    hide();
    return;
  }
  dir.multiplyScalar(1 / length);
  beamDummy.position.copy(from);
  beamDummy.quaternion.setFromUnitVectors(up, dir);
  const span = Math.max(length * amount, 0.001);
  beamDummy.scale.set(0.025, span, 0.025);
  beamDummy.updateMatrix();
  runtime.beamCore.setMatrixAt(index, beamDummy.matrix);
  beamDummy.scale.set(0.08, span, 0.08);
  beamDummy.updateMatrix();
  runtime.beamGlow.setMatrixAt(index, beamDummy.matrix);
}

function commitBeams(runtime: Runtime) {
  runtime.beamCore.instanceMatrix.needsUpdate = true;
  runtime.beamGlow.instanceMatrix.needsUpdate = true;
}

function paintLabel(label: Paint, text: string, color: string, locale: Locale) {
  const context = label.context;
  const width = 512;
  const height = 80;
  context.clearRect(0, 0, width, height);
  const face = locale === "fa" ? fontOf("--font-vazir") : fontOf("--font-jetbrains");
  let size = locale === "fa" ? 32 : 30;
  context.font = `700 ${size}px ${face}`;
  while (context.measureText(text).width > 400 && size > 16) {
    size -= 2;
    context.font = `700 ${size}px ${face}`;
  }
  const pill = Math.min(width - 8, context.measureText(text).width + 72);
  const x0 = (width - pill) / 2;
  context.fillStyle = "rgba(10,13,21,0.88)";
  roundRect(context, x0, 6, pill, 68, 34);
  context.fill();
  context.lineWidth = 2.5;
  context.strokeStyle = color;
  roundRect(context, x0, 6, pill, 68, 34);
  context.stroke();
  context.fillStyle = color;
  context.beginPath();
  context.textBaseline = "alphabetic";
  if (locale === "fa") {
    context.arc(x0 + pill - 28, 40, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.textAlign = "right";
    context.direction = "rtl";
    context.fillText(text, x0 + pill - 44, 50);
  } else {
    context.arc(x0 + 28, 40, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.direction = "ltr";
    context.fillText(text, x0 + 44, 51);
  }
  label.texture.needsUpdate = true;
  label.key = `${locale}|${text}`;
}

function paintTarget(
  target: Paint,
  copy: Dictionary,
  index: number,
  color: string,
  progress: number,
  badge: number,
  locale: Locale,
) {
  const key = `${locale}|${Math.round(progress * 30)}|${badge.toFixed(2)}`;
  if (target.key === key) return;
  const card = copy.arena.targets[index];
  if (!card) return;
  const context = target.context;
  const width = 1024;
  const height = 560;
  const display = locale === "fa" ? fontOf("--font-vazir") : fontOf("--font-space");
  const mono = locale === "fa" ? fontOf("--font-vazir") : fontOf("--font-jetbrains");
  const align = locale === "fa" ? "right" : "left";
  const textX = locale === "fa" ? width - 40 : 40;
  context.clearRect(0, 0, width, height);
  context.save();
  roundRect(context, 4, 4, width - 8, height - 8, 36);
  context.clip();
  context.fillStyle = "#0A0D15";
  context.fillRect(0, 0, width, height);
  const image = target.image;
  if (image && image.complete && image.naturalWidth > 0) {
    const crop = Math.min(image.height, image.width * (300 / 1024));
    context.drawImage(image, 0, 0, image.width, crop, 0, 0, width, 300);
  }
  context.fillStyle = "rgba(5,7,12,0.4)";
  context.fillRect(0, 0, width, 300);
  context.restore();
  context.strokeStyle = color;
  context.lineWidth = 5;
  roundRect(context, 4, 4, width - 8, height - 8, 36);
  context.stroke();
  context.direction = locale === "fa" ? "rtl" : "ltr";
  context.textAlign = align;
  context.textBaseline = "alphabetic";
  context.fillStyle = "#ffffff";
  let size = 64;
  context.font = `700 ${size}px ${display}`;
  while (context.measureText(card.title).width > 900 && size > 34) {
    size -= 4;
    context.font = `700 ${size}px ${display}`;
  }
  context.fillText(card.title, textX, 386);
  context.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(context, 40, 410, width - 80, 16, 8);
  context.fill();
  context.fillStyle = color;
  roundRect(context, 40, 410, Math.max(16, (width - 80) * progress), 16, 8);
  context.fill();
  context.fillStyle = progress >= 1 ? "#3DDC97" : "#8C93A3";
  context.font = `700 28px ${mono}`;
  const state = progress >= 1 ? copy.arena.done : progress > 0 ? copy.arena.building : copy.arena.queued;
  context.fillText(state, textX, 468);
  context.fillStyle = "#F2B544";
  context.font = `600 22px ${mono}`;
  context.fillText(copy.demoBadge, textX, 512);
  if (badge > 0.02) {
    context.save();
    context.translate(locale === "fa" ? 36 : width - 36, 70);
    context.scale(badge, badge);
    context.font = `700 36px ${mono}`;
    const line = card.badge;
    const mark = copy.demoBadge;
    const pill = Math.max(context.measureText(line).width, context.measureText(mark).width) + 52;
    const left = locale === "fa" ? 0 : -pill;
    context.fillStyle = "#F2B544";
    roundRect(context, left, -48, pill, 112, 18);
    context.fill();
    context.fillStyle = "#120d02";
    context.textAlign = locale === "fa" ? "left" : "right";
    context.fillText(line, locale === "fa" ? 26 : -26, 0);
    context.font = `700 22px ${mono}`;
    context.fillText(mark, locale === "fa" ? 26 : -26, 38);
    context.restore();
  }
  target.texture.needsUpdate = true;
  target.key = key;
}

function paintCube(runtime: Runtime) {
  const { copy, locale } = runtime;
  const [front, back, side] = runtime.cubeCanvases;
  if (!front || !back || !side) return;
  if (runtime.cubeKey === locale) return;
  const display = locale === "fa" ? fontOf("--font-vazir") : fontOf("--font-space");
  const mono = locale === "fa" ? fontOf("--font-vazir") : fontOf("--font-jetbrains");
  front.clearRect(0, 0, 512, 512);
  front.fillStyle = "#0B0E16";
  front.fillRect(0, 0, 512, 512);
  front.strokeStyle = "#F2B544";
  front.lineWidth = 12;
  front.strokeRect(6, 6, 500, 500);
  front.textAlign = "center";
  front.textBaseline = "alphabetic";
  front.fillStyle = "#F2B544";
  front.font = `700 30px ${mono}`;
  front.fillText(copy.arena.task, 256, 118);
  front.fillStyle = "#ffffff";
  front.font = `700 64px ${display}`;
  front.fillText(copy.arena.shipLine, 256, 230);
  front.fillText(copy.arena.shipVersion, 256, 310);
  front.fillStyle = "#F2B544";
  roundRect(front, 48, 360, 416, 78, 16);
  front.fill();
  front.fillStyle = "#120d02";
  front.font = `700 24px ${mono}`;
  front.fillText(copy.demoBadge, 256, 408);

  back.clearRect(0, 0, 512, 512);
  const wash = back.createLinearGradient(0, 0, 512, 512);
  wash.addColorStop(0, "#FFD27A");
  wash.addColorStop(1, "#F2B544");
  back.fillStyle = wash;
  back.fillRect(0, 0, 512, 512);
  back.textAlign = "center";
  back.fillStyle = "#120d02";
  back.font = `700 78px ${display}`;
  back.fillText(copy.arena.shipped, 256, 230);
  back.font = `700 110px ${display}`;
  back.fillText("✓", 256, 360);
  back.font = `700 22px ${mono}`;
  back.fillText(copy.demoBadge, 256, 450);

  side.clearRect(0, 0, 256, 256);
  side.fillStyle = "#0B0E16";
  side.fillRect(0, 0, 256, 256);
  side.strokeStyle = "#F2B544";
  side.lineWidth = 8;
  side.strokeRect(4, 4, 248, 248);
  side.fillStyle = "rgba(242,181,68,0.85)";
  side.font = `700 28px ${mono}`;
  side.textAlign = "center";
  side.fillText(copy.arena.shipVersion, 128, 132);
  side.font = `700 16px ${mono}`;
  side.fillText(copy.demoBadge, 128, 176);
  runtime.cubeTextures.forEach((texture) => {
    texture.needsUpdate = true;
  });
  runtime.cubeKey = locale;
}

function syncLabels(runtime: Runtime) {
  runtime.labels.forEach((label, index) => {
    const text = runtime.copy.arena.roles[index] ?? "";
    const key = `${runtime.locale}|${text}`;
    if (label.key === key) return;
    paintLabel(label, text, ARENA_ROLES[index]?.color ?? "#ffffff", runtime.locale);
  });
}

function placeLabel(label: Paint, x: number, z: number, opacity: number, row: number, camera: THREE.Camera) {
  label.mesh.position.set(x, -1.7, z + 0.75);
  label.mesh.quaternion.copy(camera.quaternion);
  const width = Math.min(1.6, 1.85 * row * 0.92);
  label.mesh.scale.set(width / 1.6, 1, 1);
  label.material.opacity = opacity;
  label.mesh.visible = opacity > 0.01;
}

function burst(runtime: Runtime, amount: number, calm: boolean, camera: THREE.Camera) {
  const show = !calm && amount > 0 && amount < 1;
  runtime.sparks.visible = show;
  if (!show) return;
  runtime.sparks.position.copy(CUBE);
  runtime.sparks.quaternion.copy(camera.quaternion);
  runtime.sparkMaterial.opacity = (1 - amount) * 0.9;
  for (let i = 0; i < 36; i += 1) {
    const angle = (i / 36) * Math.PI * 2;
    const radius = 0.3 + amount * (0.7 + (i % 6) * 0.26);
    dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, 0);
    dummy.rotation.set(0, 0, angle);
    dummy.scale.setScalar((1 - amount) * (0.55 + (i % 3) * 0.28));
    dummy.updateMatrix();
    runtime.sparks.setMatrixAt(i, dummy.matrix);
  }
  runtime.sparks.instanceMatrix.needsUpdate = true;
}

function layoutReference(
  runtime: Runtime,
  t: number,
  idle: number,
  row: number,
  mirrored: boolean,
  camera: THREE.Camera,
  root: THREE.Group,
) {
  const turn = eio(seg(t, 21.15, 21.4));
  const raiseC = eio(seg(t, 21.8, 22));
  const flip = eio(seg(t, 22.55, 22.85));
  const celeb = seg(t, 22.85, 23.5);
  syncLabels(runtime);

  runtime.robots.forEach((robot, index) => {
    const born = 18.5 + index * 0.07;
    const visible = t > born;
    robot.root.visible = visible;
    if (!visible) return;
    const homeX = axis(HOME_X[index] ?? 0, row, mirrored);
    const startX = axis((index - 2) * 0.25, row, mirrored);
    const glide = eio(seg(t, 19 + index * 0.04, 19.55 + index * 0.04));
    let x = lerp(startX, homeX, glide);
    let y = lerp(0.3, -0.55, glide);
    let z = 0.6;
    const leap = seg(t, 21.3 + index * 0.05, 21.85 + index * 0.05);
    if (leap > 0) {
      ringAt(index, row, mirrored, ringScratch);
      const k = eio(leap);
      x = lerp(homeX, ringScratch.x, k);
      y = lerp(-0.55, ringScratch.y, k) + Math.sin(Math.PI * leap) * 1.3;
      z = lerp(0.6, ringScratch.z, k);
    }
    robot.root.position.set(x, y, z);
    robot.root.scale.setScalar(Math.max(0.001, spring(seg(t, born, born + 0.55))));
    const fire = seg(t, 19.6 + index * 0.16, 20 + index * 0.16);
    const aim = ss(seg(t, 19.5 + index * 0.16, 19.75 + index * 0.16)) * (1 - turn);
    const card = cardPlacement(index, row, mirrored);
    const targetX = card.x;
    let ry = Math.sin(t * 0.8 + index) * 0.2;
    ry = lerp(ry, Math.atan2(targetX - x, 4) * 0.6, aim);
    ry = lerp(ry, Math.atan2(-x, CUBE.z - z), turn);
    robot.root.rotation.y = ry;
    const raise = Math.max(aim * (fire > 0 && t < 20.9 ? 1 : 0), raiseC * (1 - celeb * 0.2));
    const jump = celeb > 0 ? Math.abs(Math.sin(celeb * Math.PI * 2.4 + index * 0.6)) * 0.38 * (1 - celeb * 0.3) : 0;
    poseRobot(robot, idle, {
      phase: index * 1.3,
      raise,
      forward: turn > 0 ? 0.4 : 0,
      jump,
      happy: t > 22.85,
      wave: celeb > 0.05 && index % 2 === 0,
      floor: -2.08,
      look: aim * 0.2,
      nod: aim * 0.15,
      calm: false,
    });
    const label = runtime.labels[index];
    if (label) {
      const fade = Math.min(1, seg(t, 19.3, 19.6) * (1 - seg(t, 21.2, 21.4)) + seg(t, 22.95, 23.2));
      placeLabel(label, x, z, fade, row, camera);
    }
  });

  placePedestals(
    runtime,
    HOME_X.map((home) => axis(home, row, mirrored)),
    HOME_X.map((_, index) => {
      if (!(t > 18.8)) return 0;
      return Math.max(0.001, eo5(seg(t, 18.8 + index * 0.06, 19.3 + index * 0.06)));
    }),
  );

  runtime.targets.forEach((target, index) => {
    const appear = eo5(seg(t, 18.9 + index * 0.07, 19.5 + index * 0.07));
    const card = cardPlacement(index, row, mirrored);
    target.mesh.position.set(card.x, lerp(4.78, 1.78, appear), -2.6);
    target.mesh.scale.setScalar(Math.max(0.001, card.scale));
    target.material.opacity = appear;
    target.mesh.visible = appear > 0.01;
    const progress = eio(seg(t, 19.75 + index * 0.16, 20.35 + index * 0.16));
    const badgeIn = seg(t, 20.15 + index * 0.16, 20.45 + index * 0.16);
    const badge = badgeIn > 0 ? eback(badgeIn) : 0;
    paintTarget(target, runtime.copy, index, ARENA_TARGETS[index]?.color ?? "#fff", progress, badge, runtime.locale);
  });

  const drop = seg(t, 20.7, 21.15);
  runtime.cube.visible = t > 20.7;
  runtime.cube.position.set(
    0,
    CUBE.y + lerp(6, 0, eo5(drop)) + (celeb > 0 ? Math.abs(Math.sin(celeb * Math.PI * 2)) * 0.2 : 0) + Math.sin(t * 2) * 0.04,
    CUBE.z,
  );
  runtime.cube.rotation.set(
    0,
    lerp(-0.35, 0, eo(drop)) + flip * Math.PI + (t > 22.85 ? Math.sin(t * 2) * 0.08 : 0),
    lerp(0.5, 0, eo5(drop)),
  );
  const pulse = 1 + 0.08 * Math.sin(Math.PI * seg(t, 22, 22.55)) * Math.sin(t * 30) * 0.5;
  const flipPulse = flip > 0 && flip < 1 ? 0.1 * Math.sin(Math.PI * flip) : 0;
  runtime.cube.scale.setScalar(pulse + flipPulse);
  runtime.cubeGlow.position.set(0, CUBE.y, CUBE.z - 0.7);
  runtime.cubeGlow.quaternion.copy(camera.quaternion);
  runtime.cubeGlowMaterial.opacity = seg(t, 21, 21.3) * 0.35 + seg(t, 22, 22.55) * 0.4 + (t > 22.6 ? 0.25 : 0);
  runtime.bulb.intensity = seg(t, 21, 21.3) * 6 + seg(t, 22, 22.6) * 16 * (1 - celeb * 0.5);
  if (runtime.cubeKey !== runtime.locale) paintCube(runtime);

  root.updateMatrixWorld(true);
  runtime.robots.forEach((robot, index) => {
    const fire = seg(t, 19.6 + index * 0.16, 20 + index * 0.16);
    const on = t > 19.6 + index * 0.16 && t < 20.95 && robot.root.visible;
    const palm = robot.arms[1]?.hand;
    if (!on || !palm) {
      writeBeam(runtime, index, hand, hand, 0);
      return;
    }
    palm.getWorldPosition(hand);
    root.worldToLocal(hand);
    aimScratch.set(cardPlacement(index, row, mirrored).x, 1.28, -2.58);
    writeBeam(runtime, index, hand, aimScratch, eo5(fire));
  });
  runtime.robots.forEach((robot, index) => {
    for (let side = 0; side < 2; side += 1) {
      const slot = 5 + index * 2 + side;
      const on = t > 22 && t < 22.75 && robot.root.visible;
      const palm = robot.arms[side]?.hand;
      if (!on || !palm) {
        writeBeam(runtime, slot, hand, hand, 0);
        continue;
      }
      palm.getWorldPosition(hand);
      root.worldToLocal(hand);
      writeBeam(runtime, slot, hand, CUBE, eo5(seg(t, 22 + index * 0.03, 22.2 + index * 0.03)));
    }
  });
  commitBeams(runtime);

  const shock = seg(t, 22.82, 23.4);
  runtime.shock.position.set(0, CUBE.y - 0.55, CUBE.z);
  runtime.shock.scale.setScalar(0.6 + shock * 6);
  runtime.shockMaterial.opacity = shock > 0 ? 1 - shock : 0;
  runtime.shock.visible = shock > 0 && shock < 1;
  runtime.shockFill.position.copy(runtime.shock.position);
  runtime.shockFill.scale.setScalar(1 + shock * 12);
  runtime.shockFillMaterial.opacity = shock > 0 ? (1 - shock) * 0.6 : 0;
  runtime.shockFill.visible = runtime.shock.visible;
  burst(runtime, shock, false, camera);
}

function layoutCalm(
  runtime: Runtime,
  stage: "arrival" | "built" | "shipped",
  internal: number,
  row: number,
  mirrored: boolean,
  idle: number,
  camera: THREE.Camera,
) {
  const arrived = internal >= 18.5 || stage === "shipped";
  const shipped = stage === "shipped";
  syncLabels(runtime);
  runtime.robots.forEach((robot, index) => {
    robot.root.visible = arrived;
    if (!arrived) return;
    if (shipped) ringAt(index, row, mirrored, ringScratch);
    else ringScratch.set(axis(HOME_X[index] ?? 0, row, mirrored), -0.55, 0.6);
    robot.root.position.copy(ringScratch);
    robot.root.scale.setScalar(1);
    robot.root.rotation.y = shipped ? Math.atan2(-ringScratch.x, CUBE.z - ringScratch.z) : Math.sin(index) * 0.12;
    poseRobot(robot, idle, {
      phase: index * 1.3,
      raise: shipped ? 0.8 : 0,
      forward: shipped ? 0.4 : 0,
      jump: 0,
      happy: shipped,
      wave: shipped && index % 2 === 0,
      floor: -2.08,
      look: 0,
      nod: 0,
      calm: idle === 0,
    });
    const label = runtime.labels[index];
    if (label) placeLabel(label, ringScratch.x, ringScratch.z, 1, row, camera);
  });
  placePedestals(
    runtime,
    HOME_X.map((home) => axis(home, row, mirrored)),
    HOME_X.map(() => (arrived ? 1 : 0)),
  );
  const progress = stage === "arrival" ? 0 : 1;
  const badge = stage === "arrival" ? 0 : 1;
  runtime.targets.forEach((target, index) => {
    target.mesh.visible = arrived;
    target.material.opacity = arrived ? 1 : 0;
    const card = cardPlacement(index, row, mirrored);
    target.mesh.position.set(card.x, 1.78, -2.6);
    target.mesh.scale.setScalar(card.scale);
    paintTarget(target, runtime.copy, index, ARENA_TARGETS[index]?.color ?? "#fff", progress, badge, runtime.locale);
  });
  runtime.cube.visible = shipped;
  runtime.cube.position.set(0, CUBE.y + (idle === 0 ? 0 : Math.sin(idle * 2) * 0.04), CUBE.z);
  runtime.cube.rotation.set(0, Math.PI + (idle === 0 ? 0 : Math.sin(idle * 2) * 0.08), 0);
  runtime.cube.scale.setScalar(1);
  runtime.cubeGlow.position.set(0, CUBE.y, CUBE.z - 0.7);
  runtime.cubeGlow.quaternion.copy(camera.quaternion);
  runtime.cubeGlowMaterial.opacity = shipped ? 0.35 : 0;
  runtime.bulb.intensity = shipped ? 8 : 0;
  for (let index = 0; index < 15; index += 1) writeBeam(runtime, index, hand, hand, 0);
  commitBeams(runtime);
  runtime.shock.visible = false;
  runtime.shockFill.visible = false;
  runtime.sparks.visible = false;
  if (runtime.cubeKey !== runtime.locale) paintCube(runtime);
}

export function Act4Arena() {
  const root = useRef<THREE.Group>(null);
  const runtime = useRef<Runtime | null>(null);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const parent = root.current;
    if (!parent) return;
    let cancelled = false;
    parent.position.copy(WORLD.arena);
    const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
    const kit = createRobotKit();

    const mount = () => {
      if (cancelled || !root.current) return;
      const locale: Locale = document.documentElement.lang === "fa" ? "fa" : "en";
      const copy = getDictionary(locale);
      const robots = ARENA_ROLES.map((role) => {
        const rig = kit.make(role.color, role.prop, `robot-${role.id}`);
        parent.add(rig.root);
        rig.root.visible = false;
        return rig;
      });

      const labels: Paint[] = ARENA_ROLES.map(() => {
        const painted = canvasPaint(512, 80);
        painted.texture.premultiplyAlpha = false;
        painted.material.transparent = true;
        painted.material.premultipliedAlpha = false;
        painted.material.depthWrite = false;
        painted.material.alphaTest = 0.04;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.25), painted.material);
        mesh.visible = false;
        mesh.renderOrder = 3;
        parent.add(mesh);
        disposables.push(mesh.geometry, painted.texture, painted.material);
        return { mesh, ...painted, key: "" };
      });

      const pedestalGeo = new THREE.CylinderGeometry(0.62, 0.7, 0.12, 20);
      const pedestalRingGeo = new THREE.TorusGeometry(0.64, 0.018, 6, 28);
      const pedestalGlowGeo = new THREE.PlaneGeometry(2.2, 2.2);
      const pedestalBody = new THREE.MeshPhysicalMaterial({
        color: "#0C0E14",
        metalness: 0.55,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      });
      const pedestalGlowMap = radialTexture("#ffffff");
      const pedestalGlowMaterial = additive("#ffffff", 0.35, pedestalGlowMap);
      const pedestalRingMaterial = additive("#ffffff", 0.9);
      disposables.push(
        pedestalGeo,
        pedestalRingGeo,
        pedestalGlowGeo,
        pedestalBody,
        pedestalGlowMap,
        pedestalGlowMaterial,
        pedestalRingMaterial,
      );
      const pedestalBodyMesh = new THREE.InstancedMesh(pedestalGeo, pedestalBody, 5);
      const pedestalGlowMesh = new THREE.InstancedMesh(pedestalGlowGeo, pedestalGlowMaterial, 5);
      const pedestalRingMesh = new THREE.InstancedMesh(pedestalRingGeo, pedestalRingMaterial, 5);
      for (const surface of [pedestalBodyMesh, pedestalGlowMesh, pedestalRingMesh]) {
        surface.frustumCulled = false;
        surface.count = 5;
        parent.add(surface);
      }
      ARENA_ROLES.forEach((role, index) => {
        const tint = new THREE.Color(role.color);
        pedestalGlowMesh.setColorAt(index, tint);
        pedestalRingMesh.setColorAt(index, tint);
      });
      if (pedestalGlowMesh.instanceColor) pedestalGlowMesh.instanceColor.needsUpdate = true;
      if (pedestalRingMesh.instanceColor) pedestalRingMesh.instanceColor.needsUpdate = true;
      const pedestals: Pedestals = {
        body: pedestalBodyMesh,
        ring: pedestalRingMesh,
        glow: pedestalGlowMesh,
      };

      const targets: Paint[] = ARENA_TARGETS.map(() => {
        const painted = canvasPaint(1024, 560);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.26), painted.material);
        mesh.visible = false;
        parent.add(mesh);
        disposables.push(mesh.geometry, painted.texture, painted.material);
        return { mesh, ...painted, key: "", image: null };
      });

      const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
      beamGeo.translate(0, 0.5, 0);
      const beamCoreMaterial = additive("#ffffff", 0.95);
      const beamGlowMaterial = additive("#ffffff", 0.28);
      disposables.push(beamGeo, beamCoreMaterial, beamGlowMaterial);
      const beamCore = new THREE.InstancedMesh(beamGeo, beamCoreMaterial, 15);
      const beamGlow = new THREE.InstancedMesh(beamGeo, beamGlowMaterial, 15);
      beamCore.frustumCulled = false;
      beamGlow.frustumCulled = false;
      const amberBeam = new THREE.Color("#FFD27A");
      const emeraldBeam = new THREE.Color("#3DDC97");
      for (let index = 0; index < 15; index += 1) {
        const tint =
          index < 5
            ? new THREE.Color(ARENA_ROLES[index]?.color ?? "#ffffff")
            : (index - 5) % 2
              ? emeraldBeam
              : amberBeam;
        beamCore.setColorAt(index, tint);
        beamGlow.setColorAt(index, tint);
        beamDummy.position.set(0, 0, 0);
        beamDummy.quaternion.identity();
        beamDummy.scale.set(0, 0, 0);
        beamDummy.updateMatrix();
        beamCore.setMatrixAt(index, beamDummy.matrix);
        beamGlow.setMatrixAt(index, beamDummy.matrix);
      }
      if (beamCore.instanceColor) beamCore.instanceColor.needsUpdate = true;
      if (beamGlow.instanceColor) beamGlow.instanceColor.needsUpdate = true;
      beamCore.instanceMatrix.needsUpdate = true;
      beamGlow.instanceMatrix.needsUpdate = true;
      parent.add(beamCore, beamGlow);

      const cubeCanvases: CanvasRenderingContext2D[] = [];
      const cubeTextures: THREE.CanvasTexture[] = [];
      const cubeMaterials = [512, 512, 256].map((size) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas");
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        const material = basic(texture);
        cubeCanvases.push(context);
        cubeTextures.push(texture);
        disposables.push(texture, material);
        return material;
      });
      const [frontMaterial, backMaterial, sideMaterial] = cubeMaterials;
      const cube = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), [
        sideMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
        frontMaterial,
        backMaterial,
      ]);
      cube.visible = false;
      parent.add(cube);
      disposables.push(cube.geometry);

      const cubeGlowMaterial = additive("#ffffff", 0, radialTexture("#F59E0B"));
      if (cubeGlowMaterial.map) disposables.push(cubeGlowMaterial.map);
      disposables.push(cubeGlowMaterial);
      const cubeGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), cubeGlowMaterial);
      parent.add(cubeGlow);
      disposables.push(cubeGlow.geometry);

      const shockMaterial = additive("#FFD27A", 0);
      const shock = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 8, 64), shockMaterial);
      shock.rotation.x = Math.PI / 2;
      shock.visible = false;
      parent.add(shock);
      const shockFillMaterial = additive("#ffffff", 0, radialTexture("#FFD27A"));
      const shockFill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shockFillMaterial);
      shockFill.rotation.x = -Math.PI / 2;
      shockFill.visible = false;
      parent.add(shockFill);
      disposables.push(shock.geometry, shockMaterial, shockFill.geometry, shockFillMaterial);
      if (shockFillMaterial.map) disposables.push(shockFillMaterial.map);

      const bulb = new THREE.PointLight("#FFB347", 0, 12, 2);
      bulb.position.set(0, 0, 2.9);
      parent.add(bulb);

      const sparkMaterial = additive("#FFD27A", 0.85);
      const sparkGeo = new THREE.PlaneGeometry(0.14, 0.14);
      const sparks = new THREE.InstancedMesh(sparkGeo, sparkMaterial, 36);
      sparks.frustumCulled = false;
      sparks.visible = false;
      parent.add(sparks);
      disposables.push(sparkGeo, sparkMaterial);

      const live: Runtime = {
        robots,
        labels,
        pedestals,
        targets,
        beamCore,
        beamGlow,
        cube,
        cubeGlow,
        cubeGlowMaterial,
        cubeCanvases,
        cubeTextures,
        cubeKey: "",
        shock,
        shockMaterial,
        shockFill,
        shockFillMaterial,
        bulb,
        sparks,
        sparkMaterial,
        locale,
        copy,
      };
      runtime.current = live;
      paintCube(live);
      gl.domElement.dataset.act4Robots = "5";

      ARENA_TARGETS.forEach((spec, index) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          const record = runtime.current?.targets[index];
          if (!record) return;
          record.image = image;
          record.key = "";
        };
        image.src = spec.texture;
      });
    };

    void document.fonts.ready.then(mount);

    return () => {
      cancelled = true;
      runtime.current = null;
      parent.clear();
      kit.dispose();
      disposables.forEach((item) => item.dispose());
      delete gl.domElement.dataset.act4Robots;
      delete gl.domElement.dataset.act4Phase;
      delete gl.domElement.dataset.act4Motion;
    };
  }, [gl]);

  useFrame(({ camera }) => {
    const node = root.current;
    const live = runtime.current;
    if (!node || !live) return;
    const { internal, presentation } = readClock(scrollProgress.current);
    const calm = scrollProgress.reducedMotion;
    const now = performance.now();
    const sample = sampleArenaTime(internal, now, calm);
    const visible = internal > ARENA_IN && internal < ARENA_OUT;
    node.visible = visible;
    const phase = !visible ? "hidden" : sample.mode === "hold" ? "shipped" : arenaHud(sample.t).phase;
    const motion = calm ? "calm" : "full";
    const canvas = gl.domElement;
    if (canvas.dataset.act4Phase !== phase) canvas.dataset.act4Phase = phase;
    if (canvas.dataset.act4Motion !== motion) canvas.dataset.act4Motion = motion;
    if (!visible) return;

    const locale: Locale = document.documentElement.lang === "fa" ? "fa" : "en";
    if (live.locale !== locale) {
      live.locale = locale;
      live.copy = getDictionary(locale);
      live.labels.forEach((label) => {
        label.key = "";
      });
      live.targets.forEach((target) => {
        target.key = "";
      });
      live.cubeKey = "";
    }
    const perspective = camera instanceof THREE.PerspectiveCamera ? camera : null;
    const fov = perspective ? perspective.fov : 40;
    const framing = arenaFraming(perspective ? perspective.aspect : 1, fov, internal);
    const mirrored = document.documentElement.dir === "rtl";
    const idle = calm ? 0 : sample.mode === "scroll" ? presentation : sample.mode === "play" ? 34.2 + ((sample.t - 18.1) * 9.8) / 5.4 : now / 1000;

    if (sample.mode === "hold" || calm) {
      const stage = sample.mode === "hold" || internal >= 20.7 ? "shipped" : internal >= 19.6 ? "built" : "arrival";
      layoutCalm(live, stage, internal, framing.row, mirrored, idle, camera);
      return;
    }
    layoutReference(live, sample.t, idle, framing.row, mirrored, camera, node);
  });

  return <group ref={root} name="act-4-arena" visible={false} />;
}
