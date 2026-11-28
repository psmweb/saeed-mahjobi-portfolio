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
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: true });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!context) return texture;
  context.clearRect(0, 0, size, size);
  // Fade out inside the canvas so the plane's square edge stays fully clear.
  const radius = size * 0.38;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, radius);
  gradient.addColorStop(0, "rgba(255,196,90,0.5)");
  gradient.addColorStop(0.45, "rgba(92,54,16,0.18)");
  gradient.addColorStop(0.78, "rgba(20,12,6,0.04)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
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
    const saY = lerp(-4, 1.35, sa);
    saeed.current.position.set(-6.9, saY, -0.4);
    saeed.current.rotation.set(lerp(-1.1, 0, sa), Math.sin(internal * 0.6) * 0.04, 0);
    // The opening pose sits in the subtitle band as thin highlights. Keep it off until it has risen.
    saeed.current.visible = showType && saY > -1.5;
    const ma = eo5(seg(internal, 0.35, 1.35));
    const maY = lerp(-6, -0.7, ma);
    mahjobi.current.position.set(-6.9, maY, -0.4);
    mahjobi.current.rotation.set(lerp(-1.1, 0, ma), Math.sin(internal * 0.6) * 0.04, 0);
    mahjobi.current.visible = showType && maY > -1.8;

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
            <meshBasicMaterial
              map={glow}
              transparent
              depthWrite={false}
              toneMapped={false}
              fog={false}
              blending={THREE.AdditiveBlending}
            />
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
