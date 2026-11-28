"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ARENA_ROLES } from "@/data/agents";
import { scrollProgress } from "@/lib/scrollProgress";
import { WORLD, finalePortrait, finaleRobotPop, readClock } from "../cinema";
import { createRobotKit, poseRobot, type RobotRig } from "./act4Robot";

type Runtime = {
  robots: RobotRig[];
  portrait: THREE.Group;
  halo: THREE.MeshBasicMaterial;
  spot: THREE.MeshBasicMaterial;
  stage: THREE.Group;
  glow: THREE.PointLight;
};

function radialAmber() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  const gradient = context.createRadialGradient(128, 118, 8, 128, 128, 124);
  gradient.addColorStop(0, "rgba(255,210,122,0.95)");
  gradient.addColorStop(0.28, "rgba(245,158,11,0.45)");
  gradient.addColorStop(1, "rgba(245,158,11,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  texture.needsUpdate = true;
  return texture;
}

function axis(x: number, mirrored: boolean) {
  return mirrored ? -x : x;
}

/** Command-center settle: frameless glow, gold stage, and the five agents. */
export function Act5Finale() {
  const root = useRef<THREE.Group>(null);
  const runtime = useRef<Runtime | null>(null);

  useEffect(() => {
    const parent = root.current;
    if (!parent) return;
    parent.position.copy(WORLD.finale);
    const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
    const kit = createRobotKit();
    const haloMap = radialAmber();
    disposables.push(haloMap);

    const halo = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      map: haloMap,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const spot = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      map: haloMap,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const obsidian = new THREE.MeshPhysicalMaterial({
      color: "#0C0E14",
      metalness: 0.55,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const edge = new THREE.MeshBasicMaterial({
      color: "#F2B544",
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    disposables.push(halo, spot, obsidian, edge);

    const portrait = new THREE.Group();
    const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), halo);
    haloMesh.position.set(0, 0.55, -1);
    const spotMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 4.45), spot);
    spotMesh.position.set(0, 0.35, 0);
    portrait.add(haloMesh, spotMesh);
    disposables.push(haloMesh.geometry, spotMesh.geometry);
    parent.add(portrait);

    const stage = new THREE.Group();
    const deck = new THREE.Mesh(new RoundedBoxGeometry(7.6, 0.16, 1.8, 3, 0.06), obsidian);
    deck.position.set(2.5, -3, 0.9);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.02, 0.02), edge);
    lip.position.set(2.5, -2.92, 1.82);
    stage.add(deck, lip);
    disposables.push(deck.geometry, lip.geometry);
    parent.add(stage);

    const glow = new THREE.PointLight("#FFB347", 0, 16, 2);
    glow.position.set(-2.2, 1.5, 2.2);
    parent.add(glow);

    const robots = ARENA_ROLES.map((role, index) => {
      const rig = kit.make(role.color, role.prop, `finale-${role.id}`);
      rig.root.visible = false;
      rig.root.position.set(-0.3 + index * 1.4, -2, 0.9);
      parent.add(rig.root);
      return rig;
    });

    runtime.current = { robots, portrait, halo, spot, stage, glow };

    return () => {
      runtime.current = null;
      parent.clear();
      kit.dispose();
      disposables.forEach((item) => item.dispose());
    };
  }, []);

  useFrame(({ clock, size }) => {
    const node = root.current;
    const live = runtime.current;
    if (!node || !live) return;
    const internal = readClock(scrollProgress.smoothed).internal;
    const reduced = scrollProgress.reducedMotion;
    const visible = internal > 23.4;
    node.visible = visible;
    if (!visible) return;

    const narrow = size.width / Math.max(size.height, 1) < 1;
    const mirrored = document.documentElement.dir === "rtl";
    const reveal = reduced ? 1 : finalePortrait(internal);
    const time = clock.elapsedTime;
    const portraitX = narrow ? -1.7 : -5 + reveal;
    live.portrait.position.x = axis(portraitX, mirrored);
    live.portrait.position.y = narrow ? 0.35 : -0.2;
    live.portrait.rotation.y = (reduced ? 0.12 : 0.12 + Math.sin(time * 0.5) * 0.03) * (mirrored ? -1 : 1);
    live.halo.opacity = 0.42 * reveal;
    live.spot.opacity = narrow ? reveal * 0.72 : reveal;
    live.glow.intensity = (narrow ? 12 : 18) * reveal;
    live.glow.position.x = axis(narrow ? -1.2 : -2.2, mirrored);
    const sign = mirrored ? -1 : 1;
    const stageScale = narrow ? 0.5 : 1;
    live.stage.scale.set(stageScale * sign, 1, narrow ? 0.85 : 1);
    live.stage.position.x = narrow ? -2.5 * stageScale * sign : 0;
    live.stage.position.y = narrow ? 0.55 : 0;

    const span = narrow ? 0.78 : 1.4;
    const start = narrow ? -2 * span : -0.3;
    live.robots.forEach((rig, index) => {
      const pop = reduced ? 1 : finaleRobotPop(internal, index);
      rig.root.visible = pop > 0.02;
      rig.root.scale.setScalar(Math.max(0.001, (narrow ? 0.62 : 0.82) * pop));
      rig.root.position.x = axis(start + index * span, mirrored);
      rig.root.position.y = narrow ? -1.85 : -2;
      rig.root.position.z = narrow ? 0.35 : 0.9;
      rig.root.rotation.y = (reduced ? -0.15 : Math.sin(time * 0.9 + index) * 0.3 - 0.15) * (mirrored ? -1 : 1);
      poseRobot(rig, reduced ? 0 : time, {
        phase: index * 1.1,
        raise: 0,
        forward: 0,
        jump: 0,
        happy: true,
        wave: index === 2 && internal > 25.6,
        floor: -2.9,
        look: 0,
        nod: 0,
        calm: reduced,
      });
    });
  });

  return <group ref={root} name="act-5-finale" visible={false} />;
}
