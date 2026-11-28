"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "@/context/LanguageContext";
import { scrollProgress } from "@/lib/scrollProgress";
import { AmberStoryteller } from "../AmberStoryteller";
import { readClock } from "../cinema";
import { ExtrudedWord } from "./ExtrudedWord";
import { chromeMetal } from "./metals";

/** Reference arch footprint: height 6.1, plate 1200×1700, sitting at (3.75, −0.15). */
const PORTRAIT_H = 6.1;
const PORTRAIT_W = PORTRAIT_H * (1200 / 1700);
const HERO_WIDTH = 7.3;

const eo5 = (x: number) => 1 - (1 - x) ** 5;
const eo = (x: number) => 1 - (1 - x) ** 3;
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  context.save();
  context.translate(256, 330);
  context.scale(0.78, 1);
  context.translate(-256, -330);
  const gradient = context.createRadialGradient(256, 300, 28, 256, 340, 300);
  gradient.addColorStop(0, "rgba(255,196,90,0.78)");
  gradient.addColorStop(0.2, "rgba(92,54,16,0.7)");
  gradient.addColorStop(0.46, "rgba(14,12,16,0.62)");
  gradient.addColorStop(0.74, "rgba(5,7,12,0.2)");
  gradient.addColorStop(1, "rgba(5,7,12,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 720);
  context.restore();
  texture.needsUpdate = true;
  return texture;
}

/** Frameless studio cut-out. Soft edge, no border, no invented face. */
function maskPortrait(image: CanvasImageSource) {
  const width = 1024;
  const height = 1450;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  context.drawImage(image, 0, 0, width, height);
  context.globalCompositeOperation = "destination-in";
  const radial = context.createRadialGradient(width / 2, height * 0.42, height * 0.16, width / 2, height * 0.46, height * 0.58);
  radial.addColorStop(0, "rgba(0,0,0,1)");
  radial.addColorStop(0.7, "rgba(0,0,0,0.92)");
  radial.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = radial;
  context.fillRect(0, 0, width, height);
  const fade = context.createLinearGradient(0, height * 0.7, 0, height);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = fade;
  context.fillRect(0, height * 0.68, width, height * 0.32);
  texture.needsUpdate = true;
  return texture;
}

function ChromeMaterial() {
  return (
    <meshPhysicalMaterial
      color={chromeMetal.color}
      metalness={1}
      roughness={0.16}
      clearcoat={1}
      clearcoatRoughness={0.1}
      envMapIntensity={2.2}
    />
  );
}

function GoldMaterial() {
  return (
    <meshPhysicalMaterial
      color="#FFC24D"
      metalness={1}
      roughness={0.2}
      clearcoat={0.8}
      emissive="#B86A00"
      emissiveIntensity={0.55}
      envMapIntensity={2}
    />
  );
}

/** Frameless portrait slot, extruded Bebas name, and the storyteller gem. */
export function Act1Hero() {
  const glow = useMemo(() => glowTexture(), []);
  const stage = useRef<THREE.Group>(null);
  const portrait = useRef<THREE.Group>(null);
  const saeed = useRef<THREE.Group>(null);
  const mahjobi = useRef<THREE.Group>(null);
  const scaleRef = useRef(1.12);
  const { locale } = useLanguage();
  const width = useThree((state) => state.size.width);
  const [portraitMap, setPortraitMap] = useState<THREE.Texture | null>(null);

  const onMahjobi = useCallback((natural: number) => {
    scaleRef.current = HERO_WIDTH / Math.max(natural, 0.001);
  }, []);

  useEffect(() => {
    if (document.body.dataset.portrait !== "ready") return;
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      "/portrait/saeed.png",
      (texture) => {
        const masked = maskPortrait(texture.image as CanvasImageSource);
        texture.dispose();
        if (!alive) {
          masked.dispose();
          return;
        }
        setPortraitMap(masked);
      },
      undefined,
      () => {
        /* Glow only until the studio file is present. */
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      portraitMap?.dispose();
    };
  }, [portraitMap]);

  useFrame(() => {
    const node = stage.current;
    if (!node || !portrait.current || !saeed.current || !mahjobi.current) return;
    const { internal, presentation } = readClock(scrollProgress.smoothed);
    node.visible = internal < 5.2;
    if (!node.visible) return;

    const showType = locale === "en" && width >= 768;
    saeed.current.visible = showType;
    mahjobi.current.visible = showType;
    const scale = scaleRef.current;
    saeed.current.scale.setScalar(scale);
    mahjobi.current.scale.setScalar(scale);

    const sa = eo5(seg(internal, 0.1, 1.1));
    saeed.current.position.set(-6.9, lerp(-4, 1.35, sa), -0.4);
    saeed.current.rotation.set(lerp(-1.1, 0, sa), Math.sin(internal * 0.6) * 0.04, 0);
    const ma = eo5(seg(internal, 0.35, 1.35));
    mahjobi.current.position.set(-6.9, lerp(-6, -0.7, ma), -0.4);
    mahjobi.current.rotation.set(lerp(-1.1, 0, ma), Math.sin(internal * 0.6) * 0.04, 0);

    const rise = eo(seg(internal, 0.2, 1.2));
    portrait.current.position.set(3.75, lerp(-0.7, -0.15, rise), 0);
    portrait.current.rotation.y = -0.1 + Math.sin(presentation * 0.5) * 0.03;
    portrait.current.scale.setScalar(0.92 + rise * 0.08);
  });

  return (
    <group name="act-1-hero">
      <group ref={stage}>
        <group ref={saeed} position={[-6.9, 1.35, -0.4]}>
          <ExtrudedWord text="SAEED" size={2.2} depth={0.55} trackingEm={0.06} curveSegments={6}>
            <ChromeMaterial />
          </ExtrudedWord>
        </group>
        <group ref={mahjobi} position={[-6.9, -0.7, -0.4]}>
          <ExtrudedWord text="MAHJOBI" size={2.2} depth={0.55} trackingEm={0.06} curveSegments={6} onWidth={onMahjobi}>
            <GoldMaterial />
          </ExtrudedWord>
        </group>
        <group ref={portrait} name="portrait-slot" position={[3.75, -0.15, 0]} rotation={[0, -0.1, 0]}>
          <mesh position={[0, 0.15, -0.55]}>
            <planeGeometry args={[PORTRAIT_W * 1.35, PORTRAIT_H * 1.22]} />
            <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          {portraitMap ? (
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[PORTRAIT_W, PORTRAIT_H]} />
              <meshBasicMaterial map={portraitMap} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ) : null}
        </group>
      </group>
      <AmberStoryteller />
    </group>
  );
}
