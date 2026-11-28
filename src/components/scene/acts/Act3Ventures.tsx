"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { VENTURE_TEXTURES } from "@/data/ventureTextures";
import { duration } from "@/lib/motion";
import { scrollProgress } from "@/lib/scrollProgress";
import { watchVentureTextures } from "@/lib/ventureTextureLoad";
import {
  STAGE_ACCENTS,
  readClock,
  stageWorld,
  venturePresence,
  ventureScroll,
  ventureWindow,
} from "../cinema";

/**
 * Visible window on the 1024×2304 plate. The source plates were 1600×3600.
 * Both are 4:9, so (1024 / 1.6) / 2304 equals (1600 / 1.6) / 3600 and the crop stays put.
 */
const UI_REPEAT_Y = 1024 / 1.6 / 2304;
const PLATE_ANISOTROPY = 4;

const CHIP_AT: ReadonlyArray<readonly [number, number, number]> = [
  [2.05, 1.72, 0.82],
  [2.15, -1.68, 0.96],
  [1.9, 0.02, 1.08],
];

const LIVE = [
  {
    texture: VENTURE_TEXTURES.mikham.src,
    color: VENTURE_TEXTURES.mikham.color,
    chips: [
      ["400K+", "BUSINESSES"],
      ["MIARA", "ASSISTANT"],
      ["13 · 5", "CATEGORIES · SERVICES"],
    ],
  },
  {
    texture: VENTURE_TEXTURES["battery-store"].src,
    color: VENTURE_TEXTURES["battery-store"].color,
    chips: [
      ["201", "PULL REQUESTS"],
      ["v0.2.0", "NEXT.JS 15 · NESTJS"],
    ],
  },
  {
    texture: VENTURE_TEXTURES["trader-bot"].src,
    color: VENTURE_TEXTURES["trader-bot"].color,
    chips: [
      ["886/886", "CI TESTS"],
      ["LIVE: OFF", "DISARMED BY DEFAULT"],
      ["~50K LOC", "PYTHON"],
    ],
  },
  {
    texture: VENTURE_TEXTURES.honarmarket.src,
    color: VENTURE_TEXTURES.honarmarket.color,
    chips: [
      ["1,450+", "MOLD DESIGNS"],
      ["RESIN", "& CANDLE SUPPLIES"],
    ],
  },
  {
    texture: VENTURE_TEXTURES["yadaki-yar"].src,
    color: VENTURE_TEXTURES["yadaki-yar"].color,
    chips: [
      ["v0.7.0", "FASTAPI + POSTGRESQL"],
      ["80", "PULL REQUESTS"],
      ["WIN · ANDROID", "SHARED BACKEND"],
    ],
  },
  {
    texture: VENTURE_TEXTURES["sandoq-yar"].src,
    color: VENTURE_TEXTURES["sandoq-yar"].color,
    chips: [
      ["OFFLINE", "BARCODE POS"],
      ["PWA", "ZXING-WASM · INDEXEDDB"],
    ],
  },
] as const;

type Disposable = { dispose: () => void };

type CellRecord = {
  group: THREE.Group;
  baseX: number;
  baseY: number;
  core: THREE.MeshBasicMaterial;
};

type StageRecord = {
  index: number;
  group: THREE.Group;
  anchor: THREE.Vector3;
  halo: THREE.MeshBasicMaterial;
  keyLight: THREE.PointLight;
  accentLights: THREE.PointLight[];
  screen: THREE.Texture | null;
  placeholder: THREE.Mesh | null;
  fadeMaterial: THREE.MeshBasicMaterial | null;
  reflectionMaterial: THREE.MeshBasicMaterial | null;
  screenFade: number;
  sheen: THREE.Texture | null;
  chips: THREE.Mesh[];
  cells: CellRecord[];
  chart: THREE.LineBasicMaterial | null;
  nodes: THREE.MeshBasicMaterial[];
};

const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const eback = (x: number) => {
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
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

function fontStack(variable: string) {
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

function sheenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (!context) return texture;
  const gradient = context.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.12)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 256);
  texture.needsUpdate = true;
  return texture;
}

function chipTexture(title: string, label: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 200;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (!context) return texture;
  const display = fontStack("--font-space");
  const mono = fontStack("--font-jetbrains");
  roundRect(context, 4, 4, 712, 192, 30);
  context.fillStyle = "rgba(10,13,21,0.94)";
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = color;
  roundRect(context, 4, 4, 712, 192, 30);
  context.stroke();
  context.fillStyle = color;
  context.beginPath();
  context.arc(46, 100, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  let size = 64;
  context.font = `600 ${size}px ${display}`;
  while (context.measureText(title).width > 560 && size > 36) {
    size -= 4;
    context.font = `600 ${size}px ${display}`;
  }
  context.fillText(title, 78, 108);
  context.fillStyle = "#A9B0BE";
  context.font = `500 22px ${mono}`;
  context.fillText(label, 80, 156);
  texture.needsUpdate = true;
  return texture;
}

function prepareUiTexture(texture: THREE.Texture, anisotropy: number, mipmaps: boolean) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(PLATE_ANISOTROPY, Math.max(1, anisotropy));
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = mipmaps;
  texture.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  texture.repeat.set(1, UI_REPEAT_Y);
  texture.offset.y = 1 - UI_REPEAT_Y;
  texture.needsUpdate = true;
  return texture;
}

function settlePlate(stage: StageRecord) {
  const material = stage.fadeMaterial;
  if (!material) return;
  material.opacity = 1;
  material.transparent = false;
  material.depthWrite = true;
  material.needsUpdate = true;
  if (stage.reflectionMaterial) stage.reflectionMaterial.opacity = 0.1;
  if (stage.placeholder) stage.placeholder.visible = false;
  stage.screenFade = 1;
}

function addChart(group: THREE.Group, track: <T extends Disposable>(item: T) => T) {
  const values = [0.2, 0.46, 0.32, 0.68, 0.4, 0.84, 0.56, 0.74];
  const positions: number[] = [];
  const span = 1.15;
  const left = -span / 2;
  for (let row = 0; row < 4; row += 1) {
    const y = -0.95 + row * 0.62;
    positions.push(left, y, 0, left + span, y, 0);
  }
  for (let col = 0; col < 4; col += 1) {
    const x = left + (span * col) / 3;
    positions.push(x, -0.95, 0, x, 0.91, 0);
  }
  values.forEach((value, index) => {
    if (index === values.length - 1) return;
    const x0 = left + (span * index) / (values.length - 1);
    const x1 = left + (span * (index + 1)) / (values.length - 1);
    const next = values[index + 1] ?? value;
    positions.push(x0, (value - 0.5) * 1.7, 0.02, x1, (next - 0.5) * 1.7, 0.02);
  });
  const geometry = track(new THREE.BufferGeometry());
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = track(
    new THREE.LineBasicMaterial({
      color: "#38BDF8",
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  const lines = new THREE.LineSegments(geometry, material);
  const board = new THREE.Group();
  board.add(lines);
  const nodes: THREE.MeshBasicMaterial[] = [];
  values.forEach((value, index) => {
    const nodeMat = track(
      new THREE.MeshBasicMaterial({
        color: "#10B981",
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
        depthWrite: false,
      }),
    );
    const node = new THREE.Mesh(track(new THREE.SphereGeometry(0.032, 12, 8)), nodeMat);
    const x = left + (span * index) / (values.length - 1);
    node.position.set(x, (value - 0.5) * 1.7, 0.04);
    board.add(node);
    nodes.push(nodeMat);
  });
  board.position.set(0, 2.18, 0.7);
  board.scale.set(1.55, 0.22, 1);
  group.add(board);
  return { chart: material, nodes };
}

function addCells(group: THREE.Group, body: THREE.Material, track: <T extends Disposable>(item: T) => T) {
  const cells: CellRecord[] = [];
  [-1.35, -0.5, 0.35].forEach((x, index) => {
    const cell = new THREE.Group();
    cell.add(new THREE.Mesh(track(new RoundedBoxGeometry(0.22, 0.46, 0.09, 2, 0.03)), body));
    const core = track(
      new THREE.MeshBasicMaterial({
        color: "#10B981",
        transparent: true,
        opacity: 0.82,
        toneMapped: false,
      }),
    );
    const stripe = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 0.28, 0.014)), core);
    stripe.position.z = 0.048;
    cell.add(stripe);
    const cap = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.08, 0.04, 0.05)),
      track(new THREE.MeshBasicMaterial({ color: "#F59E0B", toneMapped: false })),
    );
    cap.position.y = 0.25;
    cell.add(cap);
    cell.position.set(x, 1.48, 0.78);
    group.add(cell);
    cells.push({ group: cell, baseX: x, baseY: 1.48, core });
    cell.rotation.z = index === 1 ? 0 : index === 0 ? -0.06 : 0.06;
  });
  return cells;
}

function buildStage(
  index: number,
  body: THREE.Material,
  track: <T extends Disposable>(item: T) => T,
): StageRecord {
  const accent = STAGE_ACCENTS[index] ?? STAGE_ACCENTS[0];
  const group = new THREE.Group();
  group.name = index < LIVE.length ? `venture-${index + 1}` : `venture-placeholder-${index + 1}`;
  const anchor = stageWorld(index);
  group.position.copy(anchor);

  const haloMap = track(radialTexture(accent));
  const halo = track(
    new THREE.MeshBasicMaterial({
      color: "#ffffff",
      map: haloMap,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),
  );
  const haloMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(18, 11)), halo);
  haloMesh.position.set(0, 0.3, -1.6);
  group.add(haloMesh);

  group.add(new THREE.Mesh(track(new RoundedBoxGeometry(8.1, 5.2, 0.34, 4, 0.12)), body));
  const edge = track(
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),
  );
  const edgeMesh = new THREE.Mesh(track(new RoundedBoxGeometry(8.22, 5.32, 0.1, 4, 0.14)), edge);
  edgeMesh.position.z = -0.08;
  group.add(edgeMesh);

  const bezel = new THREE.Mesh(
    track(new THREE.PlaneGeometry(7.74, 4.86)),
    track(new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false, fog: false })),
  );
  bezel.position.z = 0.18;
  group.add(bezel);

  const live = LIVE[index];
  const screenMaterial = track(
    new THREE.MeshBasicMaterial({
      color: live?.color ?? "#05070c",
      toneMapped: false,
      fog: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2,
    }),
  );
  const screenMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7.62, 4.76)), screenMaterial);
  screenMesh.position.z = 0.19;
  screenMesh.name = live ? `ui-${live.texture}` : "ui-placeholder";
  group.add(screenMesh);

  let sheen: THREE.Texture | null = null;
  if (live) {
    sheen = track(sheenTexture());
    const sheenMesh = new THREE.Mesh(
      track(new THREE.PlaneGeometry(7.62, 4.76)),
      track(
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          map: sheen,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          toneMapped: false,
          fog: false,
          blending: THREE.AdditiveBlending,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -4,
        }),
      ),
    );
    sheenMesh.position.z = 0.2;
    group.add(sheenMesh);
  }

  const chips = live
    ? live.chips.map((chip) => {
        const map = track(chipTexture(chip[0], chip[1], accent));
        const mesh = new THREE.Mesh(
          track(new THREE.PlaneGeometry(2.45, 0.66)),
          track(
            new THREE.MeshBasicMaterial({
              map,
              transparent: true,
              depthWrite: false,
              toneMapped: false,
              fog: false,
            }),
          ),
        );
        mesh.scale.setScalar(0.001);
        group.add(mesh);
        return mesh;
      })
    : [];

  const keyLight = new THREE.PointLight(accent, 0, 18, 2);
  keyLight.position.set(0, 3, 4);
  group.add(keyLight);

  const accentLights: THREE.PointLight[] = [];
  if (index === 1) {
    const emerald = new THREE.PointLight("#10B981", 0, 12, 2);
    emerald.position.set(-3.6, 1.15, 2.2);
    const amber = new THREE.PointLight("#F59E0B", 0, 9, 2);
    amber.position.set(-4.5, -0.35, 1.5);
    group.add(emerald, amber);
    accentLights.push(emerald, amber);
  }
  if (index === 2) {
    const cyan = new THREE.PointLight("#38BDF8", 0, 12, 2);
    cyan.position.set(-3.8, 0.8, 2.1);
    group.add(cyan);
    accentLights.push(cyan);
  }
  if (index === 3) {
    const amber = new THREE.PointLight("#F59E0B", 0, 11, 2);
    amber.position.set(-3.5, 0.9, 2.3);
    group.add(amber);
    accentLights.push(amber);
  }

  const cells = index === 1 ? addCells(group, body, track) : [];
  const chartBits = index === 2 ? addChart(group, track) : { chart: null, nodes: [] };

  return {
    index,
    group,
    anchor,
    halo,
    keyLight,
    accentLights,
    screen: null,
    placeholder: live ? screenMesh : null,
    fadeMaterial: null,
    reflectionMaterial: null,
    screenFade: 1,
    sheen,
    chips,
    cells,
    chart: chartBits.chart,
    nodes: chartBits.nodes,
  };
}

export function Act3Ventures() {
  const root = useRef<THREE.Group>(null);
  const stages = useRef<StageRecord[]>([]);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const parent = root.current;
    if (!parent) return;
    let cancelled = false;
    let stopTextures = () => {};
    const disposables: Disposable[] = [];
    const track = <T extends Disposable>(item: T) => {
      disposables.push(item);
      return item;
    };
    const body = track(
      new THREE.MeshPhysicalMaterial({
        color: "#0C0E14",
        metalness: 0.55,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
    );

    const mount = async () => {
      await document.fonts.ready;
      if (cancelled || !root.current) return;
      const built = [0, 1, 2, 3, 4, 5].map((index) => buildStage(index, body, track));
      built.forEach((stage) => parent.add(stage.group));
      stages.current = built;
      const loader = new THREE.TextureLoader();
      const anisotropy = Math.min(PLATE_ANISOTROPY, gl.capabilities.getMaxAnisotropy());
      const mipmaps = gl.capabilities.isWebGL2;
      let requested = false;
      const loadTextures = () => {
        if (cancelled || requested) return;
        requested = true;
        built.forEach((stage) => {
          const spec = LIVE[stage.index];
          if (!spec) return;
          loader.load(
            spec.texture,
            (texture) => {
              if (cancelled) {
                texture.dispose();
                return;
              }
              prepareUiTexture(texture, anisotropy, mipmaps);
              gl.initTexture(texture);
              track(texture);
              stage.screen = texture;
              const fadeMaterial = track(
                new THREE.MeshBasicMaterial({
                  map: texture,
                  color: "#ffffff",
                  transparent: true,
                  opacity: 0,
                  toneMapped: false,
                  fog: false,
                  depthWrite: false,
                  polygonOffset: true,
                  polygonOffsetFactor: -3,
                  polygonOffsetUnits: -6,
                }),
              );
              const fadeMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7.62, 4.76)), fadeMaterial);
              fadeMesh.position.z = 0.19;
              fadeMesh.name = `ui-live-${stage.index}`;
              stage.group.add(fadeMesh);
              const reflectionMaterial = track(
                new THREE.MeshBasicMaterial({
                  map: texture,
                  transparent: true,
                  opacity: 0,
                  toneMapped: false,
                  fog: false,
                  depthWrite: false,
                }),
              );
              const reflection = new THREE.Mesh(track(new THREE.PlaneGeometry(7.62, 4.76)), reflectionMaterial);
              reflection.scale.y = -1;
              reflection.position.set(0, -5.6, 0.19);
              stage.group.add(reflection);
              stage.fadeMaterial = fadeMaterial;
              stage.reflectionMaterial = reflectionMaterial;
              stage.screenFade = 0;
              if (scrollProgress.reducedMotion) settlePlate(stage);
            },
            undefined,
            () => {
              /* The average-color plate stays. */
            },
          );
        });
      };
      stopTextures = watchVentureTextures(loadTextures);
    };

    void mount();

    return () => {
      cancelled = true;
      stopTextures();
      stages.current = [];
      parent.clear();
      disposables.forEach((item) => item.dispose());
    };
  }, [gl]);

  useFrame((_, delta) => {
    const node = root.current;
    if (!node) return;
    const calmMotion = scrollProgress.reducedMotion;
    stages.current.forEach((stage) => {
      if (!stage.fadeMaterial || stage.screenFade >= 1) return;
      const next = calmMotion ? 1 : Math.min(1, stage.screenFade + delta / duration.ui);
      if (next < 1) {
        stage.screenFade = next;
        stage.fadeMaterial.opacity = next;
        if (stage.reflectionMaterial) stage.reflectionMaterial.opacity = 0.1 * next;
        return;
      }
      settlePlate(stage);
    });
    const { internal, presentation } = readClock(scrollProgress.smoothed);
    node.visible = internal > 9.5 && internal < 18.3;
    if (!node.visible) return;
    const calm = scrollProgress.reducedMotion;
    stages.current.forEach((stage) => {
      const span = ventureWindow(stage.index);
      if (!span) return;
      const [a, b] = span;
      const presence = venturePresence(internal, stage.index);
      stage.halo.opacity = 0.12 + presence * 0.4;
      stage.keyLight.intensity = presence * 14;
      stage.accentLights.forEach((light, index) => {
        light.intensity = presence * (index === 0 ? 7 : 4.5);
      });
      const bob = calm ? 0 : Math.sin(internal * 1.1 + stage.index) * 0.05;
      stage.group.position.set(stage.anchor.x, stage.anchor.y + bob, stage.anchor.z);
      stage.group.rotation.y = (1 - presence) * 0.14 * (stage.index % 2 ? 1 : -1);
      if (stage.screen) {
        const scrolled = ventureScroll(internal, stage.index);
        stage.screen.offset.y = (1 - UI_REPEAT_Y) * (1 - scrolled * 0.86);
      }
      if (stage.sheen && !calm) {
        stage.sheen.offset.x = -1 + (((presentation - a) * 0.3) % 2);
      }
      const mirrored = document.documentElement.dir === "rtl";
      stage.chips.forEach((chip, index) => {
        const point = CHIP_AT[index];
        if (!point) return;
        const enter = eback(seg(internal, a + 0.05 + index * 0.12, a + 0.45 + index * 0.12));
        const leave = 1 - seg(internal, b + 0.15, b + 0.45);
        const lift = calm ? 0 : Math.sin(internal * 2 + index) * 0.05;
        chip.position.set(mirrored ? -point[0] : point[0], point[1] + lift, point[2]);
        chip.scale.setScalar(Math.max(0.001, enter * leave));
        chip.rotation.y = mirrored ? 0.12 : -0.12;
      });
      stage.cells.forEach((cell, index) => {
        const lift = calm ? 0 : Math.sin(internal * 1.7 + index) * 0.045;
        cell.group.position.y = cell.baseY + lift;
        cell.group.position.x = mirrored ? -cell.baseX : cell.baseX;
        cell.core.opacity = 0.62 + presence * 0.3 + (calm ? 0 : Math.sin(internal * 3 + index) * 0.08);
      });
      if (stage.chart) stage.chart.opacity = 0.22 + presence * 0.62;
      stage.nodes.forEach((nodeMaterial, index) => {
        nodeMaterial.opacity = 0.45 + presence * 0.5 + (calm ? 0 : Math.sin(internal * 2.4 + index) * 0.12);
      });
    });
  });

  return <group ref={root} name="act-3-ventures" />;
}
