"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ACT_LIGHTS, actHandoff } from "@/lib/actHandoff";
import { sceneQuality } from "@/lib/performanceTier";
import { scrollProgress } from "@/lib/scrollProgress";
import {
  STAGE_ACCENTS,
  WORLD,
  atmosphereAt,
  createStarPositions,
  readClock,
  stageNebulaOpacity,
  stageWorld,
} from "./cinema";

const REST_KEY = "#fff1dc";
const REST_KEY_INTENSITY = 1.6;
const REST_HEMI = "#c9d4ff";
const RIG_INTENSITY = [2.2, 2.4, 1.4] as const;

type NebulaRecord = {
  mesh: THREE.Mesh;
  stage: number | null;
  opacity: number;
};

type AtmosphereRuntime = {
  fog: THREE.FogExp2;
  hemi: THREE.HemisphereLight;
  key: THREE.DirectionalLight;
  rigs: THREE.DirectionalLight[];
  nebulas: NebulaRecord[];
  from: THREE.Color;
  to: THREE.Color;
  shifted: boolean;
  scratchA: THREE.Color;
  scratchB: THREE.Color;
  restHemi: THREE.Color;
};

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

function dotTexture(fill: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (!context) return texture;
  context.fillStyle = fill;
  context.fillRect(0, 0, 256, 256);
  context.fillStyle = "rgba(255,255,255,.16)";
  for (let i = 0; i < 8; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      context.beginPath();
      context.arc(16 + i * 32, 16 + j * 32, 1.6, 0, Math.PI * 2);
      context.fill();
    }
  }
  texture.needsUpdate = true;
  return texture;
}

export function ObsidianAtmosphere() {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const runtime = useRef<AtmosphereRuntime | null>(null);

  useEffect(() => {
    const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
    const nebulas: NebulaRecord[] = [];
    const objects: THREE.Object3D[] = [];
    const previousBackground = scene.background;
    const previousFog = scene.fog;
    const previousEnvironment = scene.environment;

    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.55;
    scene.background = new THREE.Color("#05070C");
    const fog = new THREE.FogExp2("#05070C", 0.02);
    scene.fog = fog;

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(createStarPositions(), 3));
    const starMaterial = new THREE.PointsMaterial({
      color: "#cfd8ff",
      size: 0.06,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      fog: false,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    objects.push(stars);
    disposables.push(starGeometry, starMaterial);

    const hemi = new THREE.HemisphereLight(REST_HEMI, "#1a1208", 0.5);
    const key = new THREE.DirectionalLight(REST_KEY, REST_KEY_INTENSITY);
    key.position.set(-6, 10, 8);
    scene.add(hemi, key, key.target);
    objects.push(hemi, key, key.target);
    const rigs: THREE.DirectionalLight[] = [];

    const addFloor = (width: number, height: number, fill: string, position: THREE.Vector3) => {
      const texture = dotTexture(fill);
      texture.repeat.set(width / 1.2, height / 1.2);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: "#383838",
        roughness: 0.5,
        metalness: 0.35,
        envMapIntensity: 0.1,
      });
      const geometry = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(position);
      scene.add(mesh);
      objects.push(mesh);
      disposables.push(geometry, material, texture);
    };

    const stageMid = stageWorld(2.5);
    addFloor(60, 40, "#0A0D14", new THREE.Vector3(0, -3.6, -4));
    addFloor(140, 140, "#070B13", new THREE.Vector3(WORLD.c2.x, -2.6, WORLD.c2.z));
    addFloor(420, 220, "#06080D", new THREE.Vector3(stageMid.x, -3.3, stageMid.z));
    addFloor(80, 80, "#07090E", new THREE.Vector3(WORLD.arena.x, WORLD.arena.y - 2.2, WORLD.arena.z));
    addFloor(60, 40, "#080C15", new THREE.Vector3(WORLD.finale.x, WORLD.finale.y - 3.4, WORLD.finale.z));

    const addNebula = (
      position: THREE.Vector3,
      color: string,
      size: number,
      opacity: number,
      stage: number | null,
    ) => {
      const texture = radialTexture(color);
      const material = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        map: texture,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
      });
      const geometry = new THREE.PlaneGeometry(size, size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      scene.add(mesh);
      objects.push(mesh);
      nebulas.push({ mesh, stage, opacity });
      disposables.push(geometry, material, texture);
    };

    (
      [
        [new THREE.Vector3(-6, 4, -18), "#F59E0B", 30, 0.22],
        [new THREE.Vector3(10, -2, -22), "#38BDF8", 34, 0.12],
        [WORLD.c2.clone().add(new THREE.Vector3(-14, 6, -20)), "#38BDF8", 44, 0.2],
        [WORLD.c2.clone().add(new THREE.Vector3(16, 2, -14)), "#F59E0B", 36, 0.14],
        [WORLD.c2.clone().add(new THREE.Vector3(0, -2, 18)), "#10B981", 40, 0.1],
        [WORLD.arena.clone().add(new THREE.Vector3(-9, 4, -14)), "#F59E0B", 34, 0.22],
        [WORLD.arena.clone().add(new THREE.Vector3(10, 3, -12)), "#10B981", 30, 0.16],
        [WORLD.arena.clone().add(new THREE.Vector3(0, 8, -20)), "#38BDF8", 40, 0.08],
        [WORLD.finale.clone().add(new THREE.Vector3(-6, 3, -14)), "#F59E0B", 36, 0.26],
        [WORLD.finale.clone().add(new THREE.Vector3(9, -1, -12)), "#10B981", 26, 0.12],
      ] as const
    ).forEach(([position, color, size, opacity]) => {
      addNebula(position, color, size, opacity, null);
    });
    STAGE_ACCENTS.forEach((color, index) => {
      addNebula(stageWorld(index).add(new THREE.Vector3(1, 1.5, -9)), color, 26, 0, index);
    });

    const addRig = (color: string, intensity: number, offset: THREE.Vector3) => {
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.copy(WORLD.arena).add(offset);
      light.target.position.copy(WORLD.arena);
      scene.add(light, light.target);
      objects.push(light, light.target);
      rigs.push(light);
    };
    addRig("#fff3e0", RIG_INTENSITY[0], new THREE.Vector3(-3, 7, 9));
    addRig("#FFB547", RIG_INTENSITY[1], new THREE.Vector3(4, 5, -8));
    addRig("#38BDF8", RIG_INTENSITY[2], new THREE.Vector3(-6, 3, -6));

    runtime.current = {
      fog,
      hemi,
      key,
      rigs,
      nebulas,
      from: new THREE.Color(),
      to: new THREE.Color(),
      shifted: false,
      scratchA: new THREE.Color(),
      scratchB: new THREE.Color(),
      restHemi: new THREE.Color(REST_HEMI),
    };

    return () => {
      runtime.current = null;
      objects.forEach((object) => scene.remove(object));
      disposables.forEach((item) => item.dispose());
      environment.dispose();
      pmrem.dispose();
      scene.background = previousBackground;
      scene.fog = previousFog;
      scene.environment = previousEnvironment;
    };
  }, [gl, scene]);

  useFrame(({ camera }) => {
    const live = runtime.current;
    if (!live) return;
    const { internal } = readClock(scrollProgress.smoothed);
    const sky = atmosphereAt(internal);
    live.from.set(sky.from);
    live.to.set(sky.to);
    live.from.lerp(live.to, sky.mix);
    if (scene.background instanceof THREE.Color) scene.background.copy(live.from);
    live.fog.color.copy(live.from);
    live.fog.density = sky.density;
    live.hemi.intensity = sky.hemi;

    const handoff = actHandoff(scrollProgress.smoothed, scrollProgress.reducedMotion);
    const cinematic = handoff.pulse > 0.001 && !handoff.reduced;
    if (!cinematic && live.shifted) {
      live.key.color.set(REST_KEY);
      live.key.intensity = REST_KEY_INTENSITY;
      live.hemi.color.copy(live.restHemi);
      live.rigs.forEach((light, index) => {
        light.intensity = RIG_INTENSITY[index] ?? light.intensity;
      });
      live.shifted = false;
    }
    if (cinematic) {
      const fromLight = ACT_LIGHTS[handoff.from] ?? ACT_LIGHTS[0];
      const toLight = ACT_LIGHTS[handoff.to] ?? ACT_LIGHTS[0];
      const mix = handoff.mix;
      const pulse = handoff.pulse;
      live.scratchA.set(fromLight.key).lerp(live.scratchB.set(toLight.key), mix);
      live.key.color.set(REST_KEY).lerp(live.scratchA, pulse);
      const keyIntensity = fromLight.keyIntensity + (toLight.keyIntensity - fromLight.keyIntensity) * mix;
      live.key.intensity = REST_KEY_INTENSITY + (keyIntensity - REST_KEY_INTENSITY) * pulse;
      live.scratchA.set(fromLight.fog).lerp(live.scratchB.set(toLight.fog), mix);
      live.fog.color.copy(live.from).lerp(live.scratchA, pulse);
      const presetDensity = fromLight.fogDensity + (toLight.fogDensity - fromLight.fogDensity) * mix;
      let density = sky.density + (presetDensity - sky.density) * pulse;
      if (sceneQuality.tier !== "low" && !sceneQuality.degraded) density *= 1 + 0.38 * pulse;
      live.fog.density = density;
      if (scene.background instanceof THREE.Color) scene.background.copy(live.fog.color);
      live.scratchA.set(fromLight.hemi).lerp(live.scratchB.set(toLight.hemi), mix);
      live.hemi.color.copy(live.restHemi).lerp(live.scratchA, pulse);
      const hemiIntensity = fromLight.hemiIntensity + (toLight.hemiIntensity - fromLight.hemiIntensity) * mix;
      live.hemi.intensity = sky.hemi + (hemiIntensity - sky.hemi) * pulse;
      const rigScale = 1 + 0.14 * Math.sin(Math.PI * mix) * pulse;
      live.rigs.forEach((light, index) => {
        light.intensity = (RIG_INTENSITY[index] ?? light.intensity) * rigScale;
      });
      live.shifted = true;
    }
    live.nebulas.forEach((record) => {
      const material = record.mesh.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity =
          record.stage === null ? record.opacity : stageNebulaOpacity(internal, record.stage);
        record.mesh.visible = material.opacity > 0.012;
      }
      record.mesh.quaternion.copy(camera.quaternion);
    });
  });

  return (
    <>
      <color attach="background" args={["#05070C"]} />
      <fogExp2 attach="fog" args={["#05070C", 0.02]} />
    </>
  );
}
